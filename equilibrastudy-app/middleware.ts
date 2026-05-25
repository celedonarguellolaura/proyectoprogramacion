import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_PAGES = ['/login', '/register'];
const ADMIN_PATHS = ['/admin'];

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? '';
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Las API routes manejan su propia autenticación
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  let user: { role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      user = { role: payload.role as string };
    } catch {
      // Token inválido o expirado
    }
  }

  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Autenticado en página de auth → ir al dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // No autenticado en página protegida → ir al login
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Ruta de admin para no-admin → ir al dashboard
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminPath && user?.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getUserById } from '@/lib/dataService';

export async function GET(request: NextRequest) {
  const jwtUser = await getAuthUser(request);
  if (!jwtUser) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const user = await getUserById(jwtUser.sub);
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

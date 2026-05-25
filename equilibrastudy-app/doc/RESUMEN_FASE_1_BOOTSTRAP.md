# Resumen Fase 1 — Bootstrap, Login, Registro y dataService base

## Objetivo
Sistema de autenticación funcionando. El estudiante puede registrarse y hacer login con cookie HttpOnly. El modo del sistema retorna `seed`.

## Estado Final
**EXITOSO** — `npm run typecheck` → 0 errores

---

## Acciones Ejecutadas

1. Creado `doc/PLAN_EQUILIBRASTUDY.md` (plan maestro completo con todas las secciones referenciadas en los prompts)
2. Creado `doc/ESTADO_EJECUCION_EQUILIBRASTUDY.md` (archivo de seguimiento de fases)
3. Actualizado `package.json` — nuevo nombre `equilibrastudy`, script `typecheck`, dependencias nuevas
4. Actualizado `tsconfig.json` — target ES2022, allowJs: false, strict: true
5. Actualizado `next.config.js` — eliminado `experimental.appDir` (deprecated en Next.js 14)
6. Actualizado `tailwind.config.ts` — paleta Pastel Vibrante como colores de Tailwind

---

## Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `lib/types.ts` | Todos los tipos TypeScript del sistema (User, AcademicEvent, StudySession, etc.) |
| `lib/supabase.ts` | Cliente Supabase lazy singleton (server-side only) |
| `lib/blobAudit.ts` | getBlobToken() lazy + withFileLock + appendAuditEntry |
| `lib/auth.ts` | signToken, verifyToken, setAuthCookie, clearAuthCookie, getAuthUser, getServerUser |
| `middleware.ts` | Protección de rutas por autenticación y rol |
| `app/api/auth/register/route.ts` | POST — registro público de estudiante |
| `app/api/auth/login/route.ts` | POST — login con cookie HttpOnly |
| `app/api/auth/logout/route.ts` | POST — logout (limpia cookie) |
| `app/api/auth/me/route.ts` | GET — datos del usuario autenticado |
| `app/api/system/mode/route.ts` | GET — retorna `{ mode: 'seed' | 'live' }` |
| `app/(auth)/layout.tsx` | Layout centrado para páginas de auth |
| `app/(auth)/login/page.tsx` | Página de login (Pastel Vibrante) |
| `app/(auth)/register/page.tsx` | Página de registro (Pastel Vibrante) |
| `app/(app)/layout.tsx` | Layout base de la app (placeholder para Fase 2) |
| `app/(app)/dashboard/page.tsx` | Dashboard placeholder |
| `.env.local` | Template de variables de entorno |

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `lib/dataService.ts` | Reescrito completamente — toda la API pública del plan |
| `lib/types.ts` | Reescrito — tipos de EquilibraStudy |
| `lib/validators.ts` | Vaciado (Zod legacy del proyecto anterior) |
| `app/globals.css` | Variables CSS Pastel Vibrante, fondo blanco, Inter font |
| `app/layout.tsx` | Inter 500 via next/font, metadata de EquilibraStudy |
| `app/page.tsx` | Redirige a /dashboard |
| `app/api/config/route.ts` | Stub 404 (legacy del proyecto anterior) |
| `app/api/data/route.ts` | Stub 404 (legacy del proyecto anterior) |
| `components/HolaMundo.tsx` | Fix: CSSProperties importado correctamente |
| `components/AnimatedText.tsx` | Fix: ease array tipado como `[number, number, number, number]` |

---

## Decisiones Técnicas

### Autenticación custom (JWT + HttpOnly cookie)
Se usa `jose` para firmar/verificar JWT en lugar de Supabase Auth. Esto da control total sobre el payload (id, email, role, name) y la duración (7 días).

### dataService como única capa de acceso
`lib/dataService.ts` importa `supabase.ts` y `blobAudit.ts`. Ningún otro módulo importa esos directamente. Esto centraliza el acceso a datos y facilita el testing.

### getBlobToken() como función lazy
El token de Vercel Blob se accede solo cuando se necesita, no al nivel de módulo. Esto evita errores en build time cuando las variables de entorno no existen.

### Supabase con Service Role Key
Se usa `SUPABASE_SERVICE_ROLE_KEY` (no la anon key) en el servidor para tener acceso completo sin restricciones de RLS. Esto es seguro porque el cliente Supabase solo existe en el servidor.

### Rol hardcodeado en registro
`createUser()` en `dataService.ts` siempre asigna `role: 'estudiante'`. El cliente NUNCA puede enviar el rol — cumple RS-01.

### Middleware en Edge runtime
El `middleware.ts` usa `jose` directamente (sin importar `lib/auth.ts`) porque la middleware de Next.js corre en Edge runtime. `jose` funciona en ambos runtimes; `next/headers` (usado en `auth.ts`) solo funciona en Node.js runtime.

---

## Problemas Encontrados y Resolución

| Problema | Resolución |
|----------|------------|
| `components/HolaMundo.tsx` usaba `React.CSSProperties` sin importar React | Cambiado a `import { CSSProperties }` de react |
| `components/AnimatedText.tsx` tenía `ease: number[]` incompatible con framer-motion v12 | Añadido `as [number, number, number, number]` |
| `tailwindcss` no estaba en devDependencies del package.json reescrito | Añadido tailwindcss, autoprefixer, postcss a devDependencies |
| `lib/validators.ts` importaba `zod` (removido) | Reemplazado con `export {}` |
| Rutas legacy `/api/config` y `/api/data` importaban funciones removidas de dataService | Reemplazadas con stubs 404 |

---

## Qué se Probó y Resultado

- `npm run typecheck` → 0 errores ✅
- Archivos creados y verificados en el filesystem ✅

**Pendiente de prueba manual** (requiere `.env.local` con credenciales reales de Supabase):
- Registro de nuevo estudiante → cuenta activa → login → cookie HttpOnly verificada en DevTools
- `/api/system/mode` retorna `{ mode: 'seed' }`

---

## Prerrequisitos para la Fase 2

1. **Configurar `.env.local`** con las credenciales reales de Supabase, JWT_SECRET y BLOB_READ_WRITE_TOKEN
2. **Crear las tablas en Supabase** ejecutando las migrations del plan (SQL en secciones 15 del plan):
   - `users` (migration 0001)
   - `system_config` (tabla adicional: `CREATE TABLE system_config (key VARCHAR(50) PRIMARY KEY, value TEXT NOT NULL)`)
3. Verificar el flujo de registro → login → cookie antes de avanzar
4. La Fase 2 construye el sidebar completo, el dashboard real y la página de bootstrap

---

*Fase 1 completada — Laura Celedon · Doc: 1128201459 · SIST0200*

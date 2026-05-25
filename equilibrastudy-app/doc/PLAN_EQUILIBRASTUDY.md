# PLAN EQUILIBRASTUDY
## Sistema de Bienestar Académico Estudiantil

> **Estudiante:** Laura Celedon · Doc: 1128201459
> **Curso:** Lógica y Programación · SIST0200
> **Metodología:** Entrega incremental por fases, cada una produce un entregable funcional

---

## 1. Visión General del Proyecto

EquilibraStudy es una aplicación web que **mide el tiempo de estudio real** de un estudiante y cuida su bienestar cognitivo. Los datos del usuario (sesiones, fatiga, metas) son profundamente personales y la arquitectura garantiza que sean completamente privados y siempre accesibles.

**Promesa central:** equilibrio real entre productividad y bienestar. El sistema ayuda al estudiante a estudiar mejor, no más.

---

## 2. Requerimientos Funcionales (RF)

| ID | Descripción |
|----|-------------|
| RF-01 | Registro público de estudiante (rol asignado automáticamente: `estudiante`) |
| RF-02 | Login con cookie HttpOnly + JWT |
| RF-03 | Dashboard con resumen diario y evento urgente más próximo |
| RF-04 | Calendario académico con eventos de alta/media/baja prioridad |
| RF-05 | Zona de Enfoque (Pomodoro) con sugerencia inteligente |
| RF-06 | Alerta sonora al completar timer (Web Audio API) |
| RF-07 | Selector de fatiga post-sesión (5 niveles con íconos) |
| RF-08 | Analytics con vistas diaria/semanal/mensual |
| RF-09 | Meta semanal de horas de estudio con barra de progreso |
| RF-10 | Exportación PDF mensual (sesiones + resumen) |
| RF-11 | Perfil: editar nombre, cambiar contraseña, meta semanal |
| RF-12 | Administración: listar usuarios, activar/suspender, ver auditoría |
| RF-13 | Bootstrap de base de datos (super admin) |

---

## 3. Restricciones del Sistema

| ID | Restricción |
|----|-------------|
| RS-01 | El cliente NUNCA envía el rol en el body del registro |
| RS-02 | Web Audio API requiere interacción previa del usuario en iOS Safari |
| RS-03 | El super admin NO puede ver sesiones individuales ni eventos académicos de estudiantes |
| RS-04 | dataService.ts es el ÚNICO archivo que importa supabase.ts y blobAudit.ts |
| RS-05 | Ningún componente cliente importa módulos de lib/ directamente |

---

## 4. Reglas de Negocio (RN)

### RN-01 — Bloqueo por estudio continuo
Al cargar `/focus`, el servidor calcula los minutos de estudio continuo del día:
- Se recorren las sesiones del día ordenadas por `ended_at DESC`
- Cuando se encuentra un gap ≥ 15 min entre el final de una sesión y el inicio de la siguiente, se detiene
- Si el total acumulado antes del gap ≥ 120 min → mostrar `BlockedState`
- Implementación: `sessionService.getContinuousStudyMinutes(userId)`

### RN-02 — Validación de descanso mínimo
El servidor valida: `break_min >= Math.floor(work_min / 25) * 5`
- 25 min trabajo → mínimo 5 min descanso
- 50 min trabajo → mínimo 10 min descanso
- Esta validación ocurre en el servidor, no en el cliente

### RN-03 — Rol fijo en registro
El registro público asigna siempre `role = 'estudiante'`. El `super_admin` solo puede crearse mediante seed o bootstrap manual.

### RN-04 — Evaluación de efectividad de sesión (SE EVALÚA EN EL SERVIDOR)
El cliente envía `pause_count_over_1min` (pausas > 1 minuto) al finalizar la sesión.
```
evaluateSessionStatus(pause_count_over_1min, work_duration_min):
  si pause_count_over_1min <= 2:
    status = 'completada'
    effective_minutes = work_duration_min
  si pause_count_over_1min > 2:
    status = 'incompleta'
    effective_minutes = 0
```
Las sesiones incompletas NO suman al progreso semanal.

### RN-05 — Sugerencia inteligente de sesión
```
getSmartSuggestion(userId):
  urgentEvents = getUrgentEvents(userId)
  si urgentEvents.length > 0:
    return { work_min: 50, break_min: 10, reason: "Tienes [nombre] en Xh" }
  sino:
    return { work_min: 25, break_min: 5, reason: null }
```
Donde `getUrgentEvents`: `priority = 'alta' AND deadline < NOW() + 48h AND is_active = true`

---

## 5. Requerimientos No Funcionales (RNF)

| ID | Descripción |
|----|-------------|
| RNF-01 | Tiempo de respuesta < 2s para todas las páginas |
| RNF-02 | Sin texto blanco sobre colores pastel (accesibilidad de contraste) |
| RNF-03 | Timer preciso con `Date.now()` — no contador de setInterval |
| RNF-04 | Sessions persistidas en localStorage — sobreviven recarga |
| RNF-05 | Blobs de auditoría serializados con `withFileLock` |
| RNF-06 | TypeScript strict — 0 errores de tipos |
| RNF-07 | Build exitoso en Vercel con todas las variables de entorno |

---

## 6. Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | Next.js 14 (App Router) | SSR, API Routes, Server Components |
| Lenguaje | TypeScript 5 strict | Tipado estático en toda la app |
| Base de datos | Supabase (PostgreSQL) | Auth, RLS, queries tipadas |
| Autenticación | JWT custom + HttpOnly cookies | Control total, sin Supabase Auth |
| Storage | Vercel Blob | Archivos de auditoría privados |
| Estilos | Tailwind CSS | Utility-first, diseño rápido |
| Animaciones | Framer Motion | Transiciones suaves |
| PDF | jsPDF + jspdf-autotable | Reportes descargables |
| Fuentes | Google Fonts (Inter) via next/font | Sin CLS |
| Hosting | Vercel | CI/CD automático |

---

## 7. Arquitectura del Sistema

```
Cliente (Browser)
  └── Next.js App Router
        ├── Server Components (leen dataService)
        ├── Client Components (timer, modals, charts)
        └── API Routes (auth, sessions, events, reports)
              └── dataService.ts [ÚNICA entrada a:]
                    ├── supabase.ts (PostgreSQL)
                    └── blobAudit.ts (Vercel Blob)
```

---

## 8. Stack y Variables de Entorno

### Variables requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Base de datos directa (para migraciones)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Vercel Blob
BLOB_READ_WRITE_TOKEN=[token]

# JWT (autenticación custom)
JWT_SECRET=[min-32-chars-random-string]

# Bootstrap (solo en desarrollo/seed)
ADMIN_BOOTSTRAP_SECRET=[secret-para-activar-bootstrap]
```

### Acceso a variables

- Variables `NEXT_PUBLIC_*`: accesibles en cliente y servidor
- Variables sin prefijo: solo servidor (API Routes y Server Components)
- `BLOB_READ_WRITE_TOKEN`: accedida SIEMPRE via `getBlobToken()` como función lazy, NUNCA como constante de módulo

---

## 9. Reglas de Oro de Implementación

1. `dataService.ts` es el único archivo que importa `supabase.ts` y `blobAudit.ts`
2. Ningún API Route ni componente importa esos módulos directamente
3. El token de Blob se accede con `getBlobToken()` lazy — nunca `const TOKEN = process.env.BLOB_READ_WRITE_TOKEN` a nivel de módulo
4. La auditoría usa `get()` del SDK `@vercel/blob`, nunca `fetch(url)` (los blobs privados devuelven 401 silencioso con fetch)
5. `withFileLock` serializa escrituras al mismo archivo de auditoría dentro de la misma instancia serverless
6. El rol del usuario NUNCA viene del cliente — siempre asignado en el servidor
7. **El PomodoroTimer usa `Date.now()` como referencia absoluta**, no como contador:
   ```typescript
   const startTime = Date.now();
   setInterval(() => {
     const elapsed = Date.now() - startTime;
     const remaining = totalMs - elapsed;
   }, 250);
   ```
   Estado guardado en localStorage: `{ startTime, totalMs, phase, pauseCount, pauseStartTime, pauseCountOver1min, workDurationMin, breakDurationMin, wasSuggested }`
8. **RN-04 se evalúa en el servidor** — el cliente envía los datos crudos (`pause_count_over_1min`), el servidor decide el status
9. La cuenta se activa inmediatamente tras registro sin verificación de correo (v1)
10. El super admin solo lo ve el `SeedModeBanner` — los estudiantes nunca ven el banner

---

## 10. Estructura del Seed (Bootstrap)

El sistema comienza en modo `seed`. El único dato inicial es el super admin:

```json
{
  "superAdmin": {
    "email": "admin@equilibrastudy.com",
    "password": "[configurada en bootstrap]",
    "name": "Administrador",
    "role": "super_admin",
    "is_active": true
  }
}
```

El modo cambia de `seed` a `live` cuando el admin ejecuta el bootstrap desde `/admin/bootstrap`.

`/api/system/mode` retorna: `{ mode: 'seed' | 'live' }`

---

## 11. Estructura de lib/ y API Pública de dataService

```
lib/
├── supabase.ts           # Cliente Supabase (solo importado por dataService)
├── blobAudit.ts          # withFileLock + appendAuditEntry + getBlobToken
├── dataService.ts        # ÚNICA capa de acceso a datos
├── sessionService.ts     # getContinuousStudyMinutes, getSmartSuggestion, evaluateSessionStatus
├── analyticsService.ts   # buildDailyStats, buildWeeklyStats, buildMonthlyStats
├── reportService.ts      # generateMonthlyPDF
├── auth.ts               # withAuth middleware, signToken, verifyToken
└── types.ts              # Todos los tipos TypeScript compartidos
```

### dataService.ts — API Pública

```typescript
// Usuarios
createUser(data: CreateUserInput): Promise<User>
getUserById(id: string): Promise<User | null>
getUserByEmail(email: string): Promise<User | null>
updateUser(id: string, data: Partial<User>): Promise<User>
listUsers(): Promise<User[]>

// Sistema
getSystemMode(): Promise<'seed' | 'live'>
setSystemMode(mode: 'seed' | 'live'): Promise<void>
bootstrapDatabase(): Promise<void>

// Eventos académicos
createAcademicEvent(userId: string, data: CreateEventInput): Promise<AcademicEvent>
getAcademicEvents(userId: string): Promise<AcademicEvent[]>
getUrgentEvents(userId: string): Promise<AcademicEvent[]>
updateAcademicEvent(id: string, data: Partial<AcademicEvent>): Promise<AcademicEvent>
deleteAcademicEvent(id: string): Promise<void>

// Sesiones de estudio
createStudySession(userId: string, data: CreateSessionInput): Promise<StudySession>
getStudySessions(userId: string, from: Date, to: Date): Promise<StudySession[]>
getTodaySessions(userId: string): Promise<StudySession[]>

// Metas semanales
upsertWeeklyGoal(userId: string, weekStart: Date, goalHours: number): Promise<WeeklyGoal>
getWeeklyGoal(userId: string, weekStart: Date): Promise<WeeklyGoal | null>
getWeeklyProgress(userId: string): Promise<WeeklyProgress>
```

### sessionService.ts — API Pública

```typescript
getContinuousStudyMinutes(userId: string): Promise<number>
getSmartSuggestion(userId: string): Promise<SessionSuggestion>
evaluateSessionStatus(pauseCountOver1min: number, workDurationMin: number): SessionEvaluation
```

### analyticsService.ts — API Pública

```typescript
buildDailyStats(userId: string, date: Date): Promise<DailyStats>
buildWeeklyStats(userId: string, weekStart: Date): Promise<WeeklyStats>
buildMonthlyStats(userId: string, year: number, month: number): Promise<MonthlyStats>
```

---

## 12. Autenticación

### Flujo de Registro
1. POST `/api/auth/register` recibe `{ name, email, password }`
2. Valida que el email no exista
3. Hashea password con bcrypt
4. Crea user en Supabase con `role = 'estudiante'` (hardcodeado)
5. Genera JWT y lo guarda en cookie HttpOnly
6. Retorna `{ user: { id, name, email, role } }`

### Flujo de Login
1. POST `/api/auth/login` recibe `{ email, password }`
2. Busca usuario por email
3. Compara password con bcrypt
4. Si válido: genera JWT, guarda en cookie HttpOnly
5. Retorna `{ user: { id, name, email, role } }`

### JWT Payload
```typescript
{
  sub: string        // user id
  email: string
  role: 'estudiante' | 'super_admin'
  iat: number
  exp: number        // 7 días
}
```

### Cookie
```
Set-Cookie: token=[jwt]; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800
```

### Middleware withAuth
```typescript
withAuth(handler, { requireRole?: 'super_admin' })
// Lee cookie 'token', verifica JWT, agrega user al request
// Retorna 401 si no hay token válido
// Retorna 403 si el rol no coincide
```

---

## 13. blobAudit

### Propósito
Registro append-only de eventos críticos del sistema (bootstrap, cambios de modo, errores graves).

### getBlobToken()
```typescript
function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN not configured');
  return token;
}
// NUNCA: const TOKEN = process.env.BLOB_READ_WRITE_TOKEN (falla en build time)
```

### withFileLock
```typescript
async function withFileLock<T>(
  filename: string,
  fn: (existingContent: string) => Promise<{ newContent: string; result: T }>
): Promise<T>
// Serializa escrituras concurrentes al mismo blob dentro de la instancia serverless
```

### appendAuditEntry
```typescript
async function appendAuditEntry(entry: AuditEntry): Promise<void>
// Usa get() del SDK @vercel/blob para leer (no fetch() — los blobs privados dan 401 con fetch)
// Luego usa put() para escribir el contenido actualizado
```

---

## 14. API Routes Requeridas

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/system/mode
POST   /api/system/bootstrap

GET    /api/events
POST   /api/events
PUT    /api/events/[id]
DELETE /api/events/[id]

GET    /api/sessions
POST   /api/sessions
GET    /api/sessions/continuous

GET    /api/goals/weekly
POST   /api/goals/weekly

GET    /api/analytics/daily
GET    /api/analytics/weekly
GET    /api/analytics/monthly

GET    /api/reports/monthly?year=&month=

GET    /api/admin/users
PUT    /api/admin/users/[id]
GET    /api/admin/audit
```

---

## 15. Migraciones de Base de Datos

### Migration 0001 — users

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'estudiante'
    CHECK (role IN ('estudiante', 'super_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### Migration 0002 — academic_events

```sql
CREATE TABLE academic_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  priority VARCHAR(10) NOT NULL DEFAULT 'media'
    CHECK (priority IN ('alta', 'media', 'baja')),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON academic_events(user_id);
CREATE INDEX idx_events_deadline ON academic_events(deadline);

-- Eventos urgentes: priority='alta' AND deadline < NOW() + 48h AND is_active = true
```

### Migration 0003 — study_sessions

```sql
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  work_duration_min INTEGER NOT NULL,
  break_duration_min INTEGER NOT NULL,
  pause_count INTEGER NOT NULL DEFAULT 0,
  pause_count_over_1min INTEGER NOT NULL DEFAULT 0,
  fatigue_level INTEGER CHECK (fatigue_level BETWEEN 1 AND 5),
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('completada', 'incompleta')),
  effective_minutes INTEGER NOT NULL DEFAULT 0,
  was_suggested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_sessions_started_at ON study_sessions(started_at);
```

### Migration 0004 — weekly_goals

```sql
CREATE TABLE weekly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,  -- Siempre el lunes de la semana
  goal_hours DECIMAL(4,1) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- upsertWeeklyGoal usa:
-- INSERT INTO weekly_goals (user_id, week_start, goal_hours)
-- VALUES ($1, $2, $3)
-- ON CONFLICT (user_id, week_start) DO UPDATE SET goal_hours = EXCLUDED.goal_hours
```

---

## 16. Especificaciones de Componentes Clave

### GoalProgressBar
- Muestra barra de progreso semanal en Amarillo Sol (#F5D800, texto #6B5A00)
- Si no hay meta configurada: empty state invitando a configurarla
- Porcentaje = `(accumulated_hours / goal_hours) * 100`

### SeedModeBanner
- Solo visible para `super_admin`
- Fondo amarillo, texto tierra
- Indica que la base de datos está en modo seed

### PomodoroTimer
- Muestra tiempo restante (trabajo o descanso)
- Basado en `Date.now()` — NO en contador de setInterval
- Estado persistido en localStorage
- Tick cada 250ms para suavidad visual
- Al completar: alerta sonora Web Audio API + abrir FatigueSelector

### SessionSuggestion
- Muestra sugerencia inteligente (RN-05)
- Dos botones: "Aceptar sugerencia" y "Configurar manualmente"
- Si hay evento urgente: muestra razón ("Tienes [nombre] en Xh")

### BlockedState
- Se muestra cuando RN-01 activo (>= 120 min continuos)
- Fondo Verde Menta (#D6FFE9), texto #074D22
- Cuenta regresiva del descanso requerido (calculada en cliente con Date.now())

### FatigueSelector
- Modal post-sesión con 5 íconos: 😴😔😊😄⚡ (niveles 1-5)
- Botón "Guardar sesión" envía fatigue_level al servidor

### AuditViewer
- Solo accesible para super_admin
- Selector de mes + tabla de entradas de auditoría

---

## 17. Sistema de Diseño — Pastel Vibrante

### Principios
- Fondo blanco (#FFFFFF) — NO fondo oscuro
- Texto oscuro sobre pastel — NUNCA texto blanco sobre color pastel
- Sin degradados
- Sin sombras decorativas
- Tipografía: Inter 500 (no bold pesado)

### Paleta de Colores

| Color | Nombre | Hex Principal | Texto | Fondo suave |
|-------|--------|---------------|-------|-------------|
| Cian brillante | Acción principal | `#00C8F5` | `#003D4D` | `#D6F5FF` |
| Amarillo sol | Metas / Logro | `#F5D800` | `#6B5A00` | `#FFFACC` |
| Verde menta | Éxito / Descanso | `#33D17A` | `#074D22` | `#D6FFE9` |
| Naranja coral | Urgente / Alerta | `#FF8040` | `#6B2A00` | `#FFE9D6` |
| Lavanda viva | Analytics | `#9B59F5` | `#3B0080` | `#EDE0FF` |
| Rosa vibrante | Fatiga | `#F060A8` | `#6B0040` | `#FFD6EE` |
| Azul claro | Calendario | `#4DA6FF` | `#002B6B` | `#D6ECFF` |
| Gris neutro | Perfil / Neutral | `#8C9BAB` | `#1A2633` | `#E8ECF0` |

### Colores por Sección
- **Inicio (Dashboard):** Amarillo sol (`#F5D800`)
- **Zona de Enfoque:** Cian brillante (`#00C8F5`)
- **Calendario:** Azul claro (`#4DA6FF`)
- **Analytics:** Lavanda viva (`#9B59F5`)
- **Perfil:** Gris neutro (`#8C9BAB`)
- **Admin (super admin):** Sin color semántico especial

### Reglas de "No Hacer"
- NO texto blanco sobre `#00C8F5`, `#F5D800`, `#33D17A`, `#9B59F5`, etc.
- NO gradientes de fondo
- NO sombras decorativas (`box-shadow` solo para focus rings de accesibilidad)
- NO fuentes con peso > 600 para textos normales
- NO border-radius > 12px en tarjetas principales

### Botones Clave
| Botón | Fondo | Texto |
|-------|-------|-------|
| Ingresar (login) | `#00C8F5` | `#003D4D` |
| Iniciar sesión de estudio | `#00C8F5` | `#003D4D` |
| Exportar PDF | `#F5D800` | `#6B5A00` |
| Guardar sesión | `#33D17A` | `#074D22` |
| Eliminar / peligroso | `#FF8040` | `#6B2A00` |

### Sidebar (Estudiante)
1. Inicio — Amarillo sol `#F5D800`
2. Zona de Enfoque — Cian `#00C8F5`
3. Calendario — Azul claro `#4DA6FF`
4. Analytics — Lavanda `#9B59F5`
5. Perfil — Gris neutro `#8C9BAB`

El super admin ve además: Administración

### Variables CSS (globals.css)
```css
:root {
  --color-bg: #FFFFFF;
  --color-text: #1A1A2E;
  --color-cian: #00C8F5;
  --color-cian-text: #003D4D;
  --color-cian-bg: #D6F5FF;
  --color-amarillo: #F5D800;
  --color-amarillo-text: #6B5A00;
  --color-amarillo-bg: #FFFACC;
  --color-verde: #33D17A;
  --color-verde-text: #074D22;
  --color-verde-bg: #D6FFE9;
  --color-naranja: #FF8040;
  --color-naranja-text: #6B2A00;
  --color-naranja-bg: #FFE9D6;
  --color-lavanda: #9B59F5;
  --color-lavanda-text: #3B0080;
  --color-lavanda-bg: #EDE0FF;
  --color-rosa: #F060A8;
  --color-rosa-text: #6B0040;
  --color-rosa-bg: #FFD6EE;
  --color-azul: #4DA6FF;
  --color-azul-text: #002B6B;
  --color-azul-bg: #D6ECFF;
}
```

### Etiquetas de Prioridad (Eventos Académicos)
| Prioridad | Fondo | Texto |
|-----------|-------|-------|
| Alta | `#FFE9D6` | `#8A3C10` |
| Media | `#FFF6C2` | `#8A7A00` |
| Baja | `#D6FFE9` | `#0D6B35` |

---

## 18. Mapa de Fases

| Fase | Nombre | Rol |
|------|--------|-----|
| 0 | Crear archivo de estado | Ingeniero de Proyectos |
| 1 | Bootstrap, Login, Registro y dataService base | Ingeniero Fullstack Senior |
| 2 | Dashboard, Layout base y bootstrap | Diseñador Frontend + Ingeniero de Sistemas |
| 3 | Calendario Académico | Ingeniero Fullstack + Diseñador Frontend |
| 4 | Zona de Enfoque (Pomodoro) | Ingeniero Fullstack Senior |
| 5 | Metas Semanales y Analytics | Ingeniero Fullstack + Diseñador Frontend |
| 6 | Exportación PDF y Perfil | Ingeniero Backend Senior + Diseñador Frontend |
| 7 | Administración y Pulido final | Diseñador Frontend + Ingeniero Fullstack |

---

## 19. Fase 1 — Bootstrap, Login, Registro y dataService base

**Objetivo:** Sistema de autenticación funcionando. El estudiante puede registrarse y hacer login. El modo del sistema es `seed`.

**Archivos a crear:**
- `lib/supabase.ts` — cliente Supabase (server-side únicamente)
- `lib/blobAudit.ts` — getBlobToken, withFileLock, appendAuditEntry
- `lib/auth.ts` — signToken, verifyToken, withAuth
- `lib/types.ts` — todos los tipos
- `lib/dataService.ts` — implementación completa de la API pública
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/system/mode/route.ts`
- `app/(auth)/login/page.tsx` — UI con Pastel Vibrante
- `app/(auth)/register/page.tsx` — UI con Pastel Vibrante
- `middleware.ts` — redirección según autenticación

**Verificaciones:**
- npm run typecheck → 0 errores
- Registro de nuevo estudiante → cuenta activa → login → cookie HttpOnly en DevTools
- `/api/system/mode` retorna `{ mode: 'seed' }`

---

## 20. Fase 2 — Dashboard, Layout base y bootstrap

**Objetivo:** Layout con sidebar, dashboard con resumen del estudiante, y página de bootstrap para el super admin.

**Archivos a crear:**
- `app/(app)/layout.tsx` — layout con sidebar
- `app/(app)/dashboard/page.tsx` — dashboard del estudiante
- `app/(app)/admin/bootstrap/page.tsx` — página de configuración inicial
- `components/layout/Sidebar.tsx`
- `components/layout/SeedModeBanner.tsx`
- `components/dashboard/GoalProgressBar.tsx`
- `app/api/system/bootstrap/route.ts`

---

## 21. Fase 3 — Calendario Académico

**Objetivo:** CRUD de eventos académicos con prioridades y detección de urgencia.

**Archivos a crear:**
- `app/(app)/calendar/page.tsx`
- `components/calendar/CalendarGrid.tsx`
- `components/calendar/EventCard.tsx`
- `components/calendar/EventForm.tsx`
- `app/api/events/route.ts`
- `app/api/events/[id]/route.ts`

---

## 22. Fase 4 — Zona de Enfoque (Pomodoro)

**Objetivo:** Timer Pomodoro con sugerencia inteligente, reglas de negocio RN-01 a RN-05.

**Archivos a crear:**
- `app/(app)/focus/page.tsx`
- `components/focus/PomodoroTimer.tsx`
- `components/focus/SessionSuggestion.tsx`
- `components/focus/BlockedState.tsx`
- `components/focus/FatigueSelector.tsx`
- `lib/sessionService.ts`
- `app/api/sessions/route.ts`
- `app/api/sessions/continuous/route.ts`

---

## 23. Fase 5 — Metas Semanales y Analytics

**Objetivo:** Visualización de progreso con gráficas y metas semanales.

**Archivos a crear:**
- `app/(app)/analytics/page.tsx`
- `components/analytics/DailyChart.tsx`
- `components/analytics/WeeklyChart.tsx`
- `components/analytics/MonthlyChart.tsx`
- `lib/analyticsService.ts`
- `app/api/analytics/[view]/route.ts`
- `app/api/goals/weekly/route.ts`

---

## 24. Fase 6 — Exportación PDF y Perfil

**Objetivo:** Reporte PDF mensual descargable y página de perfil del estudiante.

**Archivos a crear:**
- `app/(app)/profile/page.tsx`
- `lib/reportService.ts`
- `app/api/reports/monthly/route.ts`

---

## 25. Fase 7 — Administración y Pulido Final

**Objetivo:** Panel de administración, auditoría, empty states y verificación completa de reglas de negocio.

**Archivos a crear:**
- `app/(app)/admin/users/page.tsx`
- `app/(app)/admin/audit/page.tsx`
- `app/api/admin/users/route.ts`
- `app/api/admin/users/[id]/route.ts`
- `app/api/admin/audit/route.ts`

---

*EquilibraStudy — Plan Maestro v1.0*
*Laura Celedon · Doc: 1128201459 · SIST0200*

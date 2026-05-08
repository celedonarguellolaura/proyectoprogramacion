# EquilibraStudy — Plan Maestro del Sistema
> Plataforma de Gestión Inteligente del Tiempo Académico | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Laura Celedon | Doc: 1128201459

---

## Índice General

1. [Definición del sistema](#1-definición-del-sistema)
2. [Problema que resuelve](#2-problema-que-resuelve)
3. [Actores del sistema](#3-actores-del-sistema)
4. [Roles y permisos](#4-roles-y-permisos)
5. [Casos de uso](#5-casos-de-uso)
6. [Requerimientos funcionales](#6-requerimientos-funcionales)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Stack tecnológico](#8-stack-tecnológico)
9. [Arquitectura de persistencia](#9-arquitectura-de-persistencia)
10. [Bootstrap y migrations](#10-bootstrap-y-migrations)
11. [Capa de datos unificada (dataService)](#11-capa-de-datos-unificada)
12. [Modelo de datos — Supabase Postgres](#12-modelo-de-datos--supabase-postgres)
13. [Auditoría en Vercel Blob](#13-auditoría-en-vercel-blob)
14. [Arquitectura de rutas](#14-arquitectura-de-rutas)
15. [Requerimientos no funcionales](#15-requerimientos-no-funcionales)
16. [Flujos de usuario y de trabajo](#16-flujos-de-usuario-y-de-trabajo)
17. [Diseño de interfaz](#17-diseño-de-interfaz)
18. [Plan de fases de implementación](#18-plan-de-fases-de-implementación)
19. [Estrategia de seguridad](#19-estrategia-de-seguridad)
20. [Restricciones del sistema](#20-restricciones-del-sistema)
21. [Glosario](#21-glosario)

---

## 1. Definición del sistema

**EquilibraStudy** es una plataforma web de gestión del tiempo académico que combina la técnica Pomodoro con análisis de datos personalizados. El objetivo es ofrecer un equilibrio real entre productividad y bienestar mental: el sistema no solo mide el tiempo de estudio, sino que lo optimiza dinámicamente basándose en el calendario académico del estudiante, su historial de sesiones y su nivel de fatiga registrado.

A diferencia de un temporizador simple, EquilibraStudy adapta la duración de las sesiones según la urgencia de los eventos académicos próximos, impone descansos obligatorios respetando los límites cognitivos documentados por la ciencia, y distingue entre tiempo real de estudio concentrado y tiempo frente a la pantalla.

El sistema opera completamente desde el navegador con Next.js App Router en Vercel. Persiste todos los datos en Supabase Postgres y registra la auditoría de operaciones en Vercel Blob.

---

## 2. Problema que resuelve

| Problema actual | Cómo lo resuelve EquilibraStudy |
|---|---|
| Sin medición real del estudio — es imposible saber si se estudia eficientemente. | Contabiliza minutos de estudio efectivo según criterio RN-04 (máx. 2 pausas > 1 min). |
| Burnout por falta de descansos programados y mala planificación. | Impone descansos mínimos obligatorios (RN-01, RN-02) y adapta la carga según proximidad de exámenes. |
| Los estudiantes no saben cuándo intensificar el estudio para un examen. | Detecta eventos urgentes (< 48h, prioridad Alta) y sugiere automáticamente sesiones más largas (RN-05). |
| Sin visibilidad del progreso hacia metas semanales. | Dashboard con barra de progreso en tiempo real hacia la meta de horas semanales. |
| Sin historial exportable para reflexionar sobre el rendimiento. | Exportación de resumen mensual en PDF (RF-10). |

---

## 3. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Estudiante** | Externo | Actor principal. Registra y usa todas las funcionalidades: Pomodoro, calendario académico, analytics y metas. |
| **Super Admin** | Interno | Acceso al bootstrap y gestión básica de usuarios del sistema. Sin acceso a datos privados de estudio. |
| **Sistema** | No humano | Calcula sesiones sugeridas, aplica reglas de descanso, evalúa criterio de sesión real, actualiza estadísticas. |

---

## 4. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Estudiante | Super Admin |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| Registrarse | ✅ | N/A |
| Acceder a `/admin/db-setup` | ❌ | ✅ |
| **POMODORO** | | |
| Iniciar sesión Pomodoro inteligente o manual | ✅ | ❌ |
| Registrar nivel de fatiga post-sesión | ✅ | ❌ |
| Ver historial de sesiones propias | ✅ | ❌ |
| **EVENTOS ACADÉMICOS** | | |
| Crear / editar / eliminar sus propios eventos | ✅ | ❌ |
| Ver su calendario académico | ✅ | ❌ |
| **ANALYTICS** | | |
| Ver estadísticas propias (diaria/semanal/mensual) | ✅ | ❌ |
| Exportar resumen mensual en PDF | ✅ | ❌ |
| **METAS** | | |
| Establecer meta semanal de horas | ✅ | ❌ |
| Ver progreso hacia la meta | ✅ | ❌ |
| **ADMINISTRACIÓN** | | |
| Gestionar usuarios | ❌ | ✅ |
| Ver auditoría de Blob | ❌ | ✅ |

> **RN-03 — Privacidad total:** Las estadísticas, sesiones, eventos y datos de estado de ánimo son estrictamente privados. El super admin solo puede ver métricas globales agregadas (número de sesiones totales del sistema, usuarios activos), nunca el contenido de las sesiones individuales.

---

## 5. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Registrarse | Estudiante | Crea cuenta con nombre, correo y contraseña. Cuenta activa inmediatamente. |
| CU-A2 | Iniciar sesión | Todos | Ingresa correo y contraseña. El sistema genera JWT. |
| CU-A3 | Cambiar contraseña | Todos | Actualiza contraseña verificando la actual. |

### Módulo Pomodoro

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Iniciar sesión inteligente | Estudiante | El sistema consulta eventos próximos urgentes y propone duración recomendada con justificación. El estudiante acepta o ajusta. El temporizador inicia y monitorea pausas manuales. |
| CU-02 | Iniciar sesión manual | Estudiante | El estudiante configura manualmente la duración de trabajo y descanso (respetando mínimos de RN-02). |
| CU-03 | Completar ciclo Pomodoro | Sistema | Al llegar el temporizador a cero, el sistema evalúa RN-04, registra la sesión como completada o incompleta y fuerza el inicio del descanso. |
| CU-04 | Registrar fatiga post-sesión | Estudiante | Al finalizar la sesión, el sistema solicita un valor de fatiga (1–5). Este dato alimenta las recomendaciones futuras. |
| CU-05 | Bloqueo por acumulación (RN-01) | Sistema | Si el estudiante acumula 120 min continuos de estudio, el sistema bloquea el inicio de un nuevo bloque hasta que complete 15 min de descanso. |

### Módulo de Calendario Académico

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-06 | Crear evento académico | Estudiante | Registra un examen, entrega o parcial con nombre, fecha límite y prioridad (Alta, Media, Baja). |
| CU-07 | Editar evento | Estudiante | Modifica cualquier campo de un evento. |
| CU-08 | Eliminar evento | Estudiante | Elimina el evento con confirmación modal. |
| CU-09 | Ver calendario | Estudiante | Visualiza todos sus eventos académicos con código de color por prioridad. Los eventos urgentes (< 48h, Alta) se destacan en Naranja Coral. |

### Módulo de Analytics

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-10 | Ver estadísticas de estudio | Estudiante | Consulta horas acumuladas por día/semana/mes, sesiones completadas vs. incompletas y progreso hacia la meta semanal en gráficas interactivas. |
| CU-11 | Filtrar por rango de fechas | Estudiante | Ajusta las gráficas a un período específico. |
| CU-12 | Exportar resumen mensual en PDF | Estudiante | Descarga un PDF con sesiones completadas, horas acumuladas y metas alcanzadas del mes. |

### Módulo de Metas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-13 | Establecer meta semanal | Estudiante | Define el número de horas de estudio que quiere alcanzar en la semana. |
| CU-14 | Ver progreso de la meta | Estudiante | El dashboard muestra una barra de progreso actualizada en tiempo real con horas acumuladas vs. meta. |

---

## 6. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema debe permitir registro y autenticación con correo y contraseña, con validación de sesión activa. |
| RF-02 | El usuario debe poder configurar e iniciar ciclos Pomodoro con intervalos de trabajo y descanso personalizables, respetando los mínimos de RN-02. |
| RF-03 | El sistema debe contabilizar y almacenar automáticamente los minutos efectivos de estudio al finalizar cada ciclo completado según RN-04. |
| RF-04 | El usuario debe poder crear, visualizar, editar y eliminar eventos académicos con fechas límite y niveles de prioridad (Alta, Media, Baja). |
| RF-05 | El sistema debe generar visualizaciones gráficas del progreso de estudio acumulado en vistas diaria, semanal y mensual. |
| RF-06 | El sistema debe emitir alertas sonoras y visuales al finalizar cada intervalo (trabajo o descanso). |
| RF-07 | El sistema debe sugerir automáticamente la duración de las sesiones basándose en la proximidad y prioridad de los eventos registrados. |
| RF-08 | Al finalizar cada sesión, el usuario debe poder registrar su nivel de fatiga (1–5) para ajustar las recomendaciones futuras. |
| RF-09 | El sistema debe permitir establecer metas de horas semanales y mostrar una barra de progreso actualizada en tiempo real. |
| RF-10 | El usuario debe poder descargar un resumen mensual en PDF con sesiones completadas, horas acumuladas y metas alcanzadas. |

---

## 7. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | Tras acumular 120 minutos continuos de estudio, el sistema bloquea el inicio de un nuevo bloque hasta que el usuario complete un descanso de mínimo 15 minutos. | Al guardar cada sesión en Supabase, el servidor calcula `continuous_study_minutes` del día sumando sesiones sin un descanso de 15 min entre ellas. Si >= 120, el endpoint de inicio retorna 403 con `reason: 'MANDATORY_BREAK'`. |
| RN-02 | Por cada 25 minutos de estudio, el sistema garantiza mínimo 5 minutos de descanso. Este umbral mínimo no es editable. | Validación Zod en el servidor: `break_duration_min >= Math.floor(work_duration_min / 25) * 5`. |
| RN-03 | Las estadísticas, sesiones y datos de fatiga son estrictamente privados. Solo accesibles por el usuario titular. | Todas las queries filtran por `user_id` del JWT. El super admin nunca recibe contenido individual de sesiones. |
| RN-04 | Una sesión solo se contabiliza como completada si el temporizador llega a cero con máximo 2 pausas manuales de duración superior a 1 minuto. Si hay más, la sesión se marca como "incompleta" y no suma al progreso. | El cliente rastrea las pausas en estado local durante la sesión. Al finalizar, envía `{ pause_count_over_1min }` al servidor. Si > 2, el servidor guarda `status = 'incompleta'`. |
| RN-05 | Si un evento tiene prioridad "Alta" y faltan menos de 48 horas, el sistema sugiere extender los bloques de 25 a 50 minutos con pausas de 10 minutos. | En `sessionService.getSmartSuggestion()`, consultar eventos con `deadline < NOW() + 48h AND priority = 'alta'`. Si hay al menos uno: sugerencia = 50/10. Si no: sugerencia = 25/5. |

---

## 8. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y responsive |
| Animaciones | Framer Motion | 12.x | Transiciones, temporizador circular |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados de dominio |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Auditoría | `@vercel/blob` | — | Logs append-only de operaciones |
| Gráficas | Recharts | 2.x | Analytics diario/semanal/mensual |
| Export PDF | jsPDF + jspdf-autotable | 2.x | Resumen mensual |
| Iconos | Lucide React | — | Iconografía coherente |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 9. Arquitectura de persistencia

### 9.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, eventos académicos, sesiones de estudio, metas semanales. | Todo requiere SQL: sumar minutos del día, calcular progreso hacia meta, detectar eventos urgentes. |
| **Vercel Blob** | Auditoría append-only por mes (`audit/<YYYYMM>.json`). | Logs de operaciones sin necesidad de SQL. No satura Postgres. |
| **`data/` en el repo** | Seed inicial: super admin. | Read-only. Solo para arrancar antes del bootstrap. |

### 9.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.** Nadie importa `supabase.ts` ni `blobAudit.ts` directamente.
2. **CERO caché en memoria** para datos transaccionales.
3. **CERO CDN cache** en `/api/:path*`. Headers `no-store` desde `next.config.ts`.
4. **`get()` del SDK de Blob, nunca `fetch(url)`** — blobs privados fallan silenciosamente con `fetch`.
5. **Token de Blob accedido con función lazy** (`getBlobToken()`), nunca constante de módulo.
6. **Read-modify-write sobre auditoría** serializado con `withFileLock()`.
7. **El temporizador Pomodoro corre en el cliente** (estado de UI de sesión). El servidor solo recibe el resumen al finalizar. `localStorage` es la única excepción justificada para persistir el estado del timer ante recargas de página.
8. **El criterio de sesión real (RN-04)** se evalúa en el servidor al recibir el resumen — el cliente envía `pause_count_over_1min`, el servidor decide el `status`.

---

## 10. Bootstrap y migrations

### 10.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "EquilibraStudy" }
  seed.json       ← {
                      "users": [{ email, password_hash, name: "Admin", role: "super_admin" }]
                    }
  README.md
```

### 10.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql          ← Fase 1: users + _migrations
  0002_init_events.sql         ← Fase 3: academic_events
  0003_init_sessions.sql       ← Fase 4: study_sessions
  0004_init_goals.sql          ← Fase 5: weekly_goals
```

### 10.3 Tabla de control `_migrations`

```sql
CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### 10.4 Página `/admin/db-setup`

Tab **Diagnóstico**: Supabase, Blob, migrations, conteos por tabla.
Tab **Bootstrap**: migrations pendientes + botón ejecutar con confirmación.

---

## 11. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 11.1 Modos de operación

| Modo | Cuándo | Lecturas | Escrituras |
|---|---|---|---|
| **`seed`** | Sin migrations | `data/*.json` | Bloqueadas — solo login admin. |
| **`live`** | Con migrations | Supabase Postgres | Postgres + auditoría a Blob. |

### 11.2 Estructura interna de `lib/`

```
lib/
  dataService.ts        ← ÚNICO punto de acceso
  supabase.ts           ← Solo lo importa dataService
  blobAudit.ts          ← Solo lo importa dataService
  pgMigrate.ts          ← Solo lo importa /api/system/bootstrap
  seedReader.ts         ← Solo lo importa dataService en modo seed
  sessionService.ts     ← getSmartSuggestion, evaluateSessionStatus,
                           getContinuousStudyMinutes
  analyticsService.ts   ← buildDailyStats, buildWeeklyStats, buildMonthlyStats,
                           getWeeklyProgress
  reportService.ts      ← generateMonthlyPDF
  auth.ts
  withAuth.ts
  withRole.ts
  types.ts
  schemas.ts
  dateUtils.ts
```

### 11.3 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Eventos académicos
export async function getAcademicEvents(userId: string): Promise<AcademicEvent[]>
export async function getUrgentEvents(userId: string): Promise<AcademicEvent[]>  // < 48h + Alta prioridad
export async function createAcademicEvent(userId: string, data: CreateEventRequest): Promise<AcademicEvent>
export async function updateAcademicEvent(id: string, userId: string, data: UpdateEventRequest): Promise<AcademicEvent>
export async function deleteAcademicEvent(id: string, userId: string): Promise<void>

// Sesiones de estudio
export async function saveStudySession(userId: string, data: SaveSessionRequest): Promise<StudySession>
export async function getSessionHistory(userId: string, from?: string, to?: string): Promise<StudySession[]>
export async function getContinuousStudyMinutes(userId: string): Promise<number>  // para RN-01

// Analytics
export async function getDailyStats(userId: string, date: string): Promise<DailyStats>
export async function getWeeklyStats(userId: string, weekStart: string): Promise<WeeklyStats>
export async function getMonthlyStats(userId: string, year: number, month: number): Promise<MonthlyStats>

// Metas
export async function getWeeklyGoal(userId: string, weekStart: string): Promise<WeeklyGoal | null>
export async function upsertWeeklyGoal(userId: string, data: UpsertGoalRequest): Promise<WeeklyGoal>
export async function getWeeklyProgress(userId: string, weekStart: string): Promise<WeeklyProgress>

// Dashboard
export async function getDashboardData(userId: string): Promise<DashboardData>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 11.4 Lógica crítica en servicios de dominio

**`lib/sessionService.ts`**

```typescript
// Consulta eventos próximos urgentes del usuario.
// Si hay eventos con priority='alta' y deadline < NOW() + 48h:
//   sugerencia = { work_min: 50, break_min: 10, reason: "Tienes [evento] mañana" }
// Si no:
//   sugerencia = { work_min: 25, break_min: 5, reason: null }
export async function getSmartSuggestion(userId: string): Promise<SessionSuggestion>

// Evalúa si la sesión cuenta como completada (RN-04).
// Si pause_count_over_1min <= 2: status = 'completada', effective_minutes = work_duration_min
// Si pause_count_over_1min > 2: status = 'incompleta', effective_minutes = 0
export function evaluateSessionStatus(pauseCountOver1min: number, workDurationMin: number): SessionEvaluation

// Calcula los minutos de estudio acumulados desde el último descanso >= 15 min.
// Necesario para aplicar RN-01.
// Recorre las sesiones del día hacia atrás hasta encontrar un gap de >= 15 min.
export async function getContinuousStudyMinutes(userId: string): Promise<number>
```

---

## 12. Modelo de datos — Supabase Postgres

### Diagrama de entidades

```
users
  ├──< academic_events
  ├──< study_sessions
  └──< weekly_goals
```

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL DEFAULT 'estudiante'
                       CHECK (role IN ('estudiante', 'super_admin')),
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_events.sql`

```sql
CREATE TABLE IF NOT EXISTS academic_events (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  deadline    TIMESTAMPTZ  NOT NULL,
  priority    VARCHAR(10)  NOT NULL DEFAULT 'media'
              CHECK (priority IN ('alta', 'media', 'baja')),
  notes       TEXT,
  is_active   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_deadline ON academic_events(user_id, deadline);
CREATE INDEX IF NOT EXISTS idx_events_priority       ON academic_events(user_id, priority, deadline);
```

### Migration `0003_init_sessions.sql`

```sql
CREATE TABLE IF NOT EXISTS study_sessions (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at            TIMESTAMPTZ  NOT NULL,
  ended_at              TIMESTAMPTZ  NOT NULL,
  work_duration_min     INTEGER      NOT NULL CHECK (work_duration_min >= 25),
  break_duration_min    INTEGER      NOT NULL CHECK (break_duration_min >= 5),
  pause_count_over_1min INTEGER      NOT NULL DEFAULT 0,
  effective_minutes     INTEGER      NOT NULL DEFAULT 0,  -- 0 si incompleta
  status                VARCHAR(15)  NOT NULL DEFAULT 'completada'
                        CHECK (status IN ('completada', 'incompleta')),
  fatigue_level         SMALLINT     CHECK (fatigue_level BETWEEN 1 AND 5),
  was_suggested         BOOLEAN      DEFAULT false,  -- si aceptó la sugerencia inteligente
  created_at            TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date  ON study_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status     ON study_sessions(user_id, status, started_at);
```

### Migration `0004_init_goals.sql`

```sql
CREATE TABLE IF NOT EXISTS weekly_goals (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start    DATE          NOT NULL,  -- siempre lunes
  goal_hours    DECIMAL(4,1)  NOT NULL CHECK (goal_hours > 0),
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);
```

---

## 13. Auditoría en Vercel Blob

### 13.1 Estructura de cada entrada

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  user_role: 'estudiante' | 'super_admin';
  action:
    | 'login' | 'logout' | 'register'
    | 'start_session' | 'complete_session' | 'incomplete_session'
    | 'create_event' | 'update_event' | 'delete_event'
    | 'set_goal' | 'export_pdf'
    | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'session' | 'event' | 'goal' | 'user' | 'system';
  entity_id?: string;
  summary: string;  // "Sesión de 50 min completada. Fatiga: 3/5. Acumulado hoy: 100 min."
  metadata?: Record<string, unknown>;
};
```

### 13.2 Implementación de `lib/blobAudit.ts`

Idéntica al patrón de todos los proyectos del curso:
- `getBlobToken()` lazy — nunca constante de módulo.
- `get()` del SDK de Blob — nunca `fetch(url)` para blobs privados.
- `withFileLock()` para serializar read-modify-write al mismo archivo mensual.

---

## 14. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                        ← Redirige a /dashboard o /login
  login/page.tsx
  register/page.tsx
  dashboard/page.tsx              ← Home: meta semanal, próximo evento urgente, acceso a Pomodoro
  focus/
    page.tsx                      ← Zona de Enfoque — Pomodoro activo
  calendar/
    page.tsx                      ← Calendario académico con eventos
  analytics/
    page.tsx                      ← Dashboard de estadísticas y gráficas
  profile/page.tsx                ← Preferencias y cambio de contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | register | me | change-password
    sessions/
      suggestion/route.ts         ← GET sugerencia inteligente
      route.ts                    ← POST guardar sesión finalizada
      history/route.ts            ← GET historial de sesiones
      continuous/route.ts         ← GET minutos continuos hoy (para RN-01)
    events/
      route.ts                    ← GET lista | POST crear
      [id]/route.ts               ← PUT | DELETE
      urgent/route.ts             ← GET eventos urgentes (< 48h, prioridad Alta)
    analytics/
      daily/route.ts              ← GET estadísticas del día
      weekly/route.ts             ← GET estadísticas de la semana
      monthly/route.ts            ← GET estadísticas del mes
    goals/
      route.ts                    ← GET | POST/PUT meta semanal
      progress/route.ts           ← GET progreso actual vs. meta
    reports/monthly/route.ts      ← GET genera y descarga PDF mensual
    dashboard/route.ts            ← GET datos del dashboard
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/
  layout/                         ← AppLayout, Sidebar, SeedModeBanner
  focus/                          ← PomodoroTimer, FatigueSelector, SessionSuggestion,
                                     BlockedState (RN-01), SessionSummary
  calendar/                       ← EventCard, EventForm, CalendarGrid
  analytics/                      ← DailyChart, WeeklyChart, MonthlyChart,
                                     StatsCard, GoalProgressBar
  admin/                          ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  sessionService.ts | analyticsService.ts | reportService.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 15. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | El temporizador Pomodoro debe mantener la cuenta correctamente incluso si el usuario cambia de tab o recarga la página. |
| RNF-02 | Al guardar una sesión, el servidor debe evaluar RN-04 en menos de 500 ms. |
| RNF-03 | Las gráficas de analytics deben cargar en menos de 2 segundos. |
| RNF-04 | La interfaz debe ser completamente funcional en celulares (estudiantes estudian desde el celular). |
| RNF-05 | Las contraseñas deben hashearse con bcrypt antes de guardarse. |
| RNF-06 | Las sesiones deben gestionarse con JWT en cookie HttpOnly. |
| RNF-07 | Los datos de cada usuario son estrictamente privados (RN-03). Todas las queries filtran por `user_id` del JWT. |

---

## 16. Flujos de usuario y de trabajo

### Flujo de bootstrap (primera vez del admin)

Igual que todos los proyectos del curso: login con admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live activo.

### Flujo de una sesión de estudio inteligente

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Estudiante | Abre EquilibraStudy. Dashboard muestra su próximo evento urgente: "Examen de Cálculo mañana" y su progreso semanal. |
| 2 | Estudiante | Hace clic en "Iniciar Sesión Inteligente". |
| 3 | Sistema | Consulta `/api/sessions/suggestion`. Detecta evento Alta prioridad < 48h → retorna `{ work_min: 50, break_min: 10, reason: "Examen de Cálculo en 18h" }`. |
| 4 | Estudiante | Ve la sugerencia: "Se recomienda sesión de 50 min. Tienes un examen de Cálculo en 18h." Puede aceptar o ajustar. |
| 5 | Sistema | Antes de iniciar, consulta `/api/sessions/continuous`. Si >= 120 min → bloquear con mensaje de descanso obligatorio (RN-01). Si no → iniciar. |
| 6 | Estudiante | Acepta y el temporizador inicia. El cliente comienza a monitorear pausas manuales localmente. |
| 7 | Sistema (cliente) | El timer corre en el cliente con `Date.now()` como referencia. Estado guardado en `localStorage`. |
| 8 | Estudiante | Al llegar a cero, suena la alarma (Web Audio API). El cliente muestra el modal de fatiga. |
| 9 | Estudiante | Registra fatiga = 3. Hace clic en "Guardar sesión". |
| 10 | Cliente | Envía `POST /api/sessions` con `{ work_duration_min: 50, break_duration_min: 10, pause_count_over_1min: 0, fatigue_level: 3, was_suggested: true }`. |
| 11 | Servidor | `sessionService.evaluateSessionStatus(0, 50)` → `status = 'completada'`, `effective_minutes = 50`. Guarda en Supabase. Registra auditoría en Blob. |
| 12 | Cliente | Muestra resumen: "¡Sesión completada! 50 min efectivos. Acumulado hoy: 100 min." La barra de progreso semanal se actualiza. |
| 13 | Sistema | El cliente limpia el estado de `localStorage` del timer. El estudiante puede iniciar el descanso. |

### Flujo de sesión incompleta (RN-04)

| Paso | Responsable | Acción |
|---|---|---|
| 1 | Estudiante | Inicia sesión de 25 min. |
| 2 | Estudiante | Pausa manualmente 3 veces, dos de ellas por más de 1 minuto. |
| 3 | Cliente | Registra `pause_count_over_1min = 2` localmente. |
| 4 | Timer llega a 0 | Suena la alarma. |
| 5 | Sistema | Servidor recibe `pause_count_over_1min: 2`. `evaluateSessionStatus(2, 25)` → 2 pausas = exactamente el límite → `status = 'completada'`. |
| 5b | Si fueran 3 pausas | `evaluateSessionStatus(3, 25)` → `status = 'incompleta'`, `effective_minutes = 0`. El dashboard no suma esos minutos al progreso. |

---

## 17. Diseño de interfaz

### Filosofía de Diseño — Pastel Vibrante

EquilibraStudy sigue el enfoque **"Pastel Vibrante"** definido en la especificación: colores planos, saturados pero suaves, sin degradados, sin sombras pesadas. La interfaz es limpia, organizada y estimulante sin generar fatiga visual — coherente con el propósito de la app.

> Principios clave: **flat design** · sin degradados · bordes redondeados · mucho espacio en blanco · colores con significado semántico.

### Paleta de colores

| Color | Hex | Uso semántico |
|---|---|---|
| **Amarillo Sol** | `#F5D800` | Metas diarias, progreso, alertas positivas, botón Exportar PDF |
| **Cian Brillante** | `#00C8F5` | Temporizador activo, sesión en curso, barra de progreso del Pomodoro |
| **Azul Claro** | `#4DA6FF` | Navegación, acciones secundarias, calendario, eventos normales |
| **Naranja Coral** | `#FF8040` | Eventos urgentes (< 48h, prioridad Alta), advertencias del sistema |
| **Verde Menta** | `#33D17A` | Sesión completada, modo descanso, confirmaciones, botón Completar |
| **Lavanda Viva** | `#9B59F5` | Sección Analytics, gráficas, botón Ver estadísticas |
| **Rosa Vibrante** | `#F060A8` | Registro de fatiga / estado de ánimo, indicadores de bienestar |

**Fondos:** Siempre `#FFFFFF` (blanco) o `#F7F7F7` (gris muy claro). Los colores de la paleta nunca son fondo de pantalla completa — se usan en tarjetas, botones y etiquetas.

**Texto en botones:** nunca blanco sobre pastel (bajo contraste). Usar siempre el tono oscuro del mismo color:
```
[Iniciar sesión]    → bg #00C8F5 · texto #003D4D
[Completar ciclo]   → bg #33D17A · texto #074D22
[Ver estadísticas]  → bg #9B59F5 · texto #2D0075
[Exportar PDF]      → bg #F5D800 · texto #6B5A00
```

### Tipografía

Inter (Google Fonts). Solo dos pesos: `400` (regular) y `500` (medio). Sin bold pesado.

| Uso | Tamaño | Peso |
|---|---|---|
| Títulos de pantalla (H1) | 28px | 500 |
| Subtítulos de sección (H2) | 20px | 500 |
| Texto de cuerpo | 16px | 400 |
| Texto secundario / captions | 13px | 400 |
| Etiquetas y badges | 11–12px | 500 |

Interlineado de cuerpo: `1.7`. Texto en `#1A1A1A` (nunca negro puro `#000000`).

### Componentes clave

**Etiquetas de prioridad de eventos:**
```
Alta  → fondo #FFE9D6 · texto #8A3C10
Media → fondo #FFF6C2 · texto #8A7A00
Baja  → fondo #D6FFE9 · texto #0D6B35
```

**Tarjetas (Cards):**
- Fondo: versión muy clara del color semántico (`#D6F5FF` para cian, etc.)
- Borde: `1.5px solid` versión media del color
- `border-radius: 14px`, padding `14px 16px`

| Componente | Descripción |
|---|---|
| `PomodoroTimer` | Tarjeta central con el color cian (#00C8F5 / #D6F5FF) en modo trabajo. Tiempo restante en Inter 500 grande. Barra de progreso lineal debajo. Cambia a verde menta en modo descanso. Botones: "Pausa", "Reiniciar", "Finalizar". El botón de pausa es la acción más importante — siempre visible y con tamaño suficiente. |
| `SessionSuggestion` | Card que aparece antes de iniciar: muestra la sugerencia con su justificación (evento urgente detectado) y dos botones: "Aceptar sugerencia" y "Configurar manualmente". |
| `BlockedState` | Panel que reemplaza el PomodoroTimer cuando RN-01 está activo. Muestra: "Has acumulado 120 min de estudio. Tómate un descanso de al menos 15 min antes de continuar." Con cuenta regresiva del descanso mínimo. Fondo verde menta. |
| `FatigueSelector` | Modal post-sesión con 5 íconos (😴😕😐🙂⚡) que representan los niveles 1-5 de fatiga. |
| `GoalProgressBar` | Barra de progreso horizontal con: horas acumuladas / meta de la semana en porcentaje. Amarillo Sol para el progreso. |
| `DailyChart` | Recharts BarChart con barras cian para horas completadas y barras grises para incompletas, por hora del día. |
| `WeeklyChart` | Recharts LineChart con una línea por semana del período, en lavanda. |
| `EventCard` | Tarjeta de evento académico con nombre, fecha límite y badge de prioridad con los colores definidos. Badge naranja coral si es urgente. |
| `SeedModeBanner` | Banner amarillo estándar del curso. Solo super admin. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Computador (≥1024px) | Sidebar fijo. Dashboard con 2-3 columnas. Pomodoro centrado y grande. |
| Tablet (768–1023px) | Sidebar colapsable. Dashboard en 2 columnas. |
| Celular (<768px) | Bottom navigation. PomodoroTimer ocupa la pantalla completa. Analytics en scroll vertical. |

### Uso semántico por sección

| Sección | Color dominante |
|---|---|
| Home Dashboard | Amarillo Sol + Cian |
| Zona de Enfoque (Pomodoro) | Cian (trabajo) / Verde Menta (descanso) |
| Calendario Académico | Azul Claro + Naranja Coral |
| Analytics | Lavanda Viva |
| Registro de fatiga | Rosa Vibrante |
| Logros / metas cumplidas | Verde Menta |

---

## 18. Plan de fases de implementación

### Fase 1 — Bootstrap, Login, Registro y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Crear Blob Store privado en Vercel. Configurar variables de entorno. |
| 1.3 | Crear `data/seed.json` con super admin inicial (password `admin123` hasheado con bcrypt 10 rounds). |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql` con tabla `users` y `_migrations`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. `withAuth` agrega `Cache-Control: no-store`. |
| 1.8 | Crear `next.config.ts` con headers `no-store` para `/api/:path*`. |
| 1.9 | Crear `lib/types.ts` y `lib/schemas.ts` con tipos y schemas Zod de auth. |
| 1.10 | Crear API Routes: `POST /api/system/bootstrap`, `GET /api/system/diagnose`, `GET /api/system/mode`, `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`. |
| 1.11 | Crear `app/login/page.tsx` y `app/register/page.tsx` con la identidad visual de EquilibraStudy: paleta pastel vibrante, tipografía Inter 500, logo SVG de balance+estudio, fondo `#FFFFFF`. |
| 1.12 | Actualizar `app/page.tsx`: redirige a `/dashboard` o `/login`. |
| 1.13 | `npm run typecheck` sin errores. Probar: registro → login → cookie HttpOnly → modo seed. |

---

### Fase 2 — Dashboard, Layout base y página de bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base: Button, Card, Badge, Toast, Modal, EmptyState. |
| 2.2 | Configurar variables CSS de la paleta Pastel Vibrante en `globals.css`. Inter con `next/font`. |
| 2.3 | Crear `AppLayout.tsx`: sidebar (desktop), bottom nav (mobile). Ítems: Inicio, Zona de Enfoque, Calendario, Analytics, Perfil. Super admin ve además Administración. |
| 2.4 | Crear `/admin/db-setup/page.tsx`: diagnóstico + bootstrap. |
| 2.5 | Crear `SeedModeBanner.tsx`. |
| 2.6 | Crear `GET /api/dashboard`: próximo evento urgente, minutos de estudio hoy, progreso semanal, última sesión. En modo seed retorna estructura vacía. |
| 2.7 | Crear `app/dashboard/page.tsx`: tarjeta de meta semanal con `GoalProgressBar`, próximo evento urgente en naranja coral (si lo hay), y botón grande "Iniciar Sesión de Estudio" que lleva a `/focus`. |
| 2.8 | Crear `middleware.ts`: protege rutas privadas, `/admin/*` solo para `role = 'super_admin'`. |
| 2.9 | Probar: registro → dashboard → bootstrap → modo live. |

---

### Fase 3 — Calendario Académico
> Rol: Ingeniero Fullstack + Diseñador Frontend

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_events.sql`. Aplicar desde `/admin/db-setup`. |
| 3.2 | Agregar tipos `AcademicEvent`, `CreateEventRequest`, `UpdateEventRequest` y schemas Zod. |
| 3.3 | Extender `dataService`: `getAcademicEvents`, `getUrgentEvents` (priority='alta' AND deadline < NOW() + 48h), `createAcademicEvent`, `updateAcademicEvent`, `deleteAcademicEvent`. Cada escritura llama `recordAudit`. |
| 3.4 | API Routes: `GET/POST /api/events`, `PUT/DELETE /api/events/[id]`, `GET /api/events/urgent`. |
| 3.5 | Crear `app/calendar/page.tsx`: grilla mensual simple con los eventos del usuario. Código de colores por prioridad: Azul Claro para Media/Baja, Naranja Coral para Alta. |
| 3.6 | Crear `EventForm`: formulario con nombre, fecha límite, prioridad y notas. |
| 3.7 | Integrar los eventos urgentes en el dashboard: si existe al menos uno, mostrar el más próximo con badge Naranja Coral. |

---

### Fase 4 — Zona de Enfoque (Pomodoro)
> Rol: Ingeniero Fullstack Senior — Módulo más complejo y central del sistema

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_sessions.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Crear `lib/sessionService.ts`: `getSmartSuggestion`, `evaluateSessionStatus`, `getContinuousStudyMinutes`. |
| 4.3 | Agregar tipos `StudySession`, `SessionSuggestion`, `SaveSessionRequest`, `SessionEvaluation` y schemas Zod (validar RN-02: break_duration_min >= floor(work_duration_min / 25) * 5). |
| 4.4 | Extender `dataService`: `saveStudySession`, `getSessionHistory`, `getContinuousStudyMinutes`. |
| 4.5 | API Routes: `GET /api/sessions/suggestion`, `POST /api/sessions`, `GET /api/sessions/history`, `GET /api/sessions/continuous`. |
| 4.6 | Crear `components/focus/PomodoroTimer.tsx` como Client Component ('use client'). El timer usa `Date.now()` como referencia (no `setInterval` como contador). Al pausar manualmente, registrar el timestamp de inicio de la pausa. Al reanudar, calcular la duración de la pausa. Si la pausa fue > 1 minuto, incrementar `pauseCountOver1min`. Estado completo guardado en `localStorage` para sobrevivir recargas. |
| 4.7 | Crear `components/focus/SessionSuggestion.tsx`: card con la sugerencia inteligente y dos botones. |
| 4.8 | Crear `components/focus/BlockedState.tsx`: pantalla de bloqueo por RN-01 con cuenta regresiva del descanso mínimo de 15 min. |
| 4.9 | Crear `components/focus/FatigueSelector.tsx`: modal post-sesión con 5 íconos de fatiga. |
| 4.10 | Crear `app/focus/page.tsx`: flujo completo. Al cargar: consultar `/api/sessions/continuous` (si >= 120 → mostrar BlockedState). Si no: consultar `/api/sessions/suggestion` → mostrar SessionSuggestion → al confirmar, mostrar PomodoroTimer. Al terminar el timer → mostrar FatigueSelector → `POST /api/sessions` con el resumen → mostrar resultado. |
| 4.11 | Alerta sonora: Web Audio API — un beep simple al finalizar cada intervalo. Sin archivos de audio externos. |
| 4.12 | Al guardar la sesión, el servidor llama `sessionService.getContinuousStudyMinutes(userId)` para devolver al cliente el total acumulado del día en la respuesta. |

---

### Fase 5 — Metas Semanales y Analytics
> Rol: Ingeniero Fullstack + Diseñador Frontend — Datos y visualizaciones

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0004_init_goals.sql`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Crear `lib/analyticsService.ts`: `buildDailyStats` (minutos por hora del día), `buildWeeklyStats` (minutos por día de la semana), `buildMonthlyStats` (minutos por día del mes), `getWeeklyProgress` (acumulado vs. meta). |
| 5.3 | Agregar tipos `WeeklyGoal`, `WeeklyProgress`, `DailyStats`, `WeeklyStats`, `MonthlyStats` y schemas Zod. |
| 5.4 | Extender `dataService`: `getWeeklyGoal`, `upsertWeeklyGoal`, `getWeeklyProgress`, `getDailyStats`, `getWeeklyStats`, `getMonthlyStats`. |
| 5.5 | API Routes: `GET/POST /api/goals`, `GET /api/goals/progress`, `GET /api/analytics/daily?date=`, `GET /api/analytics/weekly?weekStart=`, `GET /api/analytics/monthly?year=&month=`. |
| 5.6 | Instalar `recharts`. |
| 5.7 | Crear `components/analytics/DailyChart.tsx`: BarChart con barras cian (completadas) y grises (incompletas) agrupadas por hora del día. |
| 5.8 | Crear `components/analytics/WeeklyChart.tsx`: LineChart en lavanda con horas por día de la semana. |
| 5.9 | Crear `components/analytics/MonthlyChart.tsx`: BarChart con horas por día del mes en lavanda. |
| 5.10 | Crear `components/analytics/GoalProgressBar.tsx`: barra Amarillo Sol con horas / meta y porcentaje. |
| 5.11 | Crear `app/analytics/page.tsx`: selector de vista (Día / Semana / Mes), gráfica correspondiente, tarjetas de stats clave (total horas, sesiones completadas, sesiones incompletas, nivel de fatiga promedio), barra de meta semanal. |
| 5.12 | Crear formulario de meta semanal en `/profile` o directamente en el dashboard. |
| 5.13 | Actualizar `GET /api/dashboard` con datos reales: progreso semanal, minutos de estudio hoy, nivel de fatiga promedio de las últimas 3 sesiones. |

---

### Fase 6 — Exportación PDF y Perfil
> Rol: Ingeniero Backend Senior + Diseñador Frontend

| # | Tarea |
|---|---|
| 6.1 | Instalar `jspdf jspdf-autotable`. |
| 6.2 | Crear `lib/reportService.ts`: `generateMonthlyPDF(userId, year, month)`. El PDF incluye: cabecera con nombre del usuario y período, tabla de sesiones del mes (fecha, duración, estado, fatiga), resumen: total de horas efectivas, sesiones completadas vs. incompletas, meta del mes y porcentaje alcanzado, gráfica de horas por semana (renderizada como imagen base64 desde el servidor si es posible, o como tabla de datos). |
| 6.3 | API Route: `GET /api/reports/monthly?year=&month=` → genera el PDF en el servidor, lo retorna con `Content-Type: application/pdf` y `Content-Disposition: attachment`. Sin datos en el período → 404 con mensaje claro. |
| 6.4 | Agregar botón "Exportar PDF" (fondo `#F5D800`, texto `#6B5A00`) en la vista mensual de Analytics. Spinner durante la generación. |
| 6.5 | Crear `app/profile/page.tsx`: nombre del usuario, email (solo lectura), formulario de cambio de contraseña y formulario de meta semanal predeterminada. |

---

### Fase 7 — Administración y Pulido final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack — Cierre

| # | Tarea |
|---|---|
| 7.1 | API Routes con verificación de `role = 'super_admin'`: `GET/POST /api/users`, `GET/PUT /api/users/[id]`. |
| 7.2 | Crear `app/admin/users/page.tsx`: tabla de usuarios con nombre, email, fecha de registro, estado. Acciones: activar/suspender. |
| 7.3 | Crear `app/admin/audit/page.tsx`: `AuditViewer` con selector de mes. Lee de Blob. |
| 7.4 | Auditoría de empty states: Analytics sin sesiones, Calendario sin eventos, Dashboard en primer uso. Mensajes con el tono de EquilibraStudy ("Completa tu primera sesión para ver tus estadísticas."). |
| 7.5 | Manejo de errores global: 401 (sesión expirada), 403 con `MANDATORY_BREAK` (bloqueo por RN-01 — no toast, mostrar BlockedState), 403 genérico, 500. |
| 7.6 | Verificar el PomodoroTimer en producción: iniciar sesión → cambiar de tab → volver → el timer debe haber avanzado el tiempo correcto (usa Date.now()). Recargar la página → el timer debe continuar desde donde estaba (localStorage). |
| 7.7 | Verificar RN-01 en producción: simular 120 min acumulados de hoy → intentar iniciar nueva sesión → debe mostrar BlockedState. |
| 7.8 | Verificar RN-04: crear sesión con 3 pausas > 1 min → verificar que se guarda como `incompleta` y no suma al progreso. |
| 7.9 | Verificar RN-05: crear evento Alta prioridad con deadline en 24h → ir a Zona de Enfoque → verificar que la sugerencia es 50/10. |
| 7.10 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 7.11 | Deploy en Vercel con todas las variables de entorno. |
| 7.12 | Probar en producción: registro → bootstrap → crear evento urgente → iniciar sesión inteligente → completar sesión → registrar fatiga → ver analytics con la sesión → exportar PDF del mes. |

---

## 19. Estrategia de seguridad

### Flujo de login

```
1. Validar body con Zod (loginSchema)
2. dataService.getUserByEmail(email)  ← seed o Postgres
3. Verificar is_active y password con bcrypt.compare()
4. Si must_change_password: flag en JWT → redirect /profile
5. JWT({ userId, role, email }, 24h) → cookie HttpOnly, Secure, SameSite=Strict
6. dataService.recordAudit({ action: 'login', ... })
7. Retornar SafeUser
```

### Privacidad de datos (RN-03)

Todas las queries filtran por `user_id = userId_del_JWT`. Las queries del super admin solo acceden a métricas agregadas. No existe ningún endpoint que permita al super admin consultar las sesiones individuales o los eventos de otro usuario.

---

## 20. Restricciones del sistema

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Sin sincronización con calendarios externos | Google Calendar y Outlook en v2. |
| RS-02 | Sin alertas sonoras en iOS sin interacción previa | Web Audio API requiere que el usuario haya interactuado con la página antes de reproducir sonido. En iOS Safari, la alerta sonora funciona solo si el usuario tocó la pantalla antes de iniciar el timer. |
| RS-03 | Timer solo en la misma pestaña | El timer de `localStorage` persiste si el usuario recarga, pero si abre la app en otra pestaña simultáneamente puede haber inconsistencias. |
| RS-04 | Sin notificaciones push | Las alertas son visuales y sonoras en pantalla. Sin Service Workers ni push en v1. |
| RS-05 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login admin. |

---

## 21. Glosario

| Término | Definición |
|---|---|
| **Pomodoro** | Técnica de gestión del tiempo: bloques de trabajo concentrado alternados con descansos cortos. |
| **Sesión de estudio** | Un ciclo Pomodoro completo: desde que el timer inicia hasta que llega a cero. |
| **Sesión completada** | Sesión con máximo 2 pausas manuales > 1 min. Suma al progreso del estudiante. |
| **Sesión incompleta** | Sesión con más de 2 pausas > 1 min. Se guarda en el historial pero no suma al progreso. |
| **Sesión inteligente** | Sesión cuya duración fue sugerida por el sistema basándose en eventos urgentes próximos. |
| **Evento académico** | Examen, entrega o actividad con fecha límite y nivel de prioridad registrado en el calendario. |
| **Evento urgente** | Evento con prioridad Alta y deadline en menos de 48 horas. Activa la sugerencia de sesión larga (50/10). |
| **Fatiga** | Nivel subjetivo de agotamiento del estudiante al finalizar una sesión (escala 1–5). |
| **Meta semanal** | Número de horas de estudio efectivo que el estudiante quiere alcanzar en una semana. |
| **Bloqueo por acumulación** | Estado activado por RN-01 que impide iniciar nueva sesión hasta completar 15 min de descanso. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **Modo seed** | Estado antes del bootstrap. Solo permite login admin. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> Laura Celedon — Doc: 1128201459
> Curso: Lógica y Programación — SIST0200

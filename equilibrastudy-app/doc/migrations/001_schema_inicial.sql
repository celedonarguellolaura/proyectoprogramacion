-- EquilibraStudy — Schema inicial
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- Laura Celedon · Doc: 1128201459 · SIST0200
--
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com/dashboard/project/ebnqasrxhwodxxvkrmex/sql
-- 2. Haz clic en "New query"
-- 3. Pega TODO este archivo y haz clic en "Run"

-- ─── Tabla: system_config ────────────────────────────────────────────────────
-- Guarda el modo del sistema (seed → live tras bootstrap)
CREATE TABLE IF NOT EXISTS system_config (
  key   VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL
);

-- ─── Migration 0001: users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'estudiante'
                CHECK (role IN ('estudiante', 'super_admin')),
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ─── Migration 0002: academic_events ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_events (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  deadline   TIMESTAMPTZ  NOT NULL,
  priority   VARCHAR(10)  NOT NULL DEFAULT 'media'
             CHECK (priority IN ('alta', 'media', 'baja')),
  notes      TEXT,
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id  ON academic_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_deadline ON academic_events(deadline);

-- ─── Migration 0003: study_sessions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_sessions (
  id                    UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at            TIMESTAMPTZ NOT NULL,
  ended_at              TIMESTAMPTZ NOT NULL,
  work_duration_min     INTEGER     NOT NULL,
  break_duration_min    INTEGER     NOT NULL,
  pause_count           INTEGER     NOT NULL DEFAULT 0,
  pause_count_over_1min INTEGER     NOT NULL DEFAULT 0,
  fatigue_level         INTEGER     CHECK (fatigue_level BETWEEN 1 AND 5),
  status                VARCHAR(20) NOT NULL
                        CHECK (status IN ('completada', 'incompleta')),
  effective_minutes     INTEGER     NOT NULL DEFAULT 0,
  was_suggested         BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON study_sessions(started_at);

-- ─── Migration 0004: weekly_goals ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_goals (
  id         UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE           NOT NULL,   -- Siempre el lunes de la semana
  goal_hours DECIMAL(4,1)   NOT NULL,
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ─── Deshabilitar RLS (usamos Service Role Key en el servidor) ────────────────
-- Con la Service Role Key el cliente ignora RLS,
-- pero es buena práctica dejarlo explícito durante el desarrollo.
ALTER TABLE system_config    DISABLE ROW LEVEL SECURITY;
ALTER TABLE users            DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_events  DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals     DISABLE ROW LEVEL SECURITY;

-- ─── Verificación ─────────────────────────────────────────────────────────────
-- Después de ejecutar, deberías ver 5 tablas en Database → Tables:
-- system_config, users, academic_events, study_sessions, weekly_goals
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

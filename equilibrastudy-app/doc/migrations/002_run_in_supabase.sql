-- EquilibraStudy — Verificación y tablas faltantes
-- Ejecutar en: https://supabase.com/dashboard/project/ebnqasrxhwodxxvkrmex/sql
-- Pega TODO esto en "New query" y haz clic en "Run"

-- ─── 1. Asegura que las 4 tablas principales existan ─────────────────────────
-- (Si ya existen, IF NOT EXISTS las omite sin error)

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

CREATE TABLE IF NOT EXISTS academic_events (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  deadline   TIMESTAMPTZ  NOT NULL,
  priority   VARCHAR(10)  NOT NULL DEFAULT 'media'
             CHECK (priority IN ('alta', 'media', 'baja')),
  notes      TEXT,
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

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
  status                VARCHAR(20) NOT NULL CHECK (status IN ('completada', 'incompleta')),
  effective_minutes     INTEGER     NOT NULL DEFAULT 0,
  was_suggested         BOOLEAN     NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_goals (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE         NOT NULL,
  goal_hours DECIMAL(4,1) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ─── 2. Deshabilitar RLS en todas las tablas ──────────────────────────────────
ALTER TABLE users            DISABLE ROW LEVEL SECURITY;
ALTER TABLE academic_events  DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals     DISABLE ROW LEVEL SECURITY;

-- ─── 3. Verificación: muestra las tablas creadas ──────────────────────────────
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users','academic_events','study_sessions','weekly_goals')
ORDER BY table_name;

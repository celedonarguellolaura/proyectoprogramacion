// ─── Usuarios ────────────────────────────────────────────────────────────────

export type UserRole = 'estudiante' | 'super_admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

export interface JwtUser {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

// ─── Eventos académicos ───────────────────────────────────────────────────────

export type EventPriority = 'alta' | 'media' | 'baja';

export interface AcademicEvent {
  id: string;
  user_id: string;
  name: string;
  deadline: string;
  priority: EventPriority;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  name: string;
  deadline: string;
  priority: EventPriority;
  notes?: string;
}

// ─── Sesiones de estudio ──────────────────────────────────────────────────────

export type SessionStatus = 'completada' | 'incompleta';

export interface StudySession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string;
  work_duration_min: number;
  break_duration_min: number;
  pause_count: number;
  pause_count_over_1min: number;
  fatigue_level?: number;
  status: SessionStatus;
  effective_minutes: number;
  was_suggested: boolean;
  created_at: string;
}

export interface CreateSessionInput {
  work_duration_min: number;
  break_duration_min: number;
  pause_count_over_1min: number;
  fatigue_level?: number;
  was_suggested: boolean;
  started_at: string;
  ended_at: string;
}

// ─── Metas semanales ─────────────────────────────────────────────────────────

export interface WeeklyGoal {
  id: string;
  user_id: string;
  week_start: string;
  goal_hours: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyProgress {
  accumulated: number;
  goal: number | null;
  percentage: number | null;
}

// ─── Sugerencia de sesión ─────────────────────────────────────────────────────

export interface SessionSuggestion {
  work_min: number;
  break_min: number;
  reason: string | null;
}

export interface SessionEvaluation {
  status: SessionStatus;
  effective_minutes: number;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface HourlyData {
  hour: number;
  effective_minutes: number;
  incomplete_minutes: number;
}

export interface DailyStats {
  date: string;
  hourly: HourlyData[];
  total_effective_minutes: number;
  total_incomplete_minutes: number;
  sessions_completed: number;
  sessions_incomplete: number;
  avg_fatigue: number | null;
}

export interface DayStats {
  day: number;
  effective_hours: number;
  sessions_completed: number;
  sessions_incomplete: number;
}

export interface WeeklyStats {
  week_start: string;
  days: DayStats[];
  total_effective_hours: number;
}

export interface MonthlyStats {
  year: number;
  month: number;
  days: DayStats[];
  total_effective_hours: number;
  avg_fatigue: number | null;
}

// ─── Sistema ──────────────────────────────────────────────────────────────────

export type SystemMode = 'seed' | 'live';

export interface AuditEntry {
  timestamp: string;
  event: string;
  userId?: string;
  detail?: string;
}

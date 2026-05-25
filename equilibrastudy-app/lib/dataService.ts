/**
 * dataService.ts — ÚNICA capa de acceso a datos.
 * Es el único módulo que importa supabase.ts y blobAudit.ts.
 * Ningún API Route ni componente importa esos módulos directamente.
 */

import bcrypt from 'bcryptjs';
import { getSupabase } from './supabase';
import { appendAuditEntry } from './blobAudit';
import type {
  User,
  CreateUserInput,
  AcademicEvent,
  CreateEventInput,
  StudySession,
  CreateSessionInput,
  WeeklyGoal,
  WeeklyProgress,
  SystemMode,
} from './types';

// ─── Usuarios ────────────────────────────────────────────────────────────────

export async function createUser(data: CreateUserInput): Promise<User> {
  const db = getSupabase();
  const password_hash = await bcrypt.hash(data.password, 12);

  const { data: user, error } = await db
    .from('users')
    .insert({
      email: data.email.toLowerCase().trim(),
      password_hash,
      name: data.name.trim(),
      role: 'estudiante', // Siempre 'estudiante' en registro público (RS-01)
      is_active: true,
    })
    .select('id, email, name, role, is_active, created_at, updated_at')
    .single();

  if (error) throw new Error(error.message);
  return user as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from('users')
    .select('id, email, name, role, is_active, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data as User;
}

export async function getUserByEmail(
  email: string
): Promise<(User & { password_hash: string }) | null> {
  const db = getSupabase();
  const { data, error } = await db
    .from('users')
    .select('id, email, name, role, is_active, password_hash, created_at, updated_at')
    .eq('email', email.toLowerCase().trim())
    .single();
  if (error || !data) return null;
  return data as User & { password_hash: string };
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name' | 'is_active'>>
): Promise<User> {
  const db = getSupabase();
  const { data, error } = await db
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, email, name, role, is_active, created_at, updated_at')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Error actualizando usuario');
  return data as User;
}

export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const db = getSupabase();
  const password_hash = await bcrypt.hash(newPassword, 12);
  const { error } = await db
    .from('users')
    .update({ password_hash, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function listUsers(): Promise<User[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from('users')
    .select('id, email, name, role, is_active, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as User[];
}

export async function verifyUserPassword(
  user: User & { password_hash: string },
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

// ─── Sistema ─────────────────────────────────────────────────────────────────

export async function getSystemMode(): Promise<SystemMode> {
  try {
    const db = getSupabase();
    const { data, error } = await db
      .from('system_config')
      .select('value')
      .eq('key', 'mode')
      .single();
    if (error || !data) return 'seed';
    return (data.value as SystemMode) ?? 'seed';
  } catch {
    return 'seed';
  }
}

export async function setSystemMode(mode: SystemMode): Promise<void> {
  const db = getSupabase();
  const { error } = await db
    .from('system_config')
    .upsert({ key: 'mode', value: mode }, { onConflict: 'key' });
  if (error) throw new Error(error.message);

  await appendAuditEntry({
    timestamp: new Date().toISOString(),
    event: 'SYSTEM_MODE_CHANGED',
    detail: `Mode changed to: ${mode}`,
  });
}

export async function bootstrapDatabase(
  adminPassword: string,
  adminName: string
): Promise<void> {
  const mode = await getSystemMode();
  if (mode === 'live') throw new Error('El sistema ya está en modo live');

  const db = getSupabase();
  const password_hash = await bcrypt.hash(adminPassword, 12);

  const { error } = await db.from('users').insert({
    email: 'admin@equilibrastudy.com',
    password_hash,
    name: adminName.trim(),
    role: 'super_admin',
    is_active: true,
  });

  // Ignorar error de duplicado si el admin ya existe
  if (error && !error.message.toLowerCase().includes('duplicate')) {
    throw new Error(error.message);
  }

  await setSystemMode('live');

  await appendAuditEntry({
    timestamp: new Date().toISOString(),
    event: 'BOOTSTRAP_COMPLETED',
    detail: 'Database bootstrapped, mode set to live',
  });
}

// ─── Eventos académicos ───────────────────────────────────────────────────────

export async function createAcademicEvent(
  userId: string,
  data: CreateEventInput
): Promise<AcademicEvent> {
  const db = getSupabase();
  const { data: event, error } = await db
    .from('academic_events')
    .insert({ user_id: userId, ...data, is_active: true })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return event as AcademicEvent;
}

export async function getAcademicEvents(userId: string): Promise<AcademicEvent[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from('academic_events')
    .select()
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('deadline', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AcademicEvent[];
}

// Eventos urgentes: Alta + deadline < 48h (RN-05)
export async function getUrgentEvents(userId: string): Promise<AcademicEvent[]> {
  const db = getSupabase();
  const now = new Date().toISOString();
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data, error } = await db
    .from('academic_events')
    .select()
    .eq('user_id', userId)
    .eq('priority', 'alta')
    .eq('is_active', true)
    .gt('deadline', now)
    .lt('deadline', in48h)
    .order('deadline', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as AcademicEvent[];
}

export async function updateAcademicEvent(
  id: string,
  data: Partial<Pick<AcademicEvent, 'name' | 'deadline' | 'priority' | 'notes' | 'is_active'>>
): Promise<AcademicEvent> {
  const db = getSupabase();
  const { data: event, error } = await db
    .from('academic_events')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return event as AcademicEvent;
}

export async function deleteAcademicEvent(id: string): Promise<void> {
  const db = getSupabase();
  const { error } = await db
    .from('academic_events')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Sesiones de estudio ──────────────────────────────────────────────────────

export async function createStudySession(
  userId: string,
  data: CreateSessionInput
): Promise<StudySession> {
  const db = getSupabase();
  const { data: session, error } = await db
    .from('study_sessions')
    .insert({ user_id: userId, ...data })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return session as StudySession;
}

export async function getStudySessions(
  userId: string,
  from: Date,
  to: Date
): Promise<StudySession[]> {
  const db = getSupabase();
  const { data, error } = await db
    .from('study_sessions')
    .select()
    .eq('user_id', userId)
    .gte('started_at', from.toISOString())
    .lte('started_at', to.toISOString())
    .order('started_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as StudySession[];
}

export async function getTodaySessions(userId: string): Promise<StudySession[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return getStudySessions(userId, start, end);
}

// ─── Metas semanales ─────────────────────────────────────────────────────────

export async function upsertWeeklyGoal(
  userId: string,
  weekStart: Date,
  goalHours: number
): Promise<WeeklyGoal> {
  const db = getSupabase();
  const weekStartStr = weekStart.toISOString().slice(0, 10);

  const { data, error } = await db
    .from('weekly_goals')
    .upsert(
      { user_id: userId, week_start: weekStartStr, goal_hours: goalHours },
      { onConflict: 'user_id,week_start' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as WeeklyGoal;
}

export async function getWeeklyGoal(
  userId: string,
  weekStart: Date
): Promise<WeeklyGoal | null> {
  const db = getSupabase();
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const { data, error } = await db
    .from('weekly_goals')
    .select()
    .eq('user_id', userId)
    .eq('week_start', weekStartStr)
    .single();
  if (error || !data) return null;
  return data as WeeklyGoal;
}

function getMondayOfCurrentWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function getWeeklyProgress(userId: string): Promise<WeeklyProgress> {
  const monday = getMondayOfCurrentWeek();

  const [goal, sessions] = await Promise.all([
    getWeeklyGoal(userId, monday),
    getStudySessions(userId, monday, new Date()),
  ]);

  const accumulatedMinutes = sessions
    .filter((s) => s.status === 'completada')
    .reduce((sum, s) => sum + s.effective_minutes, 0);

  const accumulated = accumulatedMinutes / 60;

  if (!goal) return { accumulated, goal: null, percentage: null };

  const percentage = Math.min(100, Math.round((accumulated / goal.goal_hours) * 100));
  return { accumulated, goal: goal.goal_hours, percentage };
}

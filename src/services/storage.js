import { supabase } from './supabaseClient'
import { lsqlAddUser, lsqlFindUser, lsqlGetUsers, lsqlUpdateUser } from './localDb'

// ── localStorage helpers (timer, sesión activa, sesiones de estudio, etc.) ───
const K = {
  SESSION: 'eq_session', SESSIONS: 'eq_study_sessions',
  EVENTS: 'eq_events', GOALS: 'eq_goals', AUDIT: 'eq_audit', TIMER: 'eq_timer',
}
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(def)) } catch { return def } }
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val))

// ── Supabase user functions ───────────────────────────────────────────────────

async function sbAddUser(user) {
  const { error } = await supabase.from('users').insert({
    id: user.id,
    email: user.email,
    password_hash: user.pass,
    name: user.name,
    role: user.role ?? 'estudiante',
    is_active: user.isActive ?? true,
  })
  if (error) throw error
  return user
}

async function sbFindUser(email) {
  const { data } = await supabase
    .from('users')
    .select('id, email, name, role, is_active, password_hash, created_at')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()
  if (!data) return null
  return { id: data.id, email: data.email, name: data.name, role: data.role, isActive: data.is_active, pass: data.password_hash, createdAt: data.created_at }
}

async function sbGetUsers() {
  const { data } = await supabase
    .from('users')
    .select('id, email, name, role, is_active, password_hash, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []).map(d => ({ id: d.id, email: d.email, name: d.name, role: d.role, isActive: d.is_active, pass: d.password_hash, createdAt: d.created_at }))
}

async function sbUpdateUser(id, patch) {
  const mapped = {}
  if (patch.name      !== undefined) mapped.name          = patch.name
  if (patch.isActive  !== undefined) mapped.is_active     = patch.isActive
  if (patch.pass      !== undefined) mapped.password_hash = patch.pass
  await supabase.from('users').update(mapped).eq('id', id)
}

// ── Routing: Supabase → SQLite local → error ─────────────────────────────────

async function userOp(sbFn, sqlFn, ...args) {
  if (supabase) {
    try { return await sbFn(...args) } catch (e) {
      // Si es error de red/config, caemos a SQLite; si es error de negocio (duplicate), relanzamos
      const msg = e?.message ?? ''
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already')) throw e
      console.warn('Supabase no disponible, usando SQLite local:', msg)
    }
  }
  return sqlFn(...args)
}

// ── API pública ───────────────────────────────────────────────────────────────

export const storage = {
  // ── Users (Supabase primero, SQLite local como fallback) ────────────────────
  addUser:    (user)      => userOp(sbAddUser,    lsqlAddUser,    user),
  findUser:   (email)     => userOp(sbFindUser,   lsqlFindUser,   email),
  getUsers:   ()          => userOp(sbGetUsers,   lsqlGetUsers),
  updateUser: (id, patch) => userOp(sbUpdateUser, lsqlUpdateUser, id, patch),

  // ── Sesión activa (localStorage) ────────────────────────────────────────────
  getSession:   () => load(K.SESSION, null),
  saveSession:  (u) => save(K.SESSION, u),
  clearSession: () => localStorage.removeItem(K.SESSION),

  // ── Sesiones de estudio (localStorage) ──────────────────────────────────────
  getSessions:   (userId) => load(K.SESSIONS, []).filter(s => !userId || s.userId === userId),
  getAllSessions: ()       => load(K.SESSIONS, []),
  addSession:    (s)      => { const a = load(K.SESSIONS, []); a.push(s); save(K.SESSIONS, a); return s },

  // ── Eventos (localStorage) ───────────────────────────────────────────────────
  getEvents:   (userId) => load(K.EVENTS, []).filter(e => e.userId === userId && e.isActive !== false),
  saveEvent:   (ev)     => { const a = load(K.EVENTS, []); const i = a.findIndex(e => e.id === ev.id); if (i >= 0) a[i] = ev; else a.push(ev); save(K.EVENTS, a); return ev },
  deleteEvent: (id)     => { const a = load(K.EVENTS, []); const i = a.findIndex(e => e.id === id); if (i >= 0) { a[i].isActive = false; save(K.EVENTS, a) } },

  // ── Metas (localStorage) ─────────────────────────────────────────────────────
  getGoal:    (userId, weekStart) => load(K.GOALS, []).find(g => g.userId === userId && g.weekStart === weekStart) ?? null,
  upsertGoal: (goal) => { const a = load(K.GOALS, []); const i = a.findIndex(g => g.userId === goal.userId && g.weekStart === goal.weekStart); if (i >= 0) a[i] = goal; else a.push(goal); save(K.GOALS, a); return goal },

  // ── Timer (localStorage) ─────────────────────────────────────────────────────
  getTimer:   () => load(K.TIMER, null),
  saveTimer:  (t) => save(K.TIMER, t),
  clearTimer: () => localStorage.removeItem(K.TIMER),

  // ── Auditoría (localStorage) ─────────────────────────────────────────────────
  addAudit: (e) => { const a = load(K.AUDIT, []); a.push({ ...e, id: `a_${Date.now()}`, timestamp: new Date().toISOString() }); save(K.AUDIT, a) },
  getAudit: () => load(K.AUDIT, []),
}

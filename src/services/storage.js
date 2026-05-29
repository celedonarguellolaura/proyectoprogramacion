import { supabase } from './supabaseClient'
import { lsqlAddUser, lsqlFindUser, lsqlGetUsers, lsqlUpdateUser } from './localDb'

// ── localStorage helpers ──────────────────────────────────────────────────────
const K   = { SESSION: 'eq_session', TIMER: 'eq_timer', AUDIT: 'eq_audit' }
const LS  = { S: 'eq_study_sessions', E: 'eq_events', G: 'eq_goals' }

const _load = (k, d) => { try { return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(d)) } catch { return d } }
const _save = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const load  = (k, d) => _load(k, d)
const save  = (k, v) => _save(k, v)

// ── localStorage: sessions ────────────────────────────────────────────────────
const lsGetSessions    = (uid) => _load(LS.S, []).filter(s => !uid || s.userId === uid)
const lsGetAllSessions = ()    => _load(LS.S, [])
const lsAddSession     = (s)   => { const a = _load(LS.S, []); a.push(s); _save(LS.S, a); return s }

// ── localStorage: events ──────────────────────────────────────────────────────
const lsGetEvents   = (uid) => _load(LS.E, []).filter(e => e.userId === uid && e.isActive !== false)
const lsSaveEvent   = (ev)  => { const a = _load(LS.E, []); const i = a.findIndex(e => e.id === ev.id); if (i >= 0) a[i] = ev; else a.push(ev); _save(LS.E, a); return ev }
const lsDeleteEvent = (id)  => { const a = _load(LS.E, []); const i = a.findIndex(e => e.id === id); if (i >= 0) { a[i] = { ...a[i], isActive: false }; _save(LS.E, a) } }

// ── localStorage: goals ───────────────────────────────────────────────────────
const lsGetGoal    = (uid, ws) => _load(LS.G, []).find(g => g.userId === uid && g.weekStart === ws) ?? null
const lsUpsertGoal = (goal)    => { const a = _load(LS.G, []); const i = a.findIndex(g => g.userId === goal.userId && g.weekStart === goal.weekStart); if (i >= 0) a[i] = goal; else a.push(goal); _save(LS.G, a); return goal }

// ── Supabase background sync (no bloquea la UI) ───────────────────────────────
const bg = (fn) => { if (supabase) fn().catch(e => console.warn('[Supabase bg]', e?.message)) }

// ── Supabase: sessions ────────────────────────────────────────────────────────
async function sbAddSession(s) {
  const { data, error } = await supabase.from('study_sessions').insert({
    user_id: s.userId, started_at: s.startedAt, ended_at: s.endedAt,
    work_duration_min: s.workDurationMin, break_duration_min: s.breakDurationMin,
    pause_count: s.pauseCount ?? 0, pause_count_over_1min: s.pauseCountOver1min ?? 0,
    fatigue_level: s.fatigueLevel ?? null, status: s.status,
    effective_minutes: s.effectiveMinutes ?? 0, was_suggested: s.wasSuggested ?? false,
  }).select('id').single()
  if (error) throw error
  return { ...s, id: data.id }
}

async function sbGetSessions(uid) {
  let q = supabase.from('study_sessions')
    .select('id,user_id,started_at,ended_at,work_duration_min,break_duration_min,pause_count,pause_count_over_1min,fatigue_level,status,effective_minutes,was_suggested')
    .order('started_at', { ascending: true })
  if (uid) q = q.eq('user_id', uid)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(d => ({
    id: d.id, userId: d.user_id, startedAt: d.started_at, endedAt: d.ended_at,
    workDurationMin: d.work_duration_min, breakDurationMin: d.break_duration_min,
    pauseCount: d.pause_count, pauseCountOver1min: d.pause_count_over_1min,
    fatigueLevel: d.fatigue_level, status: d.status,
    effectiveMinutes: d.effective_minutes, wasSuggested: d.was_suggested,
  }))
}

// ── Supabase: events ──────────────────────────────────────────────────────────
const isLocalId = (id) => !id || /^(ev_|s_|u_)/.test(id)

async function sbGetEvents(uid) {
  const { data, error } = await supabase.from('academic_events')
    .select('id,user_id,name,deadline,priority,notes,is_active,created_at')
    .eq('user_id', uid).eq('is_active', true).order('deadline', { ascending: true })
  if (error) throw error
  return (data ?? []).map(d => ({ id: d.id, userId: d.user_id, name: d.name, deadline: d.deadline, priority: d.priority, notes: d.notes, isActive: d.is_active, createdAt: d.created_at }))
}

async function sbSaveEvent(ev) {
  if (isLocalId(ev.id)) {
    const { data, error } = await supabase.from('academic_events').insert({
      user_id: ev.userId, name: ev.name, deadline: ev.deadline,
      priority: ev.priority, notes: ev.notes ?? null, is_active: true,
    }).select('id,user_id,name,deadline,priority,notes,is_active,created_at').single()
    if (error) throw error
    const saved = { id: data.id, userId: data.user_id, name: data.name, deadline: data.deadline, priority: data.priority, notes: data.notes, isActive: data.is_active, createdAt: data.created_at }
    // Actualiza el id local → UUID en localStorage
    const all = _load(LS.E, [])
    const idx = all.findIndex(e => e.id === ev.id)
    if (idx >= 0) { all[idx] = saved; _save(LS.E, all) }
    return saved
  } else {
    const { error } = await supabase.from('academic_events')
      .update({ name: ev.name, deadline: ev.deadline, priority: ev.priority, notes: ev.notes ?? null })
      .eq('id', ev.id)
    if (error) throw error
    return ev
  }
}

async function sbDeleteEvent(id) {
  if (isLocalId(id)) return
  const { error } = await supabase.from('academic_events').update({ is_active: false }).eq('id', id)
  if (error) throw error
}

// ── Supabase: goals ───────────────────────────────────────────────────────────
async function sbGetGoal(uid, ws) {
  const { data } = await supabase.from('weekly_goals')
    .select('id,user_id,week_start,goal_hours').eq('user_id', uid).eq('week_start', ws).maybeSingle()
  if (!data) return null
  return { id: data.id, userId: data.user_id, weekStart: data.week_start, goalHours: parseFloat(data.goal_hours) }
}

async function sbUpsertGoal(goal) {
  const { error } = await supabase.from('weekly_goals').upsert(
    { user_id: goal.userId, week_start: goal.weekStart, goal_hours: goal.goalHours },
    { onConflict: 'user_id,week_start' }
  )
  if (error) throw error
  return goal
}

// ── Supabase: users ───────────────────────────────────────────────────────────
async function sbAddUser(user) {
  const { data, error } = await supabase.from('users').insert({
    email: user.email, password_hash: user.pass, name: user.name,
    role: user.role ?? 'estudiante', is_active: user.isActive ?? true,
  }).select('id,email,name,role,is_active,created_at').single()
  if (error) throw error
  return { id: data.id, email: data.email, name: data.name, role: data.role, isActive: data.is_active, pass: user.pass, createdAt: data.created_at }
}

async function sbFindUser(email) {
  const { data } = await supabase.from('users')
    .select('id,email,name,role,is_active,password_hash,created_at')
    .eq('email', email.toLowerCase().trim()).maybeSingle()
  if (!data) return null
  return { id: data.id, email: data.email, name: data.name, role: data.role, isActive: data.is_active, pass: data.password_hash, createdAt: data.created_at }
}

async function sbGetUsers() {
  const { data } = await supabase.from('users')
    .select('id,email,name,role,is_active,password_hash,created_at').order('created_at', { ascending: false })
  return (data ?? []).map(d => ({ id: d.id, email: d.email, name: d.name, role: d.role, isActive: d.is_active, pass: d.password_hash, createdAt: d.created_at }))
}

async function sbUpdateUser(id, patch) {
  const m = {}
  if (patch.name      !== undefined) m.name          = patch.name
  if (patch.isActive  !== undefined) m.is_active     = patch.isActive
  if (patch.pass      !== undefined) m.password_hash = patch.pass
  const { error } = await supabase.from('users').update(m).eq('id', id)
  if (error) throw error
}

async function userOp(sbFn, sqlFn, ...args) {
  if (supabase) {
    try { return await sbFn(...args) } catch (e) {
      const msg = e?.message ?? ''
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already')) throw e
      console.warn('[Supabase users]', msg)
    }
  }
  return sqlFn(...args)
}

// ════════════════════════════════════════════════════════════════════════════
//  API PÚBLICA — CACHE FIRST: localStorage inmediato + Supabase en el fondo
// ════════════════════════════════════════════════════════════════════════════

export const storage = {
  // ── Usuarios (Supabase con fallback SQLite — siempre async) ─────────────────
  addUser:    (u)      => userOp(sbAddUser,    lsqlAddUser,    u),
  findUser:   (email)  => userOp(sbFindUser,   lsqlFindUser,   email),
  getUsers:   ()       => userOp(sbGetUsers,   lsqlGetUsers),
  updateUser: (id, p)  => userOp(sbUpdateUser, lsqlUpdateUser, id, p),

  // ── Sesiones — localStorage INMEDIATO, Supabase en el fondo ─────────────────
  addSession: (s) => {
    lsAddSession(s)                             // ← guarda al instante
    bg(() => sbAddSession(s).then(saved => {    // ← sincroniza en el fondo
      const all = _load(LS.S, [])
      const idx = all.findIndex(x => x.id === s.id)
      if (idx >= 0) { all[idx] = saved; _save(LS.S, all) }
    }))
    return s
  },
  getSessions: (uid) => {
    bg(async () => {
      const fresh = await sbGetSessions(uid)
      if (fresh?.length) {
        const rest = _load(LS.S, []).filter(x => x.userId !== uid)
        _save(LS.S, [...rest, ...fresh])
      }
    })
    return lsGetSessions(uid)                  // ← retorna al instante
  },
  getAllSessions: () => {
    bg(async () => {
      const fresh = await sbGetSessions(null)
      if (fresh?.length) _save(LS.S, fresh)
    })
    return lsGetAllSessions()                  // ← retorna al instante
  },

  // ── Eventos — localStorage INMEDIATO, Supabase en el fondo ──────────────────
  getEvents: (uid) => {
    bg(async () => {
      const fresh = await sbGetEvents(uid)
      if (fresh) {
        const rest = _load(LS.E, []).filter(e => e.userId !== uid)
        _save(LS.E, [...rest, ...fresh])
      }
    })
    return lsGetEvents(uid)                    // ← retorna al instante
  },
  saveEvent: (ev) => {
    lsSaveEvent(ev)                            // ← guarda al instante
    bg(() => sbSaveEvent(ev))                  // ← sincroniza en el fondo
    return ev
  },
  deleteEvent: (id) => {
    lsDeleteEvent(id)                          // ← borra al instante
    bg(() => sbDeleteEvent(id))                // ← sincroniza en el fondo
  },

  // ── Metas — localStorage INMEDIATO, Supabase en el fondo ────────────────────
  getGoal: (uid, ws) => {
    bg(async () => {
      const fresh = await sbGetGoal(uid, ws)
      if (fresh) lsUpsertGoal(fresh)
    })
    return lsGetGoal(uid, ws)                  // ← retorna al instante
  },
  upsertGoal: (goal) => {
    lsUpsertGoal(goal)                         // ← guarda al instante
    bg(() => sbUpsertGoal(goal))               // ← sincroniza en el fondo
    return goal
  },

  // ── Sesión activa ────────────────────────────────────────────────────────────
  getSession:   () => load(K.SESSION, null),
  saveSession:  (u) => save(K.SESSION, u),
  clearSession: () => localStorage.removeItem(K.SESSION),

  // ── Timer ─────────────────────────────────────────────────────────────────────
  getTimer:   () => load(K.TIMER, null),
  saveTimer:  (t) => save(K.TIMER, t),
  clearTimer: () => localStorage.removeItem(K.TIMER),

  // ── Auditoría ─────────────────────────────────────────────────────────────────
  addAudit: (e) => { const a = load(K.AUDIT, []); a.push({ ...e, id: `a_${Date.now()}`, timestamp: new Date().toISOString() }); save(K.AUDIT, a) },
  getAudit: () => load(K.AUDIT, []),
}

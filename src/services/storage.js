import { supabase } from './supabaseClient'
import { lsqlAddUser, lsqlFindUser, lsqlGetUsers, lsqlUpdateUser } from './localDb'

// ── localStorage: SOLO sesión activa y timer (estado transitorio) ─────────────
const K = { SESSION: 'eq_session', TIMER: 'eq_timer', AUDIT: 'eq_audit' }
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(def)) } catch { return def } }
const save = (key, val)  => localStorage.setItem(key, JSON.stringify(val))

// ── cloudOp: intenta Supabase, cae a fallback local si falla ─────────────────
async function cloudOp(sbFn, localFn) {
  if (supabase) {
    try { return await sbFn() } catch (e) {
      console.warn('[EquilibraStudy] Supabase error, usando localStorage:', e?.message)
      return localFn()
    }
  }
  return localFn()
}

// ── userOp: Supabase → SQLite (relanza errores de negocio) ────────────────────
async function userOp(sbFn, sqlFn, ...args) {
  if (supabase) {
    try { return await sbFn(...args) } catch (e) {
      const msg = e?.message ?? ''
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already')) throw e
      console.warn('[EquilibraStudy] Supabase no disponible, usando SQLite:', msg)
    }
  }
  return sqlFn(...args)
}

// ════════════════════════════════════════════════════════════
//  USUARIOS
// ════════════════════════════════════════════════════════════

async function sbAddUser(user) {
  const { data, error } = await supabase.from('users').insert({
    email:         user.email,
    password_hash: user.pass,
    name:          user.name,
    role:          user.role    ?? 'estudiante',
    is_active:     user.isActive ?? true,
  }).select('id, email, name, role, is_active, created_at').single()
  if (error) throw error
  return {
    id:        data.id,
    email:     data.email,
    name:      data.name,
    role:      data.role,
    isActive:  data.is_active,
    pass:      user.pass,
    createdAt: data.created_at,
  }
}

async function sbFindUser(email) {
  const { data } = await supabase
    .from('users')
    .select('id, email, name, role, is_active, password_hash, created_at')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()
  if (!data) return null
  return {
    id:        data.id,
    email:     data.email,
    name:      data.name,
    role:      data.role,
    isActive:  data.is_active,
    pass:      data.password_hash,
    createdAt: data.created_at,
  }
}

async function sbGetUsers() {
  const { data } = await supabase
    .from('users')
    .select('id, email, name, role, is_active, password_hash, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []).map(d => ({
    id: d.id, email: d.email, name: d.name, role: d.role,
    isActive: d.is_active, pass: d.password_hash, createdAt: d.created_at,
  }))
}

async function sbUpdateUser(id, patch) {
  const mapped = {}
  if (patch.name      !== undefined) mapped.name          = patch.name
  if (patch.isActive  !== undefined) mapped.is_active     = patch.isActive
  if (patch.pass      !== undefined) mapped.password_hash = patch.pass
  const { error } = await supabase.from('users').update(mapped).eq('id', id)
  if (error) throw error
}

// ════════════════════════════════════════════════════════════
//  SESIONES DE ESTUDIO
// ════════════════════════════════════════════════════════════

async function sbAddSession(s) {
  const { data, error } = await supabase.from('study_sessions').insert({
    user_id:               s.userId,
    started_at:            s.startedAt,
    ended_at:              s.endedAt,
    work_duration_min:     s.workDurationMin,
    break_duration_min:    s.breakDurationMin,
    pause_count:           s.pauseCount          ?? 0,
    pause_count_over_1min: s.pauseCountOver1min  ?? 0,
    fatigue_level:         s.fatigueLevel        ?? null,
    status:                s.status,
    effective_minutes:     s.effectiveMinutes    ?? 0,
    was_suggested:         s.wasSuggested        ?? false,
  }).select('id').single()
  if (error) throw error
  return { ...s, id: data.id }
}

async function sbGetSessions(userId) {
  let q = supabase.from('study_sessions')
    .select('id, user_id, started_at, ended_at, work_duration_min, break_duration_min, pause_count, pause_count_over_1min, fatigue_level, status, effective_minutes, was_suggested, created_at')
    .order('started_at', { ascending: true })
  if (userId) q = q.eq('user_id', userId)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(d => ({
    id:                  d.id,
    userId:              d.user_id,
    startedAt:           d.started_at,
    endedAt:             d.ended_at,
    workDurationMin:     d.work_duration_min,
    breakDurationMin:    d.break_duration_min,
    pauseCount:          d.pause_count,
    pauseCountOver1min:  d.pause_count_over_1min,
    fatigueLevel:        d.fatigue_level,
    status:              d.status,
    effectiveMinutes:    d.effective_minutes,
    wasSuggested:        d.was_suggested,
  }))
}

// ── localStorage fallback para sessions ──────────────────────────────────────
const LS_S = 'eq_study_sessions'
const lsAddSession     = (s)      => { const a = _lsLoad(LS_S, []); a.push(s); _lsSave(LS_S, a); return s }
const lsGetSessions    = (userId) => _lsLoad(LS_S, []).filter(s => !userId || s.userId === userId)
const lsGetAllSessions = ()       => _lsLoad(LS_S, [])
const _lsLoad = (k, d) => { try { return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(d)) } catch { return d } }
const _lsSave = (k, v) => localStorage.setItem(k, JSON.stringify(v))

// ════════════════════════════════════════════════════════════
//  EVENTOS ACADÉMICOS
// ════════════════════════════════════════════════════════════

async function sbGetEvents(userId) {
  const { data, error } = await supabase.from('academic_events')
    .select('id, user_id, name, deadline, priority, notes, is_active, created_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('deadline', { ascending: true })
  if (error) throw error
  return (data ?? []).map(d => ({
    id:        d.id,
    userId:    d.user_id,
    name:      d.name,
    deadline:  d.deadline,
    priority:  d.priority,
    notes:     d.notes,
    isActive:  d.is_active,
    createdAt: d.created_at,
  }))
}

// isNew: id aún no existe en Supabase (fue generado localmente con ev_/s_ prefix)
const isLocalId = (id) => !id || id.startsWith('ev_') || id.startsWith('s_') || id.startsWith('u_')

async function sbSaveEvent(ev) {
  if (isLocalId(ev.id)) {
    // Insertar nuevo — Supabase genera el UUID
    const { data, error } = await supabase.from('academic_events').insert({
      user_id:   ev.userId,
      name:      ev.name,
      deadline:  ev.deadline,
      priority:  ev.priority,
      notes:     ev.notes ?? null,
      is_active: true,
    }).select('id, user_id, name, deadline, priority, notes, is_active, created_at').single()
    if (error) throw error
    return {
      id:        data.id,
      userId:    data.user_id,
      name:      data.name,
      deadline:  data.deadline,
      priority:  data.priority,
      notes:     data.notes,
      isActive:  data.is_active,
      createdAt: data.created_at,
    }
  } else {
    // Actualizar existente
    const { error } = await supabase.from('academic_events').update({
      name:     ev.name,
      deadline: ev.deadline,
      priority: ev.priority,
      notes:    ev.notes ?? null,
    }).eq('id', ev.id)
    if (error) throw error
    return ev
  }
}

async function sbDeleteEvent(id) {
  const { error } = await supabase.from('academic_events')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
}

// ── localStorage fallback para events ────────────────────────────────────────
const LS_E = 'eq_events'
const lsGetEvents   = (userId) => _lsLoad(LS_E, []).filter(e => e.userId === userId && e.isActive !== false)
const lsSaveEvent   = (ev)     => { const a = _lsLoad(LS_E, []); const i = a.findIndex(e => e.id === ev.id); if (i >= 0) a[i] = ev; else a.push(ev); _lsSave(LS_E, a); return ev }
const lsDeleteEvent = (id)     => { const a = _lsLoad(LS_E, []); const i = a.findIndex(e => e.id === id); if (i >= 0) { a[i].isActive = false; _lsSave(LS_E, a) } }

// ════════════════════════════════════════════════════════════
//  METAS SEMANALES
// ════════════════════════════════════════════════════════════

async function sbGetGoal(userId, weekStart) {
  const { data } = await supabase.from('weekly_goals')
    .select('id, user_id, week_start, goal_hours')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()
  if (!data) return null
  return { id: data.id, userId: data.user_id, weekStart: data.week_start, goalHours: parseFloat(data.goal_hours) }
}

async function sbUpsertGoal(goal) {
  const { error } = await supabase.from('weekly_goals').upsert({
    user_id:    goal.userId,
    week_start: goal.weekStart,
    goal_hours: goal.goalHours,
  }, { onConflict: 'user_id,week_start' })
  if (error) throw error
  return goal
}

// ── localStorage fallback para goals ─────────────────────────────────────────
const LS_G = 'eq_goals'
const lsGetGoal    = (userId, weekStart) => _lsLoad(LS_G, []).find(g => g.userId === userId && g.weekStart === weekStart) ?? null
const lsUpsertGoal = (goal)              => { const a = _lsLoad(LS_G, []); const i = a.findIndex(g => g.userId === goal.userId && g.weekStart === goal.weekStart); if (i >= 0) a[i] = goal; else a.push(goal); _lsSave(LS_G, a); return goal }

// ════════════════════════════════════════════════════════════
//  API PÚBLICA
// ════════════════════════════════════════════════════════════

export const storage = {
  // ── Usuarios (Supabase → SQLite fallback) ──────────────────────────────────
  addUser:    (user)       => userOp(sbAddUser,    lsqlAddUser,    user),
  findUser:   (email)      => userOp(sbFindUser,   lsqlFindUser,   email),
  getUsers:   ()           => userOp(sbGetUsers,   lsqlGetUsers),
  updateUser: (id, patch)  => userOp(sbUpdateUser, lsqlUpdateUser, id, patch),

  // ── Sesiones (Supabase → localStorage fallback) ─────────────────────────────
  addSession:    (s)      => cloudOp(() => sbAddSession(s),      () => lsAddSession(s)),
  getSessions:   (userId) => cloudOp(() => sbGetSessions(userId),() => lsGetSessions(userId)),
  getAllSessions: ()       => cloudOp(() => sbGetSessions(null),  lsGetAllSessions),

  // ── Eventos (Supabase → localStorage fallback) ──────────────────────────────
  getEvents:   (userId) => cloudOp(() => sbGetEvents(userId), () => lsGetEvents(userId)),
  saveEvent:   (ev)     => cloudOp(() => sbSaveEvent(ev),     () => lsSaveEvent(ev)),
  deleteEvent: (id)     => cloudOp(() => sbDeleteEvent(id),   () => lsDeleteEvent(id)),

  // ── Metas (Supabase → localStorage fallback) ────────────────────────────────
  getGoal:    (userId, weekStart) => cloudOp(() => sbGetGoal(userId, weekStart), () => lsGetGoal(userId, weekStart)),
  upsertGoal: (goal)              => cloudOp(() => sbUpsertGoal(goal),           () => lsUpsertGoal(goal)),

  // ── Sesión activa — localStorage (solo en este dispositivo) ─────────────────
  getSession:   () => load(K.SESSION, null),
  saveSession:  (u) => save(K.SESSION, u),
  clearSession: () => localStorage.removeItem(K.SESSION),

  // ── Timer — localStorage (estado transitorio, no necesita nube) ──────────────
  getTimer:   () => load(K.TIMER, null),
  saveTimer:  (t) => save(K.TIMER, t),
  clearTimer: () => localStorage.removeItem(K.TIMER),

  // ── Auditoría — localStorage ─────────────────────────────────────────────────
  addAudit: (e) => { const a = load(K.AUDIT, []); a.push({ ...e, id: `a_${Date.now()}`, timestamp: new Date().toISOString() }); save(K.AUDIT, a) },
  getAudit: () => load(K.AUDIT, []),
}

const K = {
  USERS: 'eq_users', SESSION: 'eq_session', SESSIONS: 'eq_study_sessions',
  EVENTS: 'eq_events', GOALS: 'eq_goals', AUDIT: 'eq_audit', TIMER: 'eq_timer',
}
const load = (key, def) => { try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(def)) } catch { return def } }
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val))

export const storage = {
  getUsers: () => load(K.USERS, []),
  saveUsers: (u) => save(K.USERS, u),
  addUser: (user) => { const u = storage.getUsers(); u.push(user); save(K.USERS, u); return user },
  findUser: (email) => storage.getUsers().find(u => u.email === email.toLowerCase().trim()),
  updateUser: (id, patch) => { const u = storage.getUsers(); const i = u.findIndex(x => x.id === id); if (i >= 0) { u[i] = { ...u[i], ...patch }; save(K.USERS, u) } },

  getSession: () => load(K.SESSION, null),
  saveSession: (u) => save(K.SESSION, u),
  clearSession: () => localStorage.removeItem(K.SESSION),

  getSessions: (userId) => load(K.SESSIONS, []).filter(s => !userId || s.userId === userId),
  getAllSessions: () => load(K.SESSIONS, []),
  addSession: (s) => { const arr = load(K.SESSIONS, []); arr.push(s); save(K.SESSIONS, arr); return s },

  getEvents: (userId) => load(K.EVENTS, []).filter(e => e.userId === userId && e.isActive !== false),
  saveEvent: (ev) => { const a = load(K.EVENTS, []); const i = a.findIndex(e => e.id === ev.id); if (i >= 0) a[i] = ev; else a.push(ev); save(K.EVENTS, a); return ev },
  deleteEvent: (id) => { const a = load(K.EVENTS, []); const i = a.findIndex(e => e.id === id); if (i >= 0) { a[i].isActive = false; save(K.EVENTS, a) } },

  getGoal: (userId, weekStart) => load(K.GOALS, []).find(g => g.userId === userId && g.weekStart === weekStart) ?? null,
  upsertGoal: (goal) => { const a = load(K.GOALS, []); const i = a.findIndex(g => g.userId === goal.userId && g.weekStart === goal.weekStart); if (i >= 0) a[i] = goal; else a.push(goal); save(K.GOALS, a); return goal },

  getTimer: () => load(K.TIMER, null),
  saveTimer: (t) => save(K.TIMER, t),
  clearTimer: () => localStorage.removeItem(K.TIMER),

  addAudit: (e) => { const a = load(K.AUDIT, []); a.push({ ...e, id: `a_${Date.now()}`, timestamp: new Date().toISOString() }); save(K.AUDIT, a) },
  getAudit: () => load(K.AUDIT, []),
}

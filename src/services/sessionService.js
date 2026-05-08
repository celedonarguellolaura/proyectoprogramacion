export const getMonday = (date = new Date()) => {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
  d.setHours(0, 0, 0, 0)
  return d.toISOString().split('T')[0]
}

export const getContinuousStudyMinutes = (sessions) => {
  const today = new Date().toDateString()
  const sorted = sessions
    .filter(s => new Date(s.startedAt).toDateString() === today && s.status === 'completada')
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
  if (!sorted.length) return 0
  let total = 0, prevStart = null
  for (const s of sorted) {
    if (!prevStart) { total += s.effectiveMinutes; prevStart = new Date(s.startedAt) }
    else {
      const gapMin = (prevStart - new Date(s.endedAt)) / 60000
      if (gapMin >= 15) break
      total += s.effectiveMinutes
      prevStart = new Date(s.startedAt)
    }
  }
  return total
}

export const getTimeUntilUnblocked = (sessions) => {
  const today = new Date().toDateString()
  const sorted = sessions
    .filter(s => new Date(s.startedAt).toDateString() === today)
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
  if (!sorted.length) return 0
  const lastEnd = new Date(sorted[0].endedAt)
  const unlockAt = new Date(lastEnd.getTime() + 15 * 60000)
  return Math.max(0, unlockAt - new Date())
}

export const getUrgentEvents = (events) => {
  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 3600000)
  return events
    .filter(e => e.priority === 'alta' && new Date(e.deadline) > now && new Date(e.deadline) <= in48h && e.isActive !== false)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
}

export const getSmartSuggestion = (events) => {
  const urgent = getUrgentEvents(events)
  if (urgent.length > 0) {
    const e = urgent[0]
    const h = Math.round((new Date(e.deadline) - new Date()) / 3600000)
    return { workMin: 50, breakMin: 10, reason: `Tienes "${e.name}" en ${h}h` }
  }
  return { workMin: 25, breakMin: 5, reason: null }
}

export const validateBreak = (workMin, breakMin) => {
  const minBreak = Math.max(Math.floor(workMin / 25) * 5, 5)
  return breakMin >= minBreak ? null : `Para ${workMin} min de trabajo el descanso mínimo es ${minBreak} min.`
}

export const evaluateSession = (pauseCountOver1min, workDurationMin) =>
  pauseCountOver1min <= 2
    ? { status: 'completada', effectiveMinutes: workDurationMin }
    : { status: 'incompleta', effectiveMinutes: 0 }

export const buildDailyStats = (sessions, date) => {
  const d = new Date(date).toDateString()
  const ds = sessions.filter(s => new Date(s.startedAt).toDateString() === d)
  const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, completed: 0, incomplete: 0 }))
  ds.forEach(s => {
    const h = new Date(s.startedAt).getHours()
    if (s.status === 'completada') hours[h].completed += s.effectiveMinutes
    else hours[h].incomplete += s.workDurationMin
  })
  return hours
}

export const buildWeeklyStats = (sessions, weekStart) => {
  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  return DAYS.map((day, i) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const ds = sessions.filter(s => new Date(s.startedAt).toDateString() === date.toDateString())
    return {
      day,
      completed: +(ds.filter(s => s.status === 'completada').reduce((a, s) => a + s.effectiveMinutes / 60, 0).toFixed(2)),
      incomplete: +(ds.filter(s => s.status === 'incompleta').reduce((a, s) => a + s.workDurationMin / 60, 0).toFixed(2)),
    }
  })
}

export const buildMonthlyStats = (sessions, year, month) => {
  const days = new Date(year, month, 0).getDate()
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(year, month - 1, i + 1)
    const ds = sessions.filter(s => new Date(s.startedAt).toDateString() === date.toDateString())
    return {
      day: i + 1,
      completed: +(ds.filter(s => s.status === 'completada').reduce((a, s) => a + s.effectiveMinutes / 60, 0).toFixed(2)),
      incomplete: +(ds.filter(s => s.status === 'incompleta').reduce((a, s) => a + s.workDurationMin / 60, 0).toFixed(2)),
    }
  })
}

export const getWeeklyProgress = (sessions, userId, weekStart, goalHours) => {
  const ws = new Date(weekStart)
  const we = new Date(ws); we.setDate(we.getDate() + 7)
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.startedAt)
    return s.userId === userId && d >= ws && d < we && s.status === 'completada'
  })
  const accumulated = +(weekSessions.reduce((a, s) => a + s.effectiveMinutes / 60, 0).toFixed(2))
  const pct = goalHours ? Math.min(Math.round((accumulated / goalHours) * 100), 100) : 0
  return { accumulated, goal: goalHours ?? null, percentage: pct }
}

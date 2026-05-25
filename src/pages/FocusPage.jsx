import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { storage } from '../services/storage'
import { D } from '../styles/theme'
import {
  getContinuousStudyMinutes, getTimeUntilUnblocked,
  getSmartSuggestion, validateBreak, evaluateSession,
} from '../services/sessionService'

const R    = 85
const CIRC = 2 * Math.PI * R

const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
const fmtMin = ms => {
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator(), g = ctx.createGain()
      osc.connect(g); g.connect(ctx.destination)
      osc.frequency.value = 880
      g.gain.setValueAtTime(0.4, ctx.currentTime + i * 0.35)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.35 + 0.3)
      osc.start(ctx.currentTime + i * 0.35); osc.stop(ctx.currentTime + i * 0.35 + 0.3)
    }
  } catch (_) {}
}

const FATIGUE_ICONS  = ['', '😴', '😪', '😐', '😊', '⚡']
const FATIGUE_LABELS = ['', 'Agotado', 'Cansado', 'Regular', 'Bien', 'Excelente']

/* ── shared styles ── */
const card = { background: D.card, border: `1px solid ${D.border}`, borderRadius: 16, padding: '28px' }
const btn  = (bg, col) => ({
  padding: '12px 20px', borderRadius: 10, border: 'none',
  background: bg, color: col, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', fontSize: 14,
  transition: 'opacity .15s',
})
const btnGhost = {
  padding: '12px 20px', borderRadius: 10, border: `1.5px solid ${D.border2}`,
  background: 'transparent', color: D.t2, fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer', fontSize: 14,
}

export default function FocusPage({ user, onNavigate }) {
  const [screen, setScreen]               = useState('loading')
  const [suggestion, setSuggestion]       = useState({ workMin: 25, breakMin: 5, reason: null })
  const [workMin, setWorkMin]             = useState(25)
  const [breakMin, setBreakMin]           = useState(5)
  const [manualWorkMin, setManualWorkMin] = useState(25)
  const [manualBreakMin, setManualBreakMin] = useState(5)
  const [manualErr, setManualErr]         = useState('')
  const [phase, setPhase]                 = useState('work')
  const [wasSuggested, setWasSuggested]   = useState(false)
  const [timeLeft, setTimeLeft]           = useState(0)
  const [totalMs, setTotalMs]             = useState(0)
  const [isPaused, setIsPaused]           = useState(false)
  const [pauseNewMin, setPauseNewMin]     = useState('')
  const [pauseCountOver1min, setPauseCountOver1min] = useState(0)
  const [sessionStart, setSessionStart]   = useState(null)
  const [fatigueLevel, setFatigueLevel]   = useState(null)
  const [lastSession, setLastSession]     = useState(null)
  const [blockCountdown, setBlockCountdown] = useState(0)

  const intervalRef   = useRef(null)
  const startTimeRef  = useRef(null)
  const pauseStartRef = useRef(null)
  const pauseCountRef = useRef(0)
  const timeLeftRef   = useRef(0)
  const totalMsRef    = useRef(0)
  const phaseRef      = useRef('work')

  const stopTimer = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  /* ---------- init ---------- */
  useEffect(() => {
    const sessions = storage.getSessions(user.id)
    const cm = getContinuousStudyMinutes(sessions)
    if (cm >= 120) { setBlockCountdown(getTimeUntilUnblocked(sessions)); setScreen('blocked'); return }
    const saved = storage.getTimer()
    if (saved?.sessionStart) {
      setWorkMin(saved.workMin); setBreakMin(saved.breakMin)
      setWasSuggested(saved.wasSuggested); setSessionStart(saved.sessionStart)
      setPauseCountOver1min(saved.pauseCountOver1min); pauseCountRef.current = saved.pauseCountOver1min
      phaseRef.current = saved.phase; setPhase(saved.phase)
      const remaining = saved.totalMs - (Date.now() - saved.startTime)
      if (remaining > 0) {
        startTimeRef.current = saved.startTime; totalMsRef.current = saved.totalMs
        setTotalMs(saved.totalMs); setScreen('running')
      } else { storage.clearTimer(); setScreen('suggestion') }
    } else {
      const events = storage.getEvents(user.id)
      setSuggestion(getSmartSuggestion(events)); setScreen('suggestion')
    }
  }, [user.id])

  /* ---------- running interval ---------- */
  useEffect(() => {
    if (screen !== 'running' || intervalRef.current) return
    if (!startTimeRef.current) return
    const tick = () => {
      const elapsed    = Date.now() - startTimeRef.current
      const remaining  = totalMsRef.current - elapsed
      if (remaining <= 0) {
        clearInterval(intervalRef.current); intervalRef.current = null
        setTimeLeft(0); storage.clearTimer(); playBeep()
        phaseRef.current === 'work' ? setScreen('fatigue') : setScreen('summary')
      } else {
        setTimeLeft(remaining); timeLeftRef.current = remaining
        storage.saveTimer({
          startTime: startTimeRef.current, totalMs: totalMsRef.current,
          phase: phaseRef.current, pauseCountOver1min: pauseCountRef.current,
          workMin, breakMin, wasSuggested, sessionStart,
        })
      }
    }
    intervalRef.current = setInterval(tick, 250)
    return () => stopTimer()
  }, [screen, stopTimer, workMin, breakMin, wasSuggested, sessionStart])

  /* ---------- block countdown ---------- */
  useEffect(() => {
    if (screen !== 'blocked' || blockCountdown <= 0) return
    const id = setInterval(() => setBlockCountdown(p => {
      if (p <= 1000) {
        clearInterval(id)
        const events = storage.getEvents(user.id)
        setSuggestion(getSmartSuggestion(events)); setScreen('suggestion')
        return 0
      }
      return p - 1000
    }), 1000)
    return () => clearInterval(id)
  }, [screen, blockCountdown, user.id])

  /* ---------- actions ---------- */
  const beginSession = (wMin, bMin, suggested) => {
    setWorkMin(wMin); setBreakMin(bMin); setWasSuggested(suggested)
    const now = new Date().toISOString(); setSessionStart(now)
    phaseRef.current = 'work'; setPhase('work')
    pauseCountRef.current = 0; setPauseCountOver1min(0)
    startTimeRef.current = Date.now(); totalMsRef.current = wMin * 60000
    setTotalMs(wMin * 60000); setScreen('running')
  }

  const acceptSuggestion = () => beginSession(suggestion.workMin, suggestion.breakMin, true)

  const startManual = () => {
    const err = validateBreak(manualWorkMin, manualBreakMin)
    if (err) { setManualErr(err); return }
    setManualErr(''); beginSession(manualWorkMin, manualBreakMin, false)
  }

  const handlePause = () => {
    stopTimer(); pauseStartRef.current = Date.now(); setIsPaused(true); setPauseNewMin('')
  }
  const handleResume = () => {
    const dur = Date.now() - pauseStartRef.current
    if (dur > 60000) { pauseCountRef.current += 1; setPauseCountOver1min(pauseCountRef.current) }

    // Si el usuario escribió una nueva duración, reiniciar desde ese valor
    const parsed = parseFloat(pauseNewMin)
    if (!isNaN(parsed) && parsed > 0) {
      const newMs = Math.round(parsed * 60000)
      totalMsRef.current  = newMs
      timeLeftRef.current = newMs
      setTotalMs(newMs)
      setTimeLeft(newMs)
      startTimeRef.current = Date.now()
    } else {
      // Sin cambio: continuar desde donde se pausó
      startTimeRef.current = Date.now() - (totalMsRef.current - timeLeftRef.current)
    }

    setPauseNewMin('')
    setIsPaused(false)
    intervalRef.current = setInterval(() => {
      const remaining = totalMsRef.current - (Date.now() - startTimeRef.current)
      if (remaining <= 0) {
        clearInterval(intervalRef.current); intervalRef.current = null
        setTimeLeft(0); storage.clearTimer(); playBeep()
        phaseRef.current === 'work' ? setScreen('fatigue') : setScreen('summary')
      } else { setTimeLeft(remaining); timeLeftRef.current = remaining }
    }, 250)
  }

  const handleSaveSession = () => {
    const actualWorkedMin = (totalMsRef.current - timeLeftRef.current) / 60000
    const ev = evaluateSession(pauseCountRef.current, actualWorkedMin)
    const session = {
      id: `s_${Date.now()}`, userId: user.id,
      startedAt: sessionStart, endedAt: new Date().toISOString(),
      workDurationMin: workMin, breakDurationMin: breakMin,
      pauseCountOver1min: pauseCountRef.current,
      effectiveMinutes: ev.effectiveMinutes, status: ev.status,
      fatigueLevel, wasSuggested,
    }
    storage.addSession(session); storage.clearTimer()
    storage.addAudit({
      userId: user.id, userEmail: user.email, userRole: user.role,
      action: ev.status === 'completada' ? 'complete_session' : 'incomplete_session',
      entity: 'session', entityId: session.id,
      summary: `Sesión ${workMin}min ${ev.status}. Fatiga: ${fatigueLevel ?? '-'}. Pausas: ${pauseCountRef.current}`,
    })
    setLastSession({ ...session }); setScreen('summary')
  }

  const startBreak = () => {
    phaseRef.current = 'break'; setPhase('break')
    startTimeRef.current = Date.now(); totalMsRef.current = breakMin * 60000
    setTotalMs(breakMin * 60000); setScreen('running')
  }

  const restart = () => {
    stopTimer(); storage.clearTimer()
    pauseCountRef.current = 0; setPauseCountOver1min(0)
    setFatigueLevel(null); setLastSession(null); setIsPaused(false)
    const sessions = storage.getSessions(user.id)
    const cm = getContinuousStudyMinutes(sessions)
    if (cm >= 120) { setBlockCountdown(getTimeUntilUnblocked(sessions)); setScreen('blocked') }
    else { setSuggestion(getSmartSuggestion(storage.getEvents(user.id))); setScreen('suggestion') }
  }

  /* ---------- timer visuals ---------- */
  const progress     = totalMs > 0 ? timeLeft / totalMs : 1
  const strokeOffset = CIRC * (1 - progress)
  const phaseColor   = phase === 'work' ? D.cian : D.verde

  return (
    <div style={{ padding: '32px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 22 }}>⏱️</span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: D.t0, margin: 0 }}>Zona de Enfoque</h1>
      </div>

      <AnimatePresence mode="wait">

        {/* ── BLOCKED ── */}
        {screen === 'blocked' && (
          <motion.div key="blocked" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ ...card, background: D.verdeBg, border: `2px solid ${D.verde}`, textAlign: 'center', padding: '40px 28px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🌿</div>
            <h2 style={{ color: D.verde, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Descanso obligatorio</h2>
            <p style={{ color: D.t1, fontSize: 15, marginBottom: 20 }}>
              Acumulaste 120 min de estudio continuo. Descansa al menos 15 min antes de continuar.
            </p>
            {blockCountdown > 0 && (
              <div style={{ fontSize: 48, fontWeight: 800, color: D.verde, fontVariantNumeric: 'tabular-nums' }}>
                {fmtMin(blockCountdown)}
              </div>
            )}
            {blockCountdown === 0 && (
              <button onClick={restart} style={{ ...btn(D.verde, '#074D22'), marginTop: 12, padding: '13px 32px', fontSize: 15 }}>
                ¡Listo para continuar! →
              </button>
            )}
          </motion.div>
        )}

        {/* ── SUGGESTION ── */}
        {screen === 'suggestion' && (
          <motion.div key="suggestion" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={card}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, marginBottom: 18,
                background: suggestion.reason ? D.naranjaBg : D.cianBg,
                border: `1px solid ${suggestion.reason ? D.naranja : D.cian}50`,
              }}>
                <span style={{ fontSize: 13, color: suggestion.reason ? D.naranja : D.cian, fontWeight: 600 }}>
                  {suggestion.reason ? '🔥 Sesión urgente sugerida' : '💡 Sesión estándar Pomodoro'}
                </span>
              </div>

              {suggestion.reason && (
                <div style={{ background: D.naranjaBg, border: `1px solid ${D.naranja}50`, borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 14, color: D.naranja }}>
                  ⚡ {suggestion.reason}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                {[
                  { label: 'Trabajo',  value: suggestion.workMin,  color: D.cian,  bg: D.cianBg  },
                  { label: 'Descanso', value: suggestion.breakMin, color: D.verde, bg: D.verdeBg },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg, border: `1.5px solid ${s.color}50`,
                    borderRadius: 12, padding: '18px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>
                      {s.value}<span style={{ fontSize: 14, fontWeight: 500, color: D.t2 }}> min</span>
                    </div>
                    <div style={{ fontSize: 12, color: D.t2, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <button onClick={acceptSuggestion} style={{ ...btn(D.cian, '#003D4D'), width: '100%', padding: '14px', fontSize: 15, marginBottom: 10 }}>
                ✓ Aceptar sugerencia e iniciar
              </button>
              <button onClick={() => setScreen('manual')} style={{ ...btnGhost, width: '100%', padding: '12px', fontSize: 14 }}>
                Configurar manualmente
              </button>
            </div>
          </motion.div>
        )}

        {/* ── MANUAL CONFIG ── */}
        {screen === 'manual' && (
          <motion.div key="manual" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={card}>
              <h3 style={{ color: D.t0, fontWeight: 600, marginBottom: 22, fontSize: 17 }}>Configuración manual</h3>
              {[
                { label: 'Duración trabajo (min)', value: manualWorkMin, min: 25, max: 120, onChange: v => setManualWorkMin(+v), color: D.cian },
                { label: 'Duración descanso (min)', value: manualBreakMin, min: 5, max: 30, onChange: v => setManualBreakMin(+v), color: D.verde },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, color: D.t2, fontWeight: 500 }}>{f.label}</label>
                    <span style={{ fontSize: 20, fontWeight: 800, color: f.color }}>{f.value}<span style={{ fontSize: 12, color: D.t3 }}> min</span></span>
                  </div>
                  <input type="range" min={f.min} max={f.max} value={f.value} onChange={e => f.onChange(e.target.value)}
                    style={{ width: '100%', accentColor: f.color, cursor: 'pointer' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: D.t3, marginTop: 3 }}>
                    <span>{f.min}</span><span>{f.max}</span>
                  </div>
                </div>
              ))}
              {manualErr && (
                <div style={{ background: D.naranjaBg, border: `1px solid ${D.naranja}50`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: D.naranja, marginBottom: 16 }}>
                  ⚠️ {manualErr}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setScreen('suggestion')} style={{ ...btnGhost, flex: 1, padding: '12px' }}>← Volver</button>
                <button onClick={startManual} style={{ ...btn(D.cian, '#003D4D'), flex: 2, padding: '12px' }}>Iniciar sesión →</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RUNNING ── */}
        {screen === 'running' && (
          <motion.div key="running" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              {/* Phase badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px',
                borderRadius: 99, marginBottom: 24,
                background: `${phaseColor}18`, border: `1px solid ${phaseColor}50`,
              }}>
                <motion.div
                  animate={{ opacity: isPaused ? 0.4 : [1, 0.3, 1] }}
                  transition={{ repeat: isPaused ? 0 : Infinity, duration: 1.5 }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: phaseColor }}
                />
                <span style={{ fontSize: 13, color: phaseColor, fontWeight: 600 }}>
                  {isPaused ? 'Pausado' : phase === 'work' ? 'Sesión de trabajo' : 'Tiempo de descanso'}
                </span>
              </div>

              {/* Circular timer */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                <svg width={220} height={220} viewBox="0 0 220 220">
                  {/* Track */}
                  <circle cx={110} cy={110} r={R} fill="none" stroke={D.border} strokeWidth={12} />
                  {/* Progress arc */}
                  <circle
                    cx={110} cy={110} r={R} fill="none"
                    stroke={isPaused ? D.border2 : phaseColor}
                    strokeWidth={12} strokeLinecap="round"
                    strokeDasharray={CIRC}
                    strokeDashoffset={strokeOffset}
                    transform="rotate(-90 110 110)"
                    style={{ transition: 'stroke-dashoffset 0.25s linear' }}
                  />
                  {/* Time */}
                  <text x={110} y={106} textAnchor="middle" fontSize={40} fontWeight={800} fill={D.t0} fontFamily="Inter">
                    {fmt(timeLeft)}
                  </text>
                  <text x={110} y={128} textAnchor="middle" fontSize={13} fill={D.t2} fontFamily="Inter">
                    {isPaused ? 'pausado' : phase === 'work' ? 'trabajando' : 'descansando'}
                  </text>
                  {pauseCountOver1min > 0 && (
                    <text x={110} y={150} textAnchor="middle" fontSize={11} fill={D.naranja} fontFamily="Inter">
                      {pauseCountOver1min}/2 pausas largas
                    </text>
                  )}
                </svg>
              </div>

              {/* Input nueva duración al pausar */}
              {isPaused && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 16, padding: '14px 16px', background: D.card2, borderRadius: 12, border: `1px solid ${D.border2}` }}
                >
                  <div style={{ fontSize: 12, color: D.t2, marginBottom: 8, fontWeight: 500 }}>
                    ¿Cambiar duración al reanudar? (dejar vacío para continuar)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number" min={1} max={120}
                      placeholder={`${Math.round(timeLeft / 60000) || 1}`}
                      value={pauseNewMin}
                      onChange={e => setPauseNewMin(e.target.value)}
                      style={{
                        flex: 1, padding: '9px 12px', borderRadius: 8,
                        border: `1.5px solid ${pauseNewMin ? phaseColor : D.border2}`,
                        background: 'transparent', color: D.t0,
                        fontFamily: 'Inter', fontSize: 15, fontWeight: 600, outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 13, color: D.t3 }}>min</span>
                  </div>
                  {pauseNewMin && (
                    <div style={{ fontSize: 11, color: phaseColor, marginTop: 6 }}>
                      Al reanudar empezará un nuevo conteo de {pauseNewMin} min
                    </div>
                  )}
                </motion.div>
              )}

              {/* Controls */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {!isPaused ? (
                  <button onClick={handlePause} style={{
                    padding: '12px 28px', borderRadius: 10, fontFamily: 'Inter', fontWeight: 600,
                    cursor: 'pointer', fontSize: 15,
                    border: `1.5px solid ${phaseColor}60`, background: `${phaseColor}15`, color: phaseColor,
                  }}>
                    ⏸ Pausar
                  </button>
                ) : (
                  <button onClick={handleResume} style={{ ...btn(phaseColor, phase === 'work' ? '#003D4D' : '#074D22'), padding: '12px 28px', fontSize: 15 }}>
                    ▶ Reanudar
                  </button>
                )}
                <button onClick={() => { stopTimer(); storage.clearTimer(); setScreen(phase === 'work' ? 'fatigue' : 'summary') }}
                  style={{ ...btnGhost, padding: '12px 22px' }}>
                  Finalizar
                </button>
              </div>

              <div style={{ marginTop: 20, padding: '10px 14px', background: D.card2, borderRadius: 10, fontSize: 12, color: D.t3 }}>
                {workMin} min trabajo · {breakMin} min descanso · RN-04: máx. 2 pausas &gt;1 min
              </div>
            </div>
          </motion.div>
        )}

        {/* ── FATIGUE ── */}
        {screen === 'fatigue' && (
          <motion.div key="fatigue" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <h2 style={{ color: D.t0, fontWeight: 700, marginBottom: 6, fontSize: 20 }}>¡Sesión terminada!</h2>
              <p style={{ color: D.t2, fontSize: 14, marginBottom: 24 }}>¿Cómo te sientes después de esta sesión?</p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setFatigueLevel(n)} style={{
                    width: 58, height: 62, borderRadius: 14, cursor: 'pointer',
                    border: `2px solid ${fatigueLevel === n ? D.rosa : D.border2}`,
                    background: fatigueLevel === n ? D.rosaBg : D.card2,
                    fontSize: 26, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 3, transition: 'all .15s',
                  }}>
                    <span>{FATIGUE_ICONS[n]}</span>
                    <span style={{ fontSize: 9, color: fatigueLevel === n ? D.rosa : D.t3, fontFamily: 'Inter' }}>{n}</span>
                  </button>
                ))}
              </div>
              {fatigueLevel && (
                <div style={{ color: D.rosa, fontSize: 14, marginBottom: 20, fontWeight: 600 }}>
                  {FATIGUE_ICONS[fatigueLevel]} {FATIGUE_LABELS[fatigueLevel]}
                </div>
              )}
              {!fatigueLevel && <div style={{ height: 34 }} />}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setFatigueLevel(null); handleSaveSession() }}
                  style={{ ...btnGhost, flex: 1, padding: '12px', fontSize: 13 }}>
                  Omitir y guardar
                </button>
                <button onClick={handleSaveSession} disabled={!fatigueLevel}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                    background: fatigueLevel ? D.rosa : D.card2,
                    color: fatigueLevel ? '#7A003D' : D.t3,
                    fontFamily: 'Inter', fontWeight: 600, cursor: fatigueLevel ? 'pointer' : 'not-allowed', fontSize: 15,
                  }}>
                  Guardar sesión →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SUMMARY ── */}
        {screen === 'summary' && (
          <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              {lastSession?.status === 'completada' ? (
                <>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                  <h2 style={{ color: D.verde, fontWeight: 700, fontSize: 22, marginBottom: 10 }}>¡Sesión completada!</h2>
                  <div style={{ background: D.verdeBg, border: `1px solid ${D.verde}50`, borderRadius: 12, padding: '16px', marginBottom: 14 }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: D.verde }}>+{lastSession.effectiveMinutes} min</div>
                    <div style={{ fontSize: 13, color: D.t2, marginTop: 4 }}>minutos efectivos registrados</div>
                  </div>
                  {lastSession.fatigueLevel && (
                    <div style={{ fontSize: 14, color: D.rosa, marginBottom: 10, fontWeight: 500 }}>
                      Fatiga: {FATIGUE_ICONS[lastSession.fatigueLevel]} {FATIGUE_LABELS[lastSession.fatigueLevel]}
                    </div>
                  )}
                  {lastSession.pauseCountOver1min > 0 && (
                    <div style={{ fontSize: 12, color: D.t3, marginBottom: 10 }}>
                      Pausas largas: {lastSession.pauseCountOver1min}/2 ✓
                    </div>
                  )}
                </>
              ) : lastSession?.status === 'incompleta' ? (
                <>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>⚠️</div>
                  <h2 style={{ color: D.naranja, fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Sesión incompleta</h2>
                  <div style={{ background: D.naranjaBg, border: `1px solid ${D.naranja}50`, borderRadius: 12, padding: '14px', marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: D.t1 }}>
                      {lastSession.pauseCountOver1min} pausas largas detectadas (máx. 2 por RN-04).<br />Esta sesión no suma al progreso.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>😌</div>
                  <h2 style={{ color: D.verde, fontWeight: 700, fontSize: 20, marginBottom: 10 }}>¡Descanso terminado!</h2>
                </>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                <button onClick={() => onNavigate('dashboard')} style={{ ...btnGhost, flex: 1, padding: '11px', minWidth: 120 }}>Ver dashboard</button>
                {lastSession?.status === 'completada' && (
                  <button onClick={startBreak} style={{ ...btn(D.verde, '#074D22'), flex: 1, padding: '11px', minWidth: 120 }}>🌿 Descanso</button>
                )}
                <button onClick={restart} style={{ ...btn(D.cian, '#003D4D'), flex: 1, padding: '11px', minWidth: 120 }}>Nueva sesión →</button>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'loading' && (
          <motion.div key="load" style={{ textAlign: 'center', padding: 60, color: D.t3 }}>Cargando...</motion.div>
        )}
      </AnimatePresence>

      {/* Rules info */}
      {screen !== 'running' && (
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 10 }}>
          {[
            { rule: 'RN-01', desc: 'Descanso tras 120 min continuos',     color: D.verde,   bg: D.verdeBg   },
            { rule: 'RN-02', desc: 'Descanso mín. 5 min / 25 min',        color: D.azul,    bg: D.azulBg    },
            { rule: 'RN-04', desc: 'Máx. 2 pausas >1 min por sesión',      color: D.lavanda, bg: D.lavandaBg },
            { rule: 'RN-05', desc: '50/10 si examen urgente <48h',         color: D.naranja, bg: D.naranjaBg },
          ].map(r => (
            <div key={r.rule} style={{ background: r.bg, border: `1px solid ${r.color}40`, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: r.color, marginBottom: 3 }}>{r.rule}</div>
              <div style={{ fontSize: 11, color: D.t2 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

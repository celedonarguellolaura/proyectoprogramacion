import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TOTAL = 50 * 60
const R = 68
const CIRC = 2 * Math.PI * R  // ≈ 427

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const floats = [
  { x: -140, y: -30,  delay: 0,    color: 'var(--rose)',    dot: '#FB7185', title: 'Examen Cálculo', sub: 'Alta · en 18h', icon: '🔴' },
  { x: 140,  y: 20,   delay: 1.2,  color: 'var(--emerald)', dot: '#34D399', title: '3h 20min hoy',   sub: 'Meta: 10h · 33%', icon: '📊' },
  { x: -80,  y: 160,  delay: 0.6,  color: 'var(--violet)',  dot: '#A78BFA', title: 'Fatiga: Bien 🙂',  sub: 'Última sesión', icon: '💜' },
]

export default function PomodoroWidget() {
  const [time, setTime] = useState(TOTAL)
  const [running, setRunning] = useState(true)
  const [phase, setPhase] = useState('focus')
  const ref = useRef(null)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) { setRunning(false); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const progress = 1 - time / TOTAL
  const dashOffset = CIRC * (1 - progress)

  const isFocus = phase === 'focus'
  const ringColor = isFocus ? 'var(--indigo)' : 'var(--emerald)'
  const glowColor = isFocus ? 'rgba(99,102,241,0.5)' : 'rgba(52,211,153,0.4)'

  return (
    <div style={{ position: 'relative', width: 300, height: 360 }} ref={ref}>
      {/* Floating cards */}
      {floats.map((f, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: 0.8 + i * 0.15, duration: 0.4 },
            scale:   { delay: 0.8 + i * 0.15, duration: 0.4 },
            y: { delay: f.delay, duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: `translate(calc(-50% + ${f.x}px), calc(-50% + ${f.y}px))`,
            background: '#fff',
            border: `1px solid ${f.dot}44`,
            borderLeft: `3px solid ${f.dot}`,
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: f.dot, boxShadow: `0 0 6px ${f.dot}`,
            }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t0)' }}>{f.title}</div>
              <div style={{ fontSize: 11, color: 'var(--t2)' }}>{f.sub}</div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 280,
          background: '#fff',
          border: '1px solid var(--border2)',
          borderRadius: 24,
          padding: '28px 24px',
          boxShadow: `0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px var(--border), 0 0 32px ${glowColor}`,
          zIndex: 5,
        }}
      >
        {/* Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
        }}>
          <span style={{
            fontSize: 12, fontWeight: 500, color: isFocus ? 'var(--azul)' : 'var(--verde)',
            background: isFocus ? 'rgba(0,200,245,0.1)' : 'rgba(51,209,122,0.1)',
            border: `1px solid ${isFocus ? 'rgba(0,200,245,0.3)' : 'rgba(51,209,122,0.3)'}`,
            borderRadius: 6, padding: '3px 10px',
          }}>
            {isFocus ? '⚡ Zona de Enfoque' : '☕ Descanso'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>50 min · RN-05</span>
        </div>

        {/* Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 20 }}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Track */}
            <circle cx="80" cy="80" r={R} fill="none"
              stroke="rgba(0,0,0,0.07)" strokeWidth="10"/>
            {/* Fill */}
            <motion.circle cx="80" cy="80" r={R} fill="none"
              stroke={ringColor} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 80 80)"
              style={{ filter: `drop-shadow(0 0 8px ${ringColor})`, transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s' }}
            />
            {/* Glow dot at tip */}
            <motion.circle
              cx={80 + R * Math.cos(-Math.PI/2 + 2*Math.PI*progress)}
              cy={80 + R * Math.sin(-Math.PI/2 + 2*Math.PI*progress)}
              r="5" fill={ringColor}
              style={{ filter: `drop-shadow(0 0 6px ${ringColor})` }}
            />
          </svg>
          {/* Time */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 34, fontWeight: 600, color: 'var(--t0)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
              {fmt(time)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
              {Math.round(progress * 100)}% completado
            </div>
          </div>
        </div>

        {/* Task */}
        <div style={{
          background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 16, fontSize: 12,
          color: 'rgba(251,113,133,0.9)',
        }}>
          🔴 Examen de Cálculo en 18h — sesión extendida sugerida
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            onClick={() => setRunning(r => !r)}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1, padding: '10px', border: '1px solid var(--border2)',
              borderRadius: 10, background: 'var(--surface)', color: 'var(--t1)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
            }}
          >
            {running ? '⏸ Pausa' : '▶ Reanudar'}
          </motion.button>
          <motion.button
            onClick={() => { setTime(TOTAL); setRunning(true) }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1, padding: '10px',
              background: 'var(--cian)',
              border: 'none', borderRadius: 10,
              color: '#003D4D', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              fontFamily: 'Inter',
              boxShadow: '0 0 16px rgba(0,200,245,0.35)',
            }}
          >
            ✓ Finalizar
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

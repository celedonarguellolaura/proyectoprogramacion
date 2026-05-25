import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const TOTAL = 50 * 60
const R     = 64
const CIRC  = 2 * Math.PI * R

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const stats = [
  { dot: '#FB7185', label: 'Examen Cálculo', value: 'en 18h' },
  { dot: '#34D399', label: 'Estudio hoy',    value: '3h 20m'  },
  { dot: '#A78BFA', label: 'Fatiga',         value: 'Bien 🙂'  },
]

export default function PomodoroWidget() {
  const [time, setTime]       = useState(TOTAL)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setTime(t => { if (t <= 1) { setRunning(false); return 0 } return t - 1 })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const progress   = 1 - time / TOTAL
  const dashOffset = CIRC * (1 - progress)
  const dotX       = 80 + R * Math.cos(-Math.PI / 2 + 2 * Math.PI * progress)
  const dotY       = 80 + R * Math.sin(-Math.PI / 2 + 2 * Math.PI * progress)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.92 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: 300,
        background: 'linear-gradient(160deg, #0f0f23 0%, #1a1030 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 28,
        padding: '26px 24px 22px',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.55), 0 0 60px rgba(99,102,241,0.18)',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow bg */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <span style={{
          fontSize: 12, fontWeight: 600, color: '#818CF8',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 8, padding: '4px 11px', letterSpacing: '0.02em',
        }}>
          ⚡ Zona de Enfoque
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
          50 min · RN-05
        </span>
      </div>

      {/* Ring timer */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 20 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Track */}
          <circle cx="80" cy="80" r={R} fill="none"
            stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
          {/* Fill */}
          <circle cx="80" cy="80" r={R} fill="none"
            stroke="#6366F1" strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
            style={{ filter: 'drop-shadow(0 0 10px #6366F1)', transition: 'stroke-dashoffset 0.9s linear' }}
          />
          {/* Tip dot */}
          <circle cx={dotX} cy={dotY} r="5.5" fill="#818CF8"
            style={{ filter: 'drop-shadow(0 0 8px #818CF8)' }} />
        </svg>

        {/* Time overlay */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center',
        }}>
          <div style={{
            fontSize: 36, fontWeight: 700, color: '#fff',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-1.5px', lineHeight: 1,
          }}>
            {fmt(time)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 5 }}>
            {Math.round(progress * 100)}% completado
          </div>
        </div>
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${s.dot}30`,
              borderLeft: `2.5px solid ${s.dot}`,
              borderRadius: 8, padding: '6px 10px', flex: '1 1 0', minWidth: 80,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.38)', lineHeight: 1.2 }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Alert */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)',
        borderRadius: 10, padding: '9px 12px', marginBottom: 16,
      }}>
        <span style={{ fontSize: 10 }}>🔴</span>
        <span style={{ fontSize: 12, color: 'rgba(251,113,133,0.9)', lineHeight: 1.4 }}>
          Examen de Cálculo en 18h — sesión extendida sugerida
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          onClick={() => setRunning(r => !r)}
          whileTap={{ scale: 0.95 }}
          style={{
            flex: 1, padding: '11px 8px',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 11, color: 'rgba(255,255,255,0.75)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter',
          }}
        >
          {running ? '⏸ Pausar' : '▶ Reanudar'}
        </motion.button>
        <motion.button
          onClick={() => { setTime(TOTAL); setRunning(true) }}
          whileTap={{ scale: 0.95 }}
          style={{
            flex: 1.3, padding: '11px 8px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            border: 'none', borderRadius: 11,
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}
        >
          ✓ Finalizar
        </motion.button>
      </div>
    </motion.div>
  )
}

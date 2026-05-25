import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const TOTAL = 50 * 60
const R     = 64
const CIRC  = 2 * Math.PI * R

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// Colores del tema del proyecto
const C = {
  cian:    '#00C8F5',
  cianBg:  'rgba(0,200,245,0.10)',
  verde:   '#33D17A',
  verdeBg: 'rgba(51,209,122,0.10)',
  naranja: '#FF8040',
  naranjaBg: 'rgba(255,128,64,0.10)',
  lavanda: '#9B59F5',
  lavandaBg: 'rgba(155,89,245,0.10)',
  t0: '#1A1A2E',
  t1: 'rgba(26,26,46,0.82)',
  t2: 'rgba(26,26,46,0.55)',
  t3: 'rgba(26,26,46,0.35)',
  border:  'rgba(0,0,0,0.08)',
  border2: 'rgba(0,0,0,0.14)',
}

const stats = [
  { color: C.naranja, bg: C.naranjaBg, label: 'Examen Cálculo', value: 'en 18h'  },
  { color: C.verde,   bg: C.verdeBg,   label: 'Estudio hoy',    value: '3h 20m'  },
  { color: C.lavanda, bg: C.lavandaBg, label: 'Fatiga',         value: 'Bien 🙂' },
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
        background: '#fff',
        border: `1px solid ${C.border2}`,
        borderRadius: 28,
        padding: '26px 24px 22px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04), 0 0 50px rgba(0,200,245,0.08)',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow cian sutil en esquina superior */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,200,245,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{
          fontSize: 12, fontWeight: 600, color: C.cian,
          background: C.cianBg, border: `1px solid ${C.cian}40`,
          borderRadius: 8, padding: '4px 11px', letterSpacing: '0.02em',
        }}>
          ⚡ Zona de Enfoque
        </span>
        <span style={{ fontSize: 11, color: C.t3, fontWeight: 500 }}>
          50 min · RN-05
        </span>
      </div>

      {/* Ring timer */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 18 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Track */}
          <circle cx="80" cy="80" r={R} fill="none"
            stroke="rgba(0,0,0,0.07)" strokeWidth="11" />
          {/* Fill */}
          <circle cx="80" cy="80" r={R} fill="none"
            stroke={C.cian} strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 80 80)"
            style={{ filter: `drop-shadow(0 0 8px ${C.cian}99)`, transition: 'stroke-dashoffset 0.9s linear' }}
          />
          {/* Tip dot */}
          <circle cx={dotX} cy={dotY} r="5.5" fill={C.cian}
            style={{ filter: `drop-shadow(0 0 6px ${C.cian})` }} />
        </svg>

        {/* Time overlay */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center',
        }}>
          <div style={{
            fontSize: 36, fontWeight: 700, color: C.t0,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-1.5px', lineHeight: 1,
          }}>
            {fmt(time)}
          </div>
          <div style={{ fontSize: 11, color: C.t3, marginTop: 5 }}>
            {Math.round(progress * 100)}% completado
          </div>
        </div>
      </div>

      {/* Stat chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            style={{
              background: s.bg,
              border: `1px solid ${s.color}30`,
              borderLeft: `2.5px solid ${s.color}`,
              borderRadius: 8, padding: '6px 10px', flex: '1 1 0', minWidth: 76,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 9.5, color: C.t2, lineHeight: 1.3, marginTop: 1 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Alert */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: C.naranjaBg, border: `1px solid ${C.naranja}35`,
        borderRadius: 10, padding: '9px 12px', marginBottom: 16,
      }}>
        <span style={{ fontSize: 10, flexShrink: 0 }}>🔴</span>
        <span style={{ fontSize: 12, color: C.naranja, lineHeight: 1.4, fontWeight: 500 }}>
          Examen de Cálculo en 18h — sesión extendida sugerida
        </span>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          onClick={() => setRunning(r => !r)}
          whileTap={{ scale: 0.95 }}
          style={{
<<<<<<< HEAD
            flex: 1, padding: '11px 8px',
            background: 'transparent', border: `1.5px solid ${C.border2}`,
            borderRadius: 11, color: C.t1,
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
            background: C.cian,
            border: 'none', borderRadius: 11,
            color: '#003D4D', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter',
            boxShadow: `0 4px 20px ${C.cian}55`,
          }}
        >
          ✓ Finalizar
        </motion.button>
      </div>
    </motion.div>
=======
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
>>>>>>> 66dff1b720499475d68b843dfeb615b0e430e995
  )
}

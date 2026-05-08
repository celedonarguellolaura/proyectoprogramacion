import { motion } from 'framer-motion'
import PomodoroWidget from './PomodoroWidget'

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const stats = [
  { n: '5',      label: 'Reglas de negocio', color: 'var(--indigo-l)' },
  { n: 'RN-05', label: 'Sugerencia inteligente', color: 'var(--cyan)' },
  { n: 'PDF',   label: 'Reporte mensual', color: 'var(--emerald)' },
]

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: '80px 0 60px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        top: -150, right: -100, animation: 'orbDrift 10s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
        bottom: -80, left: -60, animation: 'orbDrift2 13s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
        top: '45%', left: '38%', animation: 'orbDrift 16s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Uni banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          position: 'absolute', top: 72, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
        }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 99, padding: '6px 16px', fontSize: 12, color: 'var(--indigo-l)',
          fontWeight: 500,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--indigo)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
          Exclusivo para <strong style={{ color: 'var(--t0)' }}>@usa.edu.co</strong>
          &nbsp;· Universidad Sergio Arboleda
        </div>
      </motion.div>

      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 60, flexWrap: 'wrap',
      }}>
        {/* Left */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          style={{ flex: 1, minWidth: 300, maxWidth: 560 }}
        >
          <motion.div variants={item}>
            <span className="badge" style={{ marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
              Plataforma académica inteligente
            </span>
          </motion.div>

          <motion.h1 variants={item} style={{
            fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700,
            lineHeight: 1.1, color: 'var(--t0)', marginBottom: 24,
            letterSpacing: '-1px',
          }}>
            Estudia con{' '}
            <span className="gt">propósito</span>,<br />
            descansa con{' '}
            <span style={{
              position: 'relative', display: 'inline-block',
            }}>
              <span className="gt-amber">inteligencia</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.5, ease: [0.16,1,0.3,1] }}
                style={{
                  position: 'absolute', bottom: -4, left: 0, right: 0,
                  height: 3, background: 'linear-gradient(90deg, var(--amber), var(--rose))',
                  borderRadius: 99, transformOrigin: 'left',
                }}
              />
            </span>
          </motion.h1>

          <motion.p variants={item} style={{
            fontSize: 18, color: 'var(--t2)', marginBottom: 40, maxWidth: 480, lineHeight: 1.75,
          }}>
            EquilibraStudy combina Pomodoro adaptativo, calendario académico y análisis de bienestar para maximizar tu rendimiento sin quemarte.
          </motion.p>

          <motion.div variants={item} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
            <motion.a
              href="#registro"
              className="btn btn-primary btn-lg"
              whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              Comenzar gratis →
            </motion.a>
            <motion.a
              href="#como-funciona"
              className="btn btn-ghost btn-lg"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ▶ Ver demo
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={item} style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.n}</div>
                <div style={{ fontSize: 13, color: 'var(--t3)' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right — Pomodoro widget */}
        <div style={{ flexShrink: 0 }}>
          <PomodoroWidget />
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          color: 'var(--t3)', fontSize: 12,
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↓
        </motion.div>
        <span>Scroll</span>
      </motion.div>
    </section>
  )
}

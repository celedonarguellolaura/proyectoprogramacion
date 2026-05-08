import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const features = [
  {
    icon: '⏱',
    title: 'Pomodoro Inteligente',
    desc: 'Detecta tus exámenes urgentes y ajusta la sesión automáticamente. Si tienes un parcial en menos de 48h, sugiere bloques de 50 min en lugar de 25.',
    tag: 'RN-05 · Adaptativo',
    color: 'var(--indigo)',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    icon: '📅',
    title: 'Calendario Académico',
    desc: 'Registra exámenes, entregas y parciales con fecha límite y prioridad. Eventos urgentes destacados en rojo para que nunca los pierdas.',
    tag: 'Alta · Media · Baja',
    color: 'var(--rose)',
    bg: 'rgba(251,113,133,0.08)',
    border: 'rgba(251,113,133,0.25)',
  },
  {
    icon: '📊',
    title: 'Analytics Personales',
    desc: 'Visualiza tus horas por día, semana y mes. Descubre en qué horarios rindes más con gráficas claras de sesiones completadas vs. incompletas.',
    tag: 'Día · Semana · Mes',
    color: 'var(--violet)',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.25)',
  },
  {
    icon: '🎯',
    title: 'Metas Semanales',
    desc: 'Define cuántas horas quieres estudiar esta semana y sigue tu progreso en tiempo real. La barra de meta siempre visible en el dashboard.',
    tag: 'Progreso en tiempo real',
    color: 'var(--amber)',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.25)',
  },
  {
    icon: '😴',
    title: 'Registro de Fatiga',
    desc: 'Al terminar cada sesión, puntúa tu energía del 1 al 5. El sistema usa esos datos para ajustar las sugerencias de las próximas sesiones.',
    tag: 'Bienestar cognitivo',
    color: 'var(--pink)',
    bg: 'rgba(244,114,182,0.08)',
    border: 'rgba(244,114,182,0.25)',
  },
  {
    icon: '📄',
    title: 'Reporte PDF Mensual',
    desc: 'Exporta un resumen profesional con todas tus sesiones, horas acumuladas, fatiga promedio y porcentaje de meta. Perfecto para compartir con tu tutor.',
    tag: 'RF-10 · Exportación',
    color: 'var(--emerald)',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.25)',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const card = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16,1,0.3,1] } },
}

export default function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section" id="features" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* bg accent */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
        top: '20%', right: -100, pointerEvents: 'none',
      }} />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <span className="badge" style={{ marginBottom: 16 }}>Características</span>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 700, color: 'var(--t0)', marginBottom: 16, letterSpacing: '-0.5px' }}>
            Todo lo que necesitas para{' '}
            <span className="gt">estudiar mejor</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--t2)', maxWidth: 520, margin: '0 auto' }}>
            Seis módulos integrados que trabajan juntos para optimizar cada sesión de estudio.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={card}
              whileHover={{ y: -6, scale: 1.01 }}
              style={{
                background: f.bg,
                border: `1px solid ${f.border}`,
                borderRadius: 'var(--r-lg)',
                padding: '28px 24px',
                position: 'relative', overflow: 'hidden',
                cursor: 'default',
                transition: 'box-shadow .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${f.border}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Top gradient line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
              }} />

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${f.color}20`, border: `1px solid ${f.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 18,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--t0)', marginBottom: 10 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.75, marginBottom: 18 }}>
                {f.desc}
              </p>
              <span style={{
                fontSize: 11, fontWeight: 500, color: f.color,
                background: `${f.color}15`, border: `1px solid ${f.color}33`,
                borderRadius: 99, padding: '3px 10px', letterSpacing: '0.04em',
              }}>
                {f.tag}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

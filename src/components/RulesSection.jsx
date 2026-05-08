import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const rules = [
  {
    id: 'RN-01',
    icon: '🛡',
    title: 'Descanso obligatorio',
    desc: 'Tras 120 minutos de estudio continuo, el sistema bloquea el inicio de nuevas sesiones hasta completar al menos 15 minutos de descanso real.',
    color: 'var(--cyan)',
    bg:    'rgba(34,211,238,0.07)',
    border:'rgba(34,211,238,0.22)',
  },
  {
    id: 'RN-02',
    icon: '⚖️',
    title: 'Descanso proporcional',
    desc: 'Por cada 25 minutos de trabajo el sistema garantiza mínimo 5 minutos de descanso. Esta proporción la valida el servidor — el cliente no puede falsearla.',
    color: 'var(--emerald)',
    bg:    'rgba(52,211,153,0.07)',
    border:'rgba(52,211,153,0.22)',
  },
  {
    id: 'RN-03',
    icon: '🔒',
    title: 'Privacidad total',
    desc: 'Tus sesiones, eventos académicos y datos de fatiga son estrictamente privados. Todas las queries del servidor filtran por tu user_id del JWT.',
    color: 'var(--violet)',
    bg:    'rgba(167,139,250,0.07)',
    border:'rgba(167,139,250,0.22)',
  },
  {
    id: 'RN-04',
    icon: '✅',
    title: 'Sesión real validada',
    desc: 'Solo cuenta como completada si el timer llega a cero con máximo 2 pausas de más de 1 minuto. Más pausas → sesión incompleta → no suma al progreso.',
    color: 'var(--amber)',
    bg:    'rgba(251,191,36,0.07)',
    border:'rgba(251,191,36,0.22)',
  },
  {
    id: 'RN-05',
    icon: '🚀',
    title: 'Sugerencia inteligente',
    desc: 'Si tienes un evento Alta con deadline en menos de 48 horas, el sistema sugiere automáticamente una sesión de 50/10 en lugar de la estándar 25/5.',
    color: 'var(--rose)',
    bg:    'rgba(251,113,133,0.07)',
    border:'rgba(251,113,133,0.22)',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const card = {
  hidden:  { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } },
}

export default function RulesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section" id="reglas" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
        bottom: -200, left: -100, pointerEvents: 'none',
      }} />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <span className="badge" style={{ marginBottom: 16 }}>Motor inteligente</span>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 700, color: 'var(--t0)', marginBottom: 16, letterSpacing: '-0.5px' }}>
            Reglas que{' '}
            <span className="gt-amber">protegen</span> tu aprendizaje
          </h2>
          <p style={{ fontSize: 17, color: 'var(--t2)', maxWidth: 520, margin: '0 auto' }}>
            No es un temporizador cualquiera. EquilibraStudy tiene 5 reglas basadas en ciencia cognitiva que operan automáticamente.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 18,
          }}
        >
          {rules.map((r, i) => (
            <motion.div
              key={i}
              variants={card}
              whileHover={{ y: -5, scale: 1.02 }}
              style={{
                background: r.bg,
                border: `1px solid ${r.border}`,
                borderRadius: 'var(--r-lg)',
                padding: '24px 22px',
                position: 'relative', overflow: 'hidden',
                cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${r.bg}`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Corner accent */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 80, height: 80,
                background: `radial-gradient(circle at top right, ${r.color}15 0%, transparent 70%)`,
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${r.color}15`, border: `1px solid ${r.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: r.color, letterSpacing: '0.06em', marginBottom: 5 }}>
                    {r.id}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t0)', marginBottom: 8 }}>
                    {r.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>
                    {r.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

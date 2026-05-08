import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  {
    num: '01',
    icon: '📅',
    title: 'Registra tus eventos',
    desc: 'Agrega exámenes y entregas con fecha límite y prioridad. El sistema sabe cuándo se acerca el momento crítico.',
    color: 'var(--cyan)',
    bg: 'rgba(34,211,238,0.1)',
    border: 'rgba(34,211,238,0.3)',
  },
  {
    num: '02',
    icon: '🤖',
    title: 'El sistema te sugiere',
    desc: 'Con un clic EquilibraStudy analiza tus eventos urgentes y propone automáticamente la duración ideal de tu sesión.',
    color: 'var(--indigo-l)',
    bg: 'rgba(129,140,248,0.1)',
    border: 'rgba(129,140,248,0.3)',
  },
  {
    num: '03',
    icon: '⏱',
    title: 'Estudia con el Pomodoro',
    desc: 'El timer usa Date.now() como referencia absoluta: sigue contando aunque cambies de pestaña o recargues la página.',
    color: 'var(--violet)',
    bg: 'rgba(167,139,250,0.1)',
    border: 'rgba(167,139,250,0.3)',
  },
  {
    num: '04',
    icon: '😴',
    title: 'Registra tu fatiga',
    desc: 'Puntúa tu energía en 5 niveles al terminar. Esos datos refinan las próximas sugerencias haciéndolas más precisas.',
    color: 'var(--pink)',
    bg: 'rgba(244,114,182,0.1)',
    border: 'rgba(244,114,182,0.3)',
  },
  {
    num: '05',
    icon: '📊',
    title: 'Analiza tu progreso',
    desc: 'Revisa estadísticas por día, semana y mes. Exporta el reporte PDF cuando lo necesites y compártelo con tu tutor.',
    color: 'var(--emerald)',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.3)',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="section" id="como-funciona" style={{
      background: 'var(--bg2)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* grid bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.02,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <span className="badge" style={{ marginBottom: 16 }}>Flujo de uso</span>
          <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 700, color: 'var(--t0)', marginBottom: 16, letterSpacing: '-0.5px' }}>
            Una sesión inteligente en{' '}
            <span className="gt-emerald">5 pasos</span>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--t2)', maxWidth: 500, margin: '0 auto' }}>
            Desde que abres la app hasta que exportas tu progreso, todo fluye sin fricción.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={ref} style={{ position: 'relative' }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute', left: 27, top: 52, bottom: 52,
            width: 1,
            background: 'linear-gradient(to bottom, var(--indigo), var(--emerald))',
            opacity: 0.2,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -32 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.55, ease: [0.16,1,0.3,1] }}
                style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}
              >
                {/* Number badge */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  style={{
                    width: 56, height: 56, flexShrink: 0,
                    border: `1px solid ${s.border}`,
                    background: s.bg, borderRadius: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, zIndex: 1,
                    boxShadow: `0 0 20px ${s.bg}`,
                  }}
                >
                  {s.icon}
                </motion.div>

                {/* Content */}
                <motion.div
                  whileHover={{ x: 4 }}
                  style={{
                    flex: 1,
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 'var(--r)',
                    padding: '20px 24px',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
                    background: s.color, borderRadius: '3px 0 0 3px',
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.color, letterSpacing: '0.06em' }}>
                      PASO {s.num}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--t0)', marginBottom: 6 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.7 }}>{s.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

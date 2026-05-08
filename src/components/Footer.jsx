import { motion } from 'framer-motion'

const cols = [
  {
    title: 'Módulos',
    links: ['Zona de Enfoque (Pomodoro)', 'Calendario Académico', 'Analytics', 'Metas Semanales', 'Reporte PDF'],
  },
  {
    title: 'Reglas',
    links: ['RN-01 Descanso obligatorio', 'RN-02 Proporción mínima', 'RN-03 Privacidad total', 'RN-04 Sesión real', 'RN-05 Sugerencia inteligente'],
  },
  {
    title: 'Proyecto',
    links: ['Curso SIST0200 · Lógica y Programación', 'Stack: Next.js + Supabase + Vercel', 'Versión 1.0 · Mayo 2026', 'Laura Celedon · Doc. 1128201459', 'Universidad Sergio Arboleda'],
  },
]

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      padding: '70px 0 40px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, var(--indigo), var(--cyan), transparent)',
        opacity: 0.4,
      }} />

      <div className="container">
        {/* Brand + cols */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 40, marginBottom: 60,
        }}>
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v14M4 10l6-7 6 7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="14" r="3" stroke="#fff" strokeWidth="1.6"/>
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--t0)' }}>
                Equilibra<span className="gt">Study</span>
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.8, maxWidth: 260 }}>
              Plataforma de gestión inteligente del tiempo académico para estudiantes de la Universidad Sergio Arboleda.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 18,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: 8, padding: '5px 12px', fontSize: 12, color: 'var(--indigo-l)', fontWeight: 500,
            }}>
              🎓 @usa.edu.co
            </div>
          </motion.div>

          {cols.map((col, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i + 1) * 0.1, duration: 0.5 }}
            >
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--t0)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((l, j) => (
                  <li key={j} style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>{l}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 28,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
          fontSize: 13, color: 'var(--t3)',
        }}>
          <span>© 2026 EquilibraStudy — Todos los derechos reservados</span>
          <span>
            Hecho con ⚡ por Laura Celedon · Acceso exclusivo{' '}
            <strong style={{ color: 'var(--indigo-l)' }}>@usa.edu.co</strong>
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 520px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}

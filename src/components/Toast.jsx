import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../context/ToastContext'

const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }
const colors = {
  success: 'var(--emerald)',
  error:   'var(--rose)',
  info:    'var(--indigo-l)',
  warning: 'var(--amber)',
}

export default function Toast() {
  const { toasts } = useToast()

  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              background: '#fff',
              border: `1px solid ${colors[t.type]}44`,
              borderLeft: `3px solid ${colors[t.type]}`,
              borderRadius: 'var(--r-sm)',
              padding: '14px 18px',
              minWidth: 280, maxWidth: 360,
              boxShadow: `0 4px 20px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04)`,
              pointerEvents: 'all',
            }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: `${colors[t.type]}1A`,
              border: `1px solid ${colors[t.type]}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, color: colors[t.type], flexShrink: 0, fontWeight: 600,
            }}>
              {icons[t.type]}
            </span>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--t0)', marginBottom: 2 }}>
                {t.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)' }}>{t.message}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

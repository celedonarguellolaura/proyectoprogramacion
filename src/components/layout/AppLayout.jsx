import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { D } from '../../styles/theme'

const NAV = [
  { id: 'dashboard', label: 'Inicio',          icon: '🏠', color: D.amarillo },
  { id: 'focus',     label: 'Zona de Enfoque', icon: '⏱️', color: D.cian    },
  { id: 'calendar',  label: 'Calendario',      icon: '📅', color: D.azul    },
  { id: 'analytics', label: 'Analytics',       icon: '📊', color: D.lavanda },
  { id: 'profile',   label: 'Perfil',          icon: '👤', color: D.t2      },
]
const ADMIN_NAV = { id: 'admin', label: 'Administración', icon: '⚙️', color: D.naranja }

export function Avatar({ name, size = 36 }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366F1, #00C8F5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0,
      boxShadow: '0 0 14px rgba(99,102,241,0.4)',
    }}>{initials}</div>
  )
}

function SidebarContent({ user, currentPage, onNavigate, onGoHome, onLogout, onClose }) {
  const items = user.role === 'super_admin' ? [...NAV, ADMIN_NAV] : NAV

  return (
    <aside style={{
      width: 240, height: '100%', display: 'flex', flexDirection: 'column',
      background: D.bg2, borderRight: `1px solid ${D.border}`,
    }}>
      {/* Logo — click goes to landing */}
      <div
        onClick={() => { onGoHome?.(); onClose?.() }}
        style={{
          padding: '20px 20px 16px', borderBottom: `1px solid ${D.border}`,
          cursor: 'pointer', userSelect: 'none',
          transition: 'opacity .2s',
        }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.75'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
        title="Ir a la página principal"
      >
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.4px', color: D.t0 }}>
          Equilibra<span style={{ color: D.cian }}>Study</span>
        </div>
        <div style={{ fontSize: 10, color: D.t3, marginTop: 2, letterSpacing: '0.03em' }}>
          Gestión del tiempo académico
        </div>
      </div>

      {/* User */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={user.name} size={38} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: D.t0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 11, color: D.t3 }}>
            {user.role === 'super_admin' ? 'Administrador' : 'Estudiante'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => {
          const active = currentPage === item.id
          return (
            <button key={item.id} onClick={() => { onNavigate(item.id); onClose?.() }} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Inter',
              fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all .15s',
              background: active ? `${item.color}18` : 'transparent',
              color: active ? item.color : D.t2,
              width: '100%', textAlign: 'left',
            }}
              onMouseOver={e => { if (!active) e.currentTarget.style.background = D.card2 }}
              onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>{item.icon}</span>
              {item.label}
              {active && (
                <motion.div layoutId="nav-dot" style={{
                  marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: item.color,
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px' }}>
        <button onClick={onLogout} style={{
          width: '100%', padding: '10px', borderRadius: 10,
          border: `1px solid ${D.naranjaBg}`,
          background: D.naranjaBg,
          color: D.naranja, fontFamily: 'Inter', fontSize: 13,
          cursor: 'pointer', fontWeight: 500, transition: 'background .15s',
        }}
          onMouseOver={e => e.currentTarget.style.background = D.naranjaDark === '#7A2E00' ? 'rgba(255,128,64,0.18)' : D.naranjaBg}
          onMouseOut={e => e.currentTarget.style.background = D.naranjaBg}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default function AppLayout({ user, currentPage, onNavigate, onGoHome, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: D.bg, fontFamily: 'Inter, sans-serif' }}>
      {/* Desktop sidebar */}
      <div style={{ width: 240, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>
        <SidebarContent user={user} currentPage={currentPage} onNavigate={onNavigate} onGoHome={onGoHome} onLogout={onLogout} />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
            <motion.div initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              style={{ width: 240, position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 201 }}>
              <SidebarContent user={user} currentPage={currentPage} onNavigate={onNavigate}
                onGoHome={onGoHome} onLogout={onLogout} onClose={() => setMobileOpen(false)} />
            </motion.div>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setMobileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile top bar */}
      <div className="mobile-bar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 54, background: D.bg2,
        borderBottom: `1px solid ${D.border}`, display: 'none', alignItems: 'center',
        padding: '0 16px', gap: 12, zIndex: 99,
      }}>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: D.t1 }}>☰</button>
        <span style={{ fontWeight: 800, color: D.t0, fontSize: 16 }}>
          Equilibra<span style={{ color: D.cian }}>Study</span>
        </span>
      </div>

      {/* Page content */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', overflow: 'auto', background: D.bg }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main { margin-left: 0 !important; padding-top: 54px; }
          .mobile-bar { display: flex !important; }
        }
        @media (min-width: 769px) { .mobile-bar { display: none !important; } }
        * { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.12) transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
      `}</style>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { D } from '../../styles/theme'

const NAV = [
  { id: 'dashboard', label: 'Inicio',          short: 'Inicio',   icon: '🏠', color: D.amarillo },
  { id: 'focus',     label: 'Zona de Enfoque', short: 'Enfoque',  icon: '⏱️', color: D.cian    },
  { id: 'calendar',  label: 'Calendario',      short: 'Agenda',   icon: '📅', color: D.azul    },
  { id: 'analytics', label: 'Analytics',       short: 'Stats',    icon: '📊', color: D.lavanda },
  { id: 'profile',   label: 'Perfil',          short: 'Perfil',   icon: '👤', color: D.t2      },
]
const ADMIN_NAV = { id: 'admin', label: 'Administración', short: 'Admin', icon: '⚙️', color: D.naranja }

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
      <div
        onClick={() => { onGoHome?.(); onClose?.() }}
        style={{
          padding: '20px 20px 16px', borderBottom: `1px solid ${D.border}`,
          cursor: 'pointer', userSelect: 'none', transition: 'opacity .2s',
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

      <nav style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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

      <div style={{ padding: '12px' }}>
        <button onClick={onLogout} style={{
          width: '100%', padding: '10px', borderRadius: 10,
          border: `1px solid ${D.naranjaBg}`, background: D.naranjaBg,
          color: D.naranja, fontFamily: 'Inter', fontSize: 13,
          cursor: 'pointer', fontWeight: 500, transition: 'background .15s',
        }}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default function AppLayout({ user, currentPage, onNavigate, onGoHome, onLogout, children }) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const navItems = user.role === 'super_admin' ? [...NAV, ADMIN_NAV] : NAV

  // Cierra el menú de usuario al tocar fuera
  useEffect(() => {
    if (!showUserMenu) return
    const close = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close) }
  }, [showUserMenu])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: D.bg, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sidebar — solo desktop ── */}
      <div className="desktop-sidebar" style={{
        width: 240, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <SidebarContent
          user={user} currentPage={currentPage}
          onNavigate={onNavigate} onGoHome={onGoHome} onLogout={onLogout}
        />
      </div>

      {/* ── Top bar móvil ── */}
      <div className="mobile-bar" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 54,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${D.border}`,
        display: 'none', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px',
        zIndex: 150,
      }}>
        {/* Logo → landing */}
        <span
          onClick={onGoHome}
          style={{ fontWeight: 800, color: D.t0, fontSize: 17, cursor: 'pointer', letterSpacing: '-0.3px' }}
        >
          Equilibra<span style={{ color: D.cian }}>Study</span>
        </span>

        {/* Avatar + menú usuario */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(v => !v)}
            style={{
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              background: D.surface, border: `1px solid ${D.border}`,
              borderRadius: 99, padding: '4px 10px 4px 4px',
            }}
          >
            <Avatar name={user.name} size={28} />
            <span style={{ fontSize: 13, fontWeight: 600, color: D.t0 }}>
              {user.name.split(' ')[0]}
            </span>
            <span style={{ fontSize: 10, color: D.t3 }}>{showUserMenu ? '▲' : '▼'}</span>
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 42, right: 0,
                  background: '#fff', border: `1px solid ${D.border2}`,
                  borderRadius: 16, padding: '14px',
                  minWidth: 220,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                  zIndex: 999,
                }}
              >
                {/* Info usuario */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Avatar name={user.name} size={40} />
                  <div>
                    <div style={{ fontWeight: 700, color: D.t0, fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: D.t3, marginTop: 1 }}>{user.email}</div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
                      background: 'rgba(51,209,122,0.12)', border: '1px solid rgba(51,209,122,0.3)',
                      borderRadius: 6, padding: '2px 7px', fontSize: 10, color: D.verde, fontWeight: 600,
                    }}>
                      ✓ {user.role === 'super_admin' ? 'Administrador' : 'Estudiante'}
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: D.border, marginBottom: 12 }} />

                <button
                  onClick={() => { setShowUserMenu(false); onLogout() }}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10, border: 'none',
                    background: 'rgba(255,128,64,0.1)', color: D.naranja,
                    fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                    transition: 'background .15s',
                  }}
                >
                  Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Contenido de página ── */}
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

      {/* ── Bottom navigation — solo móvil ── */}
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${D.border}`,
        display: 'none', alignItems: 'center', justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: 64, zIndex: 150,
      }}>
        {navItems.map(item => {
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: active ? `${item.color}15` : 'transparent',
                border: 'none', cursor: 'pointer',
                padding: '7px 10px', borderRadius: 12,
                transition: 'all .15s', fontFamily: 'Inter',
                minWidth: 52, flex: 1,
              }}
            >
              <motion.span
                style={{ fontSize: 22, lineHeight: 1, display: 'block' }}
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {item.icon}
              </motion.span>
              <span style={{
                fontSize: 10, lineHeight: 1,
                color: active ? item.color : D.t3,
                fontWeight: active ? 700 : 400,
                letterSpacing: active ? '-0.2px' : '0',
              }}>
                {item.short}
              </span>
              {active && (
                <motion.div
                  layoutId="bottom-indicator"
                  style={{
                    position: 'absolute', bottom: 0,
                    width: 32, height: 3,
                    background: item.color,
                    borderRadius: '3px 3px 0 0',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <style>{`
        /* Desktop: sidebar visible, bottom nav oculto */
        .desktop-sidebar { display: block; }
        .mobile-bottom-nav { display: none !important; }
        .mobile-bar { display: none !important; }

        @media (max-width: 768px) {
          /* Ocultar sidebar de escritorio */
          .desktop-sidebar { display: none !important; }
          /* Mostrar top bar y bottom nav */
          .mobile-bar { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; position: fixed !important; }
          /* Ajustar main */
          main {
            margin-left: 0 !important;
            padding-top: 54px !important;
            padding-bottom: 68px !important;
          }
          .app-page { padding: 16px !important; }
        }

        @media (max-width: 480px) {
          .app-page { padding: 12px !important; }
        }

        * { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.12) transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
      `}</style>
    </div>
  )
}

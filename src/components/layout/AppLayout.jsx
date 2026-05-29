import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { D } from '../../styles/theme'

const NAV = [
  { id: 'dashboard', label: 'Inicio',          short: 'Inicio',  icon: '🏠', color: D.amarillo },
  { id: 'focus',     label: 'Zona de Enfoque', short: 'Enfoque', icon: '⏱️', color: D.cian    },
  { id: 'calendar',  label: 'Calendario',      short: 'Agenda',  icon: '📅', color: D.azul    },
  { id: 'analytics', label: 'Analytics',       short: 'Stats',   icon: '📊', color: D.lavanda },
  { id: 'profile',   label: 'Perfil',          short: 'Perfil',  icon: '👤', color: D.t2      },
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
      {/* Logo */}
      <div
        onClick={() => { onGoHome?.(); onClose?.() }}
        style={{
          padding: '20px 20px 16px', borderBottom: `1px solid ${D.border}`,
          cursor: 'pointer', userSelect: 'none', transition: 'opacity .2s',
        }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.75'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
      >
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.4px', color: D.t0 }}>
          Equilibra<span style={{ color: D.cian }}>Study</span>
        </div>
        <div style={{ fontSize: 10, color: D.t3, marginTop: 2 }}>
          Gestión del tiempo académico
        </div>
      </div>

      {/* Usuario */}
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

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => {
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); onClose?.() }}
              style={{
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
                <motion.div
                  layoutId="nav-dot"
                  style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: item.color }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Cerrar sesión */}
      <div style={{ padding: '12px' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            border: `1px solid ${D.naranjaBg}`, background: D.naranjaBg,
            color: D.naranja, fontFamily: 'Inter', fontSize: 13,
            cursor: 'pointer', fontWeight: 500,
          }}
        >
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

  // Cierra menú de usuario al tocar fuera
  useEffect(() => {
    if (!showUserMenu) return
    const handler = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
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

      {/* ── Top bar — solo móvil ── */}
      <div
        className="mobile-bar"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 54,
          background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${D.border}`,
          display: 'none', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 16px',
          zIndex: 150,
        }}
      >
        {/* Logo */}
        <span
          onClick={onGoHome}
          style={{ fontWeight: 800, color: D.t0, fontSize: 17, cursor: 'pointer', letterSpacing: '-0.3px' }}
        >
          Equilibra<span style={{ color: D.cian }}>Study</span>
        </span>

        {/* Avatar con dropdown */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: D.card, border: `1px solid ${D.border}`,
              borderRadius: 99, padding: '4px 10px 4px 4px',
              cursor: 'pointer', fontFamily: 'Inter',
            }}
          >
            <Avatar name={user.name} size={28} />
            <span style={{ fontSize: 13, fontWeight: 600, color: D.t0 }}>
              {user.name.split(' ')[0]}
            </span>
            <span style={{ fontSize: 10, color: D.t3 }}>{showUserMenu ? '▲' : '▼'}</span>
          </button>

          {/* Dropdown usuario */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute', top: 42, right: 0,
                  background: '#fff', border: `1px solid ${D.border2}`,
                  borderRadius: 16, padding: '16px',
                  minWidth: 220,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  zIndex: 999,
                }}
              >
                {/* Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Avatar name={user.name} size={40} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, color: D.t0, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 11, color: D.t3, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5,
                      background: D.verdeBg, border: `1px solid ${D.verde}40`,
                      borderRadius: 6, padding: '2px 7px',
                      fontSize: 10, color: D.verde, fontWeight: 600,
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
                    background: D.naranjaBg, color: D.naranja,
                    fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', fontSize: 14,
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
      <nav
        className="mobile-bottom-nav"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${D.border}`,
          display: 'none', alignItems: 'center', justifyContent: 'space-around',
          height: 64, zIndex: 150,
        }}
      >
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
                padding: '6px 8px', borderRadius: 12,
                transition: 'background .2s',
                fontFamily: 'Inter', flex: 1,
                position: 'relative',
              }}
            >
              <span style={{
                fontSize: 22, lineHeight: 1,
                transform: active ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform .2s',
                display: 'block',
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 10, lineHeight: 1,
                color: active ? item.color : D.t3,
                fontWeight: active ? 700 : 400,
              }}>
                {item.short}
              </span>
              {active && (
                <span style={{
                  position: 'absolute', bottom: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 28, height: 3,
                  background: item.color,
                  borderRadius: '3px 3px 0 0',
                  display: 'block',
                }} />
              )}
            </button>
          )
        })}
      </nav>

      <style>{`
        .desktop-sidebar { display: block; }
        .mobile-bottom-nav { display: none !important; }
        .mobile-bar        { display: none !important; }

        @media (max-width: 768px) {
          .desktop-sidebar   { display: none !important; }
          .mobile-bar        { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
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

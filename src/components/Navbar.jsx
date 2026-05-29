import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const links = [
  { label: 'Características', href: '#features' },
  { label: 'Cómo funciona',   href: '#como-funciona' },
  { label: 'Reglas',          href: '#reglas' },
  { label: 'Registrarse',     href: '#registro' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 64,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
        transition: 'background .3s, border-color .3s, backdrop-filter .3s, box-shadow .3s',
        display: 'flex', alignItems: 'center',
      }}
    >
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'
      }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--cian), var(--azul))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(0,200,245,0.4)',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 17C10 17 2 11.5 2 6.5C2 4.0 4.0 2 6.5 2C8.0 2 9.3 2.8 10 4C10.7 2.8 12.0 2 13.5 2C16.0 2 18 4.0 18 6.5C18 11.5 10 17 10 17Z" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, color: '#1A1A2E' }}>
            Equilibra<span className="gt">Study</span>
          </span>
        </a>

        {/* Links — desktop */}
        <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0 }}
            className="nav-desktop">
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} style={{
                color: 'rgba(26,26,46,0.55)', fontSize: 14, textDecoration: 'none',
                fontWeight: 500, transition: 'color .2s',
              }}
                onMouseEnter={e => e.target.style.color = '#1A1A2E'}
                onMouseLeave={e => e.target.style.color = 'rgba(26,26,46,0.55)'}
              >{l.label}</a>
            </li>
          ))}
        </ul>

        {/* CTA — desktop */}
        <div className="nav-cta" style={{ display: 'flex', gap: 10 }}>
          <motion.a
            href="#registro"
            className="btn btn-ghost"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ fontSize: 14, padding: '9px 20px' }}
            onClick={() => document.getElementById('tab-login')?.click()}
          >
            Iniciar sesión
          </motion.a>
          <motion.a
            href="#registro"
            className="btn btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{ fontSize: 14, padding: '9px 20px' }}
          >
            Crear cuenta →
          </motion.a>
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="nav-burger"
          onClick={() => setOpen(o => !o)}
          aria-label="Menú"
          style={{
            display: 'none', background: 'none',
            border: '1px solid var(--border2)', borderRadius: 8,
            width: 36, height: 36, cursor: 'pointer',
            fontSize: 18, color: 'var(--t0)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {open && (
        <div style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          zIndex: 199,
        }}>
          {links.map(l => (
            <a key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              style={{
                color: 'rgba(26,26,46,0.65)', fontSize: 16, textDecoration: 'none',
                fontWeight: 500, padding: '11px 0',
                borderBottom: '1px solid var(--border)', display: 'block',
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
            <a href="#registro" className="btn btn-ghost btn-full"
              onClick={() => { setOpen(false); document.getElementById('tab-login')?.click() }}>
              Iniciar sesión
            </a>
            <a href="#registro" className="btn btn-primary btn-full"
              onClick={() => setOpen(false)}>
              Crear cuenta →
            </a>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-cta    { display: none !important; }
          .nav-burger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-burger { display: none !important; }
        }
      `}</style>
    </motion.nav>
  )
}

import { useState, useEffect } from 'react'
import { ToastProvider } from './context/ToastContext'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import Features     from './components/Features'
import HowItWorks   from './components/HowItWorks'
import RulesSection from './components/RulesSection'
import AuthSection  from './components/AuthSection'
import Footer       from './components/Footer'
import Toast        from './components/Toast'
import AppLayout    from './components/layout/AppLayout'
import DashboardPage  from './pages/DashboardPage'
import FocusPage      from './pages/FocusPage'
import CalendarPage   from './pages/CalendarPage'
import AnalyticsPage  from './pages/AnalyticsPage'
import ProfilePage    from './pages/ProfilePage'
import AdminPage      from './pages/AdminPage'
import { storage } from './services/storage'

// Seed admin on first load
const ensureAdmin = async () => {
  try {
    const users = await storage.getUsers()
    if (!users.some(u => u.role === 'super_admin')) {
      await storage.addUser({
        id: 'u_admin_seed',
        name: 'Administrador',
        email: 'admin@usa.edu.co',
        pass: 'Admin123!',
        role: 'super_admin',
        isActive: true,
        createdAt: new Date().toISOString(),
      })
    }
  } catch { /* silencioso — no bloquea el arranque */ }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => storage.getSession())
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => { ensureAdmin() }, [])

  const handleLogin = user => {
    setCurrentUser(user)
    setShowLanding(false)
    storage.saveSession(user)
    storage.addAudit({
      userId: user.id, userEmail: user.email, userRole: user.role,
      action: 'login', entity: 'system', summary: `Inicio de sesión: ${user.name}`,
    })
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    if (currentUser) {
      storage.addAudit({
        userId: currentUser.id, userEmail: currentUser.email, userRole: currentUser.role,
        action: 'logout', entity: 'system', summary: 'Cierre de sesión',
      })
    }
    storage.clearTimer()
    setCurrentUser(null)
    storage.clearSession()
    setCurrentPage('dashboard')
  }

  const pageProps = { user: currentUser, onNavigate: setCurrentPage }

  const renderPage = () => {
    if (!currentUser) return null
    switch (currentPage) {
      case 'dashboard': return <DashboardPage {...pageProps} />
      case 'focus':     return <FocusPage     {...pageProps} />
      case 'calendar':  return <CalendarPage  {...pageProps} />
      case 'analytics': return <AnalyticsPage {...pageProps} />
      case 'profile':   return <ProfilePage   {...pageProps} />
      case 'admin':     return currentUser.role === 'super_admin' ? <AdminPage {...pageProps} /> : <DashboardPage {...pageProps} />
      default:          return <DashboardPage {...pageProps} />
    }
  }

  const showApp = currentUser && !showLanding

  return (
    <ToastProvider>
      {showApp ? (
        <AppLayout
          user={currentUser}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onGoHome={() => setShowLanding(true)}
          onLogout={handleLogout}
        >
          {renderPage()}
        </AppLayout>
      ) : (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
          {/* Banner for logged-in users viewing landing */}
          {currentUser && showLanding && (
            <div style={{
              position: 'sticky', top: 0, zIndex: 999,
              background: 'linear-gradient(90deg, rgba(99,102,241,0.95), rgba(34,211,238,0.95))',
              backdropFilter: 'blur(12px)',
              padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
                Sesión activa como <strong>{currentUser.name}</strong>
              </span>
              <button
                onClick={() => setShowLanding(false)}
                style={{
                  padding: '7px 18px', borderRadius: 8, border: 'none',
                  background: '#fff', color: '#4F46E5', fontWeight: 600, fontFamily: 'Inter',
                  cursor: 'pointer', fontSize: 13,
                }}
              >
                Volver al dashboard →
              </button>
            </div>
          )}
          <Navbar />
          <main>
            <Hero />
            <Features />
            <HowItWorks />
            <RulesSection />
            <AuthSection onLogin={handleLogin} />
          </main>
          <Footer />
        </div>
      )}
      <Toast />
    </ToastProvider>
  )
}

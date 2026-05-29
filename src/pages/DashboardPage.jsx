import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { storage } from '../services/storage'
import { getMonday, getContinuousStudyMinutes, getUrgentEvents, getWeeklyProgress } from '../services/sessionService'
import { D } from '../styles/theme'

const Card = ({ children, style }) => (
  <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: 20, ...style }}>
    {children}
  </div>
)

const StatCard = ({ icon, label, value, unit, color, bg }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: D.t0, lineHeight: 1.1 }}>
        {value}<span style={{ fontSize: 13, color: D.t3, marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12, color: D.t3, marginTop: 3 }}>{label}</div>
    </div>
  </Card>
)

export default function DashboardPage({ user, onNavigate }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = async () => {
      const weekStart = getMonday()
      const [sessions, events, goal] = await Promise.all([
        storage.getSessions(user.id),
        storage.getEvents(user.id),
        storage.getGoal(user.id, weekStart),
      ])
      const progress  = getWeeklyProgress(sessions, user.id, weekStart, goal?.goalHours)
      const continuousMin = getContinuousStudyMinutes(sessions)
      const urgent    = getUrgentEvents(events)
      const today     = new Date().toDateString()
      const todaySessions = sessions.filter(s => new Date(s.startedAt).toDateString() === today)
      const todayMinutes  = todaySessions.filter(s => s.status === 'completada').reduce((a, s) => a + s.effectiveMinutes, 0)
      const completedAll  = sessions.filter(s => s.status === 'completada').length
      let streak = 0
      const d = new Date()
      while (true) {
        const ds = d.toDateString()
        if (!sessions.some(s => new Date(s.startedAt).toDateString() === ds && s.status === 'completada')) break
        streak++; d.setDate(d.getDate() - 1)
      }
      setData({ progress, continuousMin, urgent, todayMinutes, completedAll, streak, sessions })
    }
    load()
  }, [user.id])

  if (!data) return <div style={{ padding: 40, color: D.t3, fontSize: 14 }}>Cargando...</div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = user.name.split(' ')[0]
  const { progress, urgent, todayMinutes, completedAll, streak } = data
  const isBlocked = data.continuousMin >= 120

  return (
    <div className="app-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: D.t3, marginBottom: 4 }}>{greeting},</p>
        <h1 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 700, color: D.t0, letterSpacing: '-0.5px', margin: 0 }}>
          {firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: D.t2, marginTop: 6 }}>
          Sesión activa: <strong style={{ color: D.cian }}>{user.email}</strong>
        </p>
      </motion.div>

      {/* Blocked */}
      {isBlocked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: D.verdeBg, border: `1.5px solid ${D.verde}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>🛑</span>
          <div>
            <div style={{ fontWeight: 600, color: D.verde, fontSize: 14 }}>Descanso obligatorio (RN-01)</div>
            <div style={{ color: D.t2, fontSize: 13 }}>Acumulaste 120+ min de estudio continuo. Tómate 15 min antes de continuar.</div>
          </div>
        </motion.div>
      )}

      {/* Urgent */}
      {urgent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          onClick={() => onNavigate('calendar')}
          style={{ background: D.naranjaBg, border: `1.5px solid ${D.naranja}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: D.naranja, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Evento urgente</div>
            <div style={{ fontWeight: 600, color: D.t0, fontSize: 15 }}>{urgent[0].name}</div>
            <div style={{ fontSize: 12, color: D.t2 }}>
              {new Date(urgent[0].deadline).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <span style={{ color: D.naranja, fontSize: 20 }}>›</span>
        </motion.div>
      )}

      {/* Goal progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, color: D.t0, fontSize: 15 }}>Meta semanal</div>
              <div style={{ fontSize: 13, color: D.t3, marginTop: 2 }}>
                {progress.accumulated.toFixed(1)}h de {progress.goal ? `${progress.goal}h` : 'sin meta'}
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: D.amarillo, background: D.amarilloBg, border: `1px solid ${D.amarillo}40`, borderRadius: 10, padding: '4px 12px' }}>
              {progress.percentage}%
            </div>
          </div>
          <div style={{ height: 8, background: D.border, borderRadius: 99, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress.percentage}%` }} transition={{ duration: 0.8 }}
              style={{ height: '100%', background: D.amarillo, borderRadius: 99 }} />
          </div>
          {!progress.goal && (
            <div style={{ marginTop: 10, fontSize: 12, color: D.t3 }}>
              <span style={{ cursor: 'pointer', color: D.azul }} onClick={() => onNavigate('profile')}>Configura tu meta semanal →</span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '⚡', label: 'Minutos hoy',      value: todayMinutes, unit: 'min',   color: D.cian,    bg: D.cianBg    },
          { icon: '🎯', label: 'Sesiones totales',  value: completedAll, unit: '',      color: D.verde,   bg: D.verdeBg   },
          { icon: '🔥', label: 'Racha actual',       value: streak,       unit: 'día(s)',color: D.naranja, bg: D.naranjaBg },
          { icon: '📊', label: 'Esta semana',        value: progress.accumulated.toFixed(1), unit: 'h', color: D.lavanda, bg: D.lavandaBg },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <button
          onClick={() => onNavigate('focus')}
          disabled={isBlocked}
          style={{
            width: '100%', padding: '18px', borderRadius: 14, border: 'none',
            background: isBlocked ? D.card2 : D.cian,
            color: isBlocked ? D.t3 : '#003D4D',
            fontSize: 17, fontWeight: 600, fontFamily: 'Inter', cursor: isBlocked ? 'not-allowed' : 'pointer',
            letterSpacing: '-0.2px', transition: 'opacity .2s', marginBottom: 16,
            boxShadow: isBlocked ? 'none' : '0 0 32px rgba(0,200,245,0.3)',
          }}
          onMouseOver={e => !isBlocked && (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          {isBlocked ? '🛑 Descanso obligatorio activo' : '⏱️ Iniciar sesión de estudio →'}
        </button>
      </motion.div>

      {/* Recent sessions */}
      {completedAll === 0 ? (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontWeight: 600, color: D.t0, marginBottom: 6 }}>Bienvenida a EquilibraStudy</div>
          <div style={{ color: D.t2, fontSize: 14, marginBottom: 20 }}>Empieza registrando tu próximo examen o iniciando tu primera sesión.</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('calendar')} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: D.azulBg, color: D.azul, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>📅 Agregar evento</button>
            <button onClick={() => onNavigate('focus')} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: D.cianBg, color: D.cian, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>⏱️ Primera sesión</button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ fontWeight: 600, color: D.t0, marginBottom: 14, fontSize: 15 }}>Últimas sesiones</div>
          {(data?.sessions ?? []).slice(-5).reverse().map((s, i) => {
            const completado = s.status === 'completada'
            const efectivos  = s.effectiveMinutes ?? 0
            const propuesto  = s.workDurationMin ?? 0
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 4 ? `1px solid ${D.border}` : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: completado ? D.verde : D.naranja }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: D.t1, fontWeight: 500 }}>
                    Propuso {propuesto} min
                    <span style={{ color: D.t3, margin: '0 4px' }}>→</span>
                    <span style={{ color: completado ? D.verde : D.naranja, fontWeight: 700 }}>
                      completó {efectivos} min
                    </span>
                    {s.fatigueLevel && <span style={{ color: D.rosa, marginLeft: 6, fontSize: 11 }}>· Fatiga {s.fatigueLevel}/5</span>}
                  </div>
                  <div style={{ fontSize: 11, color: D.t3, marginTop: 2 }}>{new Date(s.startedAt).toLocaleString('es')}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                  background: completado ? 'rgba(51,209,122,0.12)' : 'rgba(255,128,64,0.12)',
                  color: completado ? D.verde : D.naranja,
                  border: `1px solid ${completado ? 'rgba(51,209,122,0.3)' : 'rgba(255,128,64,0.3)'}`,
                }}>
                  {completado ? '✓ Completado' : '✗ No completado'}
                </span>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}

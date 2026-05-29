import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { storage } from '../services/storage'
import { getMonday } from '../services/sessionService'
import { useToast } from '../context/ToastContext'
import { Avatar } from '../components/layout/AppLayout'
import { D } from '../styles/theme'

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: `1.5px solid ${D.border2}`, background: D.input,
  fontSize: 14, color: D.t0, fontFamily: 'Inter', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .2s',
}

const Card = ({ children, style }) => (
  <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '24px', marginBottom: 20, ...style }}>
    {children}
  </div>
)

export default function ProfilePage({ user }) {
  const { addToast } = useToast()
  const [goalHours, setGoalHours] = useState('')
  const [curPass,   setCurPass]   = useState('')
  const [newPass,   setNewPass]   = useState('')
  const [newPass2,  setNewPass2]  = useState('')
  const [passErr,   setPassErr]   = useState('')
  const [sessions,  setSessions]  = useState([])

  useEffect(() => {
    const load = async () => {
      const g = await storage.getGoal(user.id, getMonday())
      if (g) setGoalHours(String(g.goalHours))
      const s = await storage.getSessions(user.id)
      setSessions(s)
    }
    load()
  }, [user.id])

  const saveGoal = e => {
    e.preventDefault()
    const h = parseFloat(goalHours)
    if (!h || h <= 0) { addToast('Error', 'Ingresa un número válido.', 'error'); return }
    storage.upsertGoal({ userId: user.id, weekStart: getMonday(), goalHours: h })
    storage.addAudit({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'set_goal', entity: 'goal', summary: `Meta: ${h}h` })
    addToast('Meta guardada', `Tu meta semanal es ${h} horas.`, 'success')
  }

  const changePass = async e => {
    e.preventDefault(); setPassErr('')
    const me = await storage.findUser(user.email)
    if (!me || me.pass !== curPass) { setPassErr('La contraseña actual es incorrecta.'); return }
    if (newPass.length < 8)  { setPassErr('La nueva contraseña debe tener al menos 8 caracteres.'); return }
    if (newPass !== newPass2) { setPassErr('Las contraseñas no coinciden.'); return }
    await storage.updateUser(user.id, { pass: newPass })
    storage.saveSession({ ...user })
    addToast('Contraseña actualizada', 'Tu contraseña ha sido cambiada.', 'success')
    setCurPass(''); setNewPass(''); setNewPass2('')
  }

  const totalMin  = sessions.filter(s => s.status === 'completada').reduce((a, s) => a + s.effectiveMinutes, 0)
  const totalSess = sessions.filter(s => s.status === 'completada').length

  return (
    <div className="app-page" style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <span style={{ fontSize: 22 }}>👤</span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: D.t0, margin: 0 }}>Mi Perfil</h1>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar name={user.name} size={64} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: D.t0 }}>{user.name}</div>
              <div style={{ fontSize: 14, color: D.t3, marginTop: 2 }}>{user.email}</div>
              <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: D.verdeBg, border: `1px solid ${D.verde}40`, borderRadius: 6, padding: '3px 10px', fontSize: 12, color: D.verde, fontWeight: 500 }}>
                ✓ {user.role === 'super_admin' ? 'Administrador' : 'Correo verificado · Estudiante'}
              </div>
            </div>
          </div>
          <div className="profile-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Horas totales de estudio', value: `${(totalMin / 60).toFixed(1)}h`, color: D.cian, bg: D.cianBg },
              { label: 'Sesiones completadas',     value: totalSess, color: D.verde, bg: D.verdeBg },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px', border: `1px solid ${s.color}40` }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: D.t0 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: D.t3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Goal */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: D.t0, marginBottom: 16 }}>🎯 Meta semanal de estudio</h3>
          <form onSubmit={saveGoal}>
            <label style={{ display: 'block', fontSize: 13, color: D.t2, marginBottom: 6, fontWeight: 500 }}>
              Horas que quiero estudiar esta semana
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="number" min={1} max={80} step={0.5} value={goalHours} onChange={e => setGoalHours(e.target.value)}
                placeholder="Ej: 20" style={inp} />
              <button type="submit" style={{
                padding: '11px 22px', borderRadius: 10, border: 'none',
                background: D.amarillo, color: '#6B5A00', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer', fontSize: 14, flexShrink: 0,
              }}>
                Guardar
              </button>
            </div>
            <div style={{ fontSize: 12, color: D.t3, marginTop: 6 }}>Se guarda para la semana actual (lunes a domingo).</div>
          </form>
        </Card>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: D.t0, marginBottom: 16 }}>🔒 Cambiar contraseña</h3>
          <form onSubmit={changePass}>
            {passErr && (
              <div style={{ background: D.naranjaBg, border: `1px solid ${D.naranja}40`, borderRadius: 8, padding: '9px 13px', fontSize: 13, color: D.naranja, marginBottom: 14 }}>
                ⚠️ {passErr}
              </div>
            )}
            {[
              { label: 'Contraseña actual', value: curPass, onChange: setCurPass, id: 'cp' },
              { label: 'Nueva contraseña (mín. 8 caracteres)', value: newPass, onChange: setNewPass, id: 'np' },
              { label: 'Confirmar nueva contraseña', value: newPass2, onChange: setNewPass2, id: 'np2' },
            ].map(f => (
              <div key={f.id} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, color: D.t2, marginBottom: 5, fontWeight: 500 }} htmlFor={f.id}>{f.label}</label>
                <input id={f.id} type="password" value={f.value} onChange={e => f.onChange(e.target.value)}
                  style={inp}
                  onFocus={e => e.target.style.borderColor = D.cian}
                  onBlur={e => e.target.style.borderColor = D.border2}
                />
              </div>
            ))}
            <button type="submit" style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: D.azul, color: '#003D7A', fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', fontSize: 14,
            }}>
              Actualizar contraseña
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

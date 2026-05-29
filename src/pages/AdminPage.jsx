import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { storage } from '../services/storage'
import { useToast } from '../context/ToastContext'
import { D } from '../styles/theme'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const ACTION_LABELS = {
  login: '🔑 Inicio de sesión', logout: '🚪 Cierre de sesión', register: '📝 Registro',
  complete_session: '✅ Sesión completada', incomplete_session: '⚠️ Sesión incompleta',
  create_event: '📅 Evento creado', update_event: '✏️ Evento editado', delete_event: '🗑️ Evento eliminado',
  set_goal: '🎯 Meta establecida', toggle_user: '⚙️ Usuario modificado',
}

const Card = ({ children, style }) => (
  <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, overflow: 'hidden', ...style }}>
    {children}
  </div>
)

export default function AdminPage({ user }) {
  const { addToast } = useToast()
  const [tab,         setTab]        = useState('users')
  const [users,       setUsers]      = useState([])
  const [audit,       setAudit]      = useState([])
  const [allSessions, setAllSessions]= useState([])
  const [auditMon,    setAuditMon]   = useState(new Date().getMonth())

  const load = async () => {
    const u = await storage.getUsers()
    setUsers(u)
    setAudit(storage.getAudit())
    const s = await storage.getAllSessions()
    setAllSessions(s)
  }
  useEffect(() => { load() }, [])

  const toggleUser = async u => {
    if (u.id === user.id) { addToast('No permitido', 'No puedes suspenderte a ti mismo.', 'error'); return }
    await storage.updateUser(u.id, { isActive: !u.isActive })
    storage.addAudit({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'toggle_user', entity: 'user', entityId: u.id, summary: `${!u.isActive ? 'Activado' : 'Suspendido'}: ${u.email}` })
    addToast(!u.isActive ? 'Usuario activado' : 'Usuario suspendido', u.email, !u.isActive ? 'success' : 'error')
    load()
  }

  const auditFiltered = audit.filter(a => new Date(a.timestamp).getMonth() === auditMon)

  return (
    <div className="app-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 22 }}>⚙️</span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: D.t0, margin: 0 }}>Administración</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '👥', label: 'Usuarios',       value: users.length,      bg: D.azulBg,    color: D.azul    },
          { icon: '✅', label: 'Sesiones totales', value: allSessions.length, bg: D.verdeBg,   color: D.verde   },
          { icon: '⏱️', label: 'Sesiones hoy',    value: allSessions.filter(s => new Date(s.startedAt).toDateString() === new Date().toDateString()).length, bg: D.cianBg, color: D.cian },
          { icon: '📋', label: 'Entradas audit',  value: audit.length,      bg: D.lavandaBg, color: D.lavanda },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.color}40`, borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: D.t0 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: D.t3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['users', '👥 Usuarios'], ['audit', '📋 Auditoría']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none', fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer', fontSize: 14,
            background: tab === t ? D.naranja : D.card2,
            color: tab === t ? '#8A3C10' : D.t2,
            transition: 'all .15s',
          }}>{l}</button>
        ))}
      </div>

      {/* Users */}
      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${D.border}`, fontWeight: 600, color: D.t0, fontSize: 15 }}>
              Todos los usuarios ({users.length})
            </div>
            {users.map((u, i) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                borderBottom: i < users.length - 1 ? `1px solid ${D.border}` : 'none',
                opacity: u.isActive === false ? 0.5 : 1,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: u.role === 'super_admin' ? D.naranjaBg : D.cianBg,
                  border: `1.5px solid ${u.role === 'super_admin' ? D.naranja : D.cian}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  color: u.role === 'super_admin' ? D.naranja : D.cian,
                }}>
                  {u.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: D.t0 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: D.t3 }}>{u.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: u.role === 'super_admin' ? D.naranjaBg : D.azulBg, color: u.role === 'super_admin' ? D.naranja : D.azul }}>
                    {u.role === 'super_admin' ? 'Admin' : 'Estudiante'}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: u.isActive !== false ? D.verdeBg : D.naranjaBg, color: u.isActive !== false ? D.verde : D.naranja }}>
                    {u.isActive !== false ? 'Activo' : 'Suspendido'}
                  </span>
                  {u.id !== user.id && u.role !== 'super_admin' && (
                    <button onClick={() => toggleUser(u)} style={{
                      padding: '5px 12px', borderRadius: 6, border: `1px solid ${u.isActive !== false ? 'rgba(251,113,133,0.3)' : D.verde+'40'}`,
                      background: u.isActive !== false ? 'rgba(251,113,133,0.1)' : D.verdeBg,
                      color: u.isActive !== false ? '#FB7185' : D.verde,
                      fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer', fontSize: 12,
                    }}>
                      {u.isActive !== false ? 'Suspender' : 'Activar'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      {/* Audit */}
      {tab === 'audit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: D.t2, fontWeight: 500 }}>Mes:</span>
            <select value={auditMon} onChange={e => setAuditMon(+e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${D.border2}`, background: D.card, color: D.t0, fontSize: 13, fontFamily: 'Inter' }}>
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <span style={{ fontSize: 12, color: D.t3 }}>{auditFiltered.length} entradas</span>
          </div>
          <Card>
            {auditFiltered.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: D.t3, fontSize: 14 }}>
                Sin entradas de auditoría en {MONTHS[auditMon]}.
              </div>
            ) : (
              <div style={{ maxHeight: 480, overflow: 'auto' }}>
                {[...auditFiltered].reverse().map((a) => (
                  <div key={a.id} style={{ padding: '10px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: D.t1, fontWeight: 500 }}>{ACTION_LABELS[a.action] || a.action}</div>
                      <div style={{ fontSize: 12, color: D.t2, marginTop: 2 }}>{a.summary}</div>
                      <div style={{ fontSize: 11, color: D.t3, marginTop: 1 }}>{a.userEmail}</div>
                    </div>
                    <div style={{ fontSize: 11, color: D.t3, flexShrink: 0 }}>
                      {new Date(a.timestamp).toLocaleString('es', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  )
}

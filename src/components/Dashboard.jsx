import { useState } from 'react'
import { motion } from 'framer-motion'

const STATS = [
  { label: 'Sesiones hoy',     value: '0',   unit: '',    icon: '⚡', color: 'var(--indigo-l)' },
  { label: 'Minutos enfocado', value: '0',   unit: 'min', icon: '🎯', color: 'var(--cyan)'     },
  { label: 'Racha actual',     value: '1',   unit: 'día', icon: '🔥', color: 'var(--amber)'    },
  { label: 'Meta semanal',     value: '0%',  unit: '',    icon: '📊', color: 'var(--emerald)'  },
]

const TASKS = [
  { id: 1, text: 'Revisar notas de Cálculo', done: false },
  { id: 2, text: 'Completar ejercicios de Álgebra', done: false },
  { id: 3, text: 'Leer capítulo 4 de Estadística', done: false },
]

const TIPS = [
  'Toma un descanso de 5 min cada 25 min de estudio.',
  'Hidratarte mejora tu concentración hasta un 20%.',
  'Estudiar en el mismo lugar refuerza el hábito.',
  'La técnica Pomodoro aumenta la productividad significativamente.',
  'Dormir bien consolida la memoria que formaste hoy.',
]

function Avatar({ name }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
      boxShadow: '0 0 16px rgba(99,102,241,0.4)',
    }}>
      {initials}
    </div>
  )
}

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState(TASKS)
  const [newTask, setNewTask] = useState('')
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)]
  const firstName = user.name.split(' ')[0]

  const toggleTask = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const addTask = e => {
    e.preventDefault()
    if (!newTask.trim()) return
    setTasks(prev => [...prev, { id: Date.now(), text: newTask.trim(), done: false }])
    setNewTask('')
  }
  const removeTask = id => setTasks(prev => prev.filter(t => t.id !== id))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top bar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,7,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 32px',
      }}>
        <div style={{
          maxWidth: 1180, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, var(--indigo-l), var(--cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              EquilibraStudy
            </span>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(99,102,241,0.15)', color: 'var(--indigo-l)',
              border: '1px solid rgba(99,102,241,0.3)', fontWeight: 500,
            }}>
              Dashboard
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right', display: 'none' }} className="user-info-desktop">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t0)' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{user.email}</div>
            </div>
            <Avatar name={user.name} />
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.25)',
                borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500,
                color: 'var(--rose)', cursor: 'pointer', fontFamily: 'Inter',
                transition: 'background .2s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(251,113,133,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(251,113,133,0.1)'}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 32px' }}>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 36 }}
        >
          <p style={{ fontSize: 14, color: 'var(--t3)', marginBottom: 4 }}>{greeting},</p>
          <h1 style={{
            fontSize: 'clamp(26px,4vw,40px)', fontWeight: 700,
            color: 'var(--t0)', letterSpacing: '-0.5px', marginBottom: 8,
          }}>
            {firstName} 👋
          </h1>
          <p style={{ fontSize: 15, color: 'var(--t2)' }}>
            Tu sesión está activa con <strong style={{ color: 'var(--indigo-l)' }}>{user.email}</strong>
          </p>
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 32,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>💡</span>
          <span style={{ fontSize: 14, color: 'var(--t2)' }}><strong style={{ color: 'var(--indigo-l)' }}>Tip del día:</strong> {tip}</span>
        </motion.div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.45 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${s.color}15`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--t0)', lineHeight: 1.1 }}>
                  {s.value}<span style={{ fontSize: 14, color: 'var(--t3)', marginLeft: 4 }}>{s.unit}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom grid: tasks + pomodoro info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
          gap: 20,
        }}>

          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '24px',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--t0)', marginBottom: 18 }}>
              Tareas pendientes
              <span style={{
                marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 99,
                background: 'rgba(99,102,241,0.15)', color: 'var(--indigo-l)',
              }}>
                {tasks.filter(t => !t.done).length}
              </span>
            </h3>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {tasks.map(t => (
                <li key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: t.done ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${t.done ? 'rgba(52,211,153,0.15)' : 'var(--border)'}`,
                  transition: 'all .2s',
                }}>
                  <button
                    onClick={() => toggleTask(t.id)}
                    style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${t.done ? 'var(--emerald)' : 'var(--border2)'}`,
                      background: t.done ? 'rgba(52,211,153,0.2)' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, transition: 'all .2s',
                    }}
                  >
                    {t.done && '✓'}
                  </button>
                  <span style={{
                    flex: 1, fontSize: 14, color: t.done ? 'var(--t3)' : 'var(--t1)',
                    textDecoration: t.done ? 'line-through' : 'none',
                  }}>
                    {t.text}
                  </span>
                  <button
                    onClick={() => removeTask(t.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--t3)', fontSize: 16, lineHeight: 1, padding: '0 2px',
                      transition: 'color .2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--rose)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--t3)'}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={addTask} style={{ display: 'flex', gap: 8 }}>
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Agregar tarea…"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10, fontSize: 14,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border2)',
                  color: 'var(--t0)', fontFamily: 'Inter', outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 16px', borderRadius: 10, fontSize: 13,
                  background: 'linear-gradient(135deg, var(--indigo), #4F46E5)',
                  color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 500,
                }}
              >
                +
              </button>
            </form>
          </motion.div>

          {/* Profile & info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.5 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '24px',
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--t2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mi perfil
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <Avatar name={user.name} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t0)' }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{user.email}</div>
                </div>
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)',
                fontSize: 13, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>✓</span> Correo institucional verificado
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.07))',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 16, padding: '24px', flex: 1,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>⏱️</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t0)', marginBottom: 8 }}>
                Pomodoro
              </h3>
              <p style={{ fontSize: 13, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.6 }}>
                El temporizador Pomodoro estará disponible en tu próxima sesión de estudio.
              </p>
              <div style={{
                display: 'inline-flex', padding: '8px 16px', borderRadius: 10,
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                fontSize: 12, color: 'var(--indigo-l)', fontWeight: 500,
              }}>
                Próximamente activo
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          main > div:last-child { grid-template-columns: 1fr !important; }
          .user-info-desktop { display: none !important; }
        }
      `}</style>
    </div>
  )
}

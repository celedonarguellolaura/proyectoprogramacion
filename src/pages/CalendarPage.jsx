import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { storage } from '../services/storage'
import { getUrgentEvents } from '../services/sessionService'
import { D } from '../styles/theme'

// Dark-compatible priority colors (accent on dark background)
const PRIORITY = {
  alta:  { label: 'Alta',  color: D.naranja, bg: D.naranjaBg },
  media: { label: 'Media', color: D.azul,    bg: D.azulBg    },
  baja:  { label: 'Baja',  color: D.verde,   bg: D.verdeBg   },
}

const MONTHS   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_SH  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const today    = new Date()

const inp = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: `1.5px solid ${D.border2}`, background: D.input,
  fontSize: 14, color: D.t0, fontFamily: 'Inter', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .2s',
}

function Modal({ children, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        style={{ background: D.bg2, border: `1px solid ${D.border2}`, borderRadius: 16, width: '100%', maxWidth: 460, boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}
        onClick={e => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  )
}

function EventForm({ event, onSave, onCancel, prefillDate }) {
  const [name,     setName]     = useState(event?.name || '')
  const [deadline, setDeadline] = useState(event?.deadline ? event.deadline.slice(0, 16) : (prefillDate || ''))
  const [priority, setPriority] = useState(event?.priority || 'media')
  const [notes,    setNotes]    = useState(event?.notes || '')
  const [err,      setErr]      = useState('')

  const submit = e => {
    e.preventDefault()
    if (!name.trim()) { setErr('El nombre es obligatorio.'); return }
    if (!deadline)    { setErr('La fecha límite es obligatoria.'); return }
    setErr('')
    onSave({ name: name.trim(), deadline: new Date(deadline).toISOString(), priority, notes: notes.trim() })
  }

  return (
    <form onSubmit={submit} style={{ padding: '24px' }}>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: D.t0, marginBottom: 18 }}>
        {event ? 'Editar evento' : 'Nuevo evento académico'}
      </h3>

      {err && (
        <div style={{ background: D.naranjaBg, border: `1px solid ${D.naranja}50`, borderRadius: 8, padding: '9px 13px', fontSize: 13, color: D.naranja, marginBottom: 14 }}>
          ⚠️ {err}
        </div>
      )}

      {[
        { label: 'Nombre del evento', value: name, onChange: setName, placeholder: 'Ej: Examen de Cálculo', type: 'text' },
        { label: 'Fecha y hora límite', value: deadline, onChange: setDeadline, placeholder: '', type: 'datetime-local' },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, color: D.t2, marginBottom: 5, fontWeight: 500 }}>{f.label}</label>
          <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
            style={inp}
            onFocus={e => e.target.style.borderColor = D.azul}
            onBlur={e => e.target.style.borderColor = D.border2}
          />
        </div>
      ))}

      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, color: D.t2, marginBottom: 8, fontWeight: 500 }}>Prioridad</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(PRIORITY).map(([k, p]) => (
            <button type="button" key={k} onClick={() => setPriority(k)} style={{
              flex: 1, padding: '10px 4px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, fontWeight: 600,
              border: `2px solid ${priority === k ? p.color : D.border2}`,
              background: priority === k ? p.bg : D.card2,
              color: priority === k ? p.color : D.t3,
              transition: 'all .15s',
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 13, color: D.t2, marginBottom: 5, fontWeight: 500 }}>Notas (opcional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          style={{ ...inp, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = D.azul}
          onBlur={e => e.target.style.borderColor = D.border2}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} style={{
          flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${D.border2}`,
          background: 'transparent', color: D.t2, fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer',
        }}>
          Cancelar
        </button>
        <button type="submit" style={{
          flex: 2, padding: '11px', borderRadius: 10, border: 'none',
          background: D.azul, color: '#003D7A', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer', fontSize: 14,
        }}>
          {event ? 'Guardar cambios' : 'Crear evento'} →
        </button>
      </div>
    </form>
  )
}

export default function CalendarPage({ user }) {
  const [events,   setEvents]   = useState([])
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth())
  const [modal,    setModal]    = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = () => setEvents(storage.getEvents(user.id))
  useEffect(load, [user.id])

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))
  while (cells.length % 7 !== 0) cells.push(null)

  const eventsForDay = day => events.filter(e => {
    const d = new Date(e.deadline)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
  })

  const urgent = getUrgentEvents(events)

  const handleSave = data => {
    if (modal?.type === 'edit') {
      storage.saveEvent({ ...modal.event, ...data })
      storage.addAudit({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'update_event', entity: 'event', entityId: modal.event.id, summary: `Evento actualizado: ${data.name}` })
    } else {
      const ev = { id: `ev_${Date.now()}`, userId: user.id, isActive: true, createdAt: new Date().toISOString(), ...data }
      storage.saveEvent(ev)
      storage.addAudit({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'create_event', entity: 'event', entityId: ev.id, summary: `Evento creado: ${data.name}` })
    }
    setModal(null); load()
  }

  const handleDelete = ev => {
    storage.deleteEvent(ev.id)
    storage.addAudit({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'delete_event', entity: 'event', entityId: ev.id, summary: `Evento eliminado: ${ev.name}` })
    setDeleting(null); setModal(null); load()
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📅</span>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: D.t0, margin: 0 }}>Calendario Académico</h1>
        </div>
        <button onClick={() => setModal({ type: 'new' })} style={{
          padding: '10px 20px', borderRadius: 10, border: 'none',
          background: D.azul, color: '#003D7A', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer', fontSize: 14,
        }}>
          + Agregar evento
        </button>
      </div>

      {/* Urgent banner */}
      {urgent.length > 0 && (
        <div style={{ background: D.naranjaBg, border: `1.5px solid ${D.naranja}60`, borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: D.naranja, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔥 Eventos urgentes — menos de 48 horas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {urgent.map(e => (
              <div key={e.id}
                onClick={() => setModal({ type: 'view', event: e })}
                style={{ background: D.bg3, border: `1px solid ${D.naranja}60`, borderRadius: 8, padding: '6px 12px', fontSize: 13, color: D.naranja, cursor: 'pointer', fontWeight: 500 }}>
                {e.name} — {new Date(e.deadline).toLocaleString('es', { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${D.border}` }}>
          <button onClick={prevMonth} style={{ background: D.card2, border: `1px solid ${D.border2}`, borderRadius: 8, width: 34, height: 34, fontSize: 18, cursor: 'pointer', color: D.t1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <span style={{ fontWeight: 700, color: D.t0, fontSize: 16 }}>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={{ background: D.card2, border: `1px solid ${D.border2}`, borderRadius: 8, width: 34, height: 34, fontSize: 18, cursor: 'pointer', color: D.t1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: `1px solid ${D.border}` }}>
          {DAYS_SH.map(d => (
            <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 11, color: D.t3, fontWeight: 600, letterSpacing: '0.03em' }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {cells.map((day, i) => {
            if (!day) return (
              <div key={i} style={{ minHeight: 80, background: D.bg3, borderRight: (i + 1) % 7 !== 0 ? `1px solid ${D.border}` : 'none', borderBottom: `1px solid ${D.border}` }} />
            )
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const dayEvents = eventsForDay(day)
            return (
              <div key={i}
                onClick={() => setModal({ type: 'new', date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00` })}
                style={{
                  minHeight: 80, padding: '6px', cursor: 'pointer',
                  borderRight: (i + 1) % 7 !== 0 ? `1px solid ${D.border}` : 'none',
                  borderBottom: `1px solid ${D.border}`,
                  background: isToday ? D.cianBg : D.card,
                  transition: 'background .15s',
                }}
                onMouseOver={e => e.currentTarget.style.background = isToday ? D.cianDark : D.card2}
                onMouseOut={e => e.currentTarget.style.background = isToday ? D.cianBg : D.card}
              >
                <div style={{
                  fontSize: 13, fontWeight: isToday ? 700 : 400,
                  width: 26, height: 26, borderRadius: '50%',
                  background: isToday ? D.cian : 'transparent',
                  color: isToday ? '#003D4D' : D.t2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 3,
                }}>
                  {day}
                </div>
                {dayEvents.slice(0, 3).map(ev => {
                  const p = PRIORITY[ev.priority]
                  const isUrgent = urgent.some(u => u.id === ev.id)
                  return (
                    <div key={ev.id}
                      onClick={e => { e.stopPropagation(); setModal({ type: 'view', event: ev }) }}
                      style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4, marginBottom: 2,
                        background: isUrgent ? D.naranjaBg : p.bg,
                        color: isUrgent ? D.naranja : p.color,
                        border: `1px solid ${isUrgent ? D.naranja : p.color}40`,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600,
                      }}>
                      {isUrgent ? '🔥 ' : ''}{ev.name}
                    </div>
                  )
                })}
                {dayEvents.length > 3 && <div style={{ fontSize: 9, color: D.t3 }}>+{dayEvents.length - 3} más</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event list */}
      {events.length === 0 ? (
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '44px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
          <div style={{ fontWeight: 600, color: D.t0, marginBottom: 6 }}>Sin eventos registrados</div>
          <div style={{ color: D.t2, fontSize: 14, marginBottom: 18 }}>
            Agrega tu primer examen para que el Pomodoro te sugiera sesiones inteligentes.
          </div>
          <button onClick={() => setModal({ type: 'new' })} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: D.azul, color: '#003D7A', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer',
          }}>
            Agregar evento
          </button>
        </div>
      ) : (
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${D.border}`, fontWeight: 600, color: D.t0, fontSize: 15 }}>
            Todos los eventos ({events.length})
          </div>
          {events.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).map((ev, i) => {
            const p = PRIORITY[ev.priority]
            const isUrgent = urgent.some(u => u.id === ev.id)
            const isPast = new Date(ev.deadline) < new Date()
            return (
              <div key={ev.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                borderBottom: i < events.length - 1 ? `1px solid ${D.border}` : 'none',
                opacity: isPast ? 0.5 : 1,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: isUrgent ? D.naranja : p.color, flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, color: D.t0, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {ev.name}
                    {isUrgent && <span style={{ fontSize: 10, background: D.naranjaBg, color: D.naranja, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>URGENTE</span>}
                    {isPast && <span style={{ fontSize: 10, background: D.card2, color: D.t3, padding: '1px 6px', borderRadius: 4 }}>Pasado</span>}
                  </div>
                  <div style={{ fontSize: 12, color: D.t3, marginTop: 2 }}>
                    {new Date(ev.deadline).toLocaleString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: p.bg, color: p.color, flexShrink: 0 }}>
                  {p.label}
                </span>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setModal({ type: 'edit', event: ev })} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${D.border2}`, background: D.card2, color: D.t1, cursor: 'pointer', fontSize: 12 }}>✏️</button>
                  <button onClick={() => setDeleting(ev)} style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)', color: '#FB7185', cursor: 'pointer', fontSize: 12 }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(modal?.type === 'new' || modal?.type === 'edit') && (
          <Modal onClose={() => setModal(null)}>
            <EventForm event={modal.event} prefillDate={modal.date} onSave={handleSave} onCancel={() => setModal(null)} />
          </Modal>
        )}

        {modal?.type === 'view' && (
          <Modal onClose={() => setModal(null)}>
            <div style={{ padding: '24px' }}>
              {(() => {
                const ev = modal.event, p = PRIORITY[ev.priority], isU = urgent.some(u => u.id === ev.id)
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: D.t0, margin: 0, flex: 1 }}>{ev.name}</h3>
                      <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: D.t3, marginLeft: 8 }}>×</button>
                    </div>
                    {isU && (
                      <div style={{ background: D.naranjaBg, border: `1px solid ${D.naranja}50`, borderRadius: 8, padding: '9px 13px', fontSize: 13, color: D.naranja, marginBottom: 14, fontWeight: 500 }}>
                        🔥 ¡Evento urgente — menos de 48 horas!
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 11, color: D.t3, marginBottom: 3 }}>Fecha límite</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: D.t0 }}>
                          {new Date(ev.deadline).toLocaleString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: D.t3, marginBottom: 4 }}>Prioridad</div>
                        <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: p.bg, color: p.color }}>{p.label}</span>
                      </div>
                      {ev.notes && (
                        <div>
                          <div style={{ fontSize: 11, color: D.t3, marginBottom: 3 }}>Notas</div>
                          <div style={{ fontSize: 14, color: D.t1 }}>{ev.notes}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setDeleting(ev)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(251,113,133,0.3)', background: 'rgba(251,113,133,0.08)', color: '#FB7185', fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer' }}>
                        Eliminar
                      </button>
                      <button onClick={() => setModal({ type: 'edit', event: ev })} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: D.azul, color: '#003D7A', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer' }}>
                        ✏️ Editar
                      </button>
                    </div>
                  </>
                )
              })()}
            </div>
          </Modal>
        )}

        {deleting && (
          <Modal onClose={() => setDeleting(null)}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
              <h3 style={{ fontWeight: 700, color: D.t0, marginBottom: 8 }}>¿Eliminar evento?</h3>
              <p style={{ color: D.t2, fontSize: 14, marginBottom: 24 }}>
                ¿Eliminar <strong style={{ color: D.t0 }}>"{deleting.name}"</strong>?<br />Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1.5px solid ${D.border2}`, background: 'transparent', color: D.t2, fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={() => handleDelete(deleting)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#CC3333', color: '#fff', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer' }}>
                  Eliminar
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

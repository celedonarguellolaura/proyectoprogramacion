import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { storage } from '../services/storage'
import { getMonday, buildDailyStats, buildWeeklyStats, buildMonthlyStats, getWeeklyProgress } from '../services/sessionService'
import { D } from '../styles/theme'

const FATIGUE_ICONS = ['', '😴', '😪', '😐', '😊', '⚡']

// Simple bar chart using divs
function BarChart({ data, xKey, bars, height = 160 }) {
  const maxVal = Math.max(...data.flatMap(d => bars.map(b => d[b.key] || 0)), 0.1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: height + 24, paddingBottom: 24, position: 'relative' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', width: '100%' }}>
            {bars.map(b => (
              <div key={b.key} style={{
                flex: 1, height: `${Math.max((d[b.key] / maxVal) * height, d[b.key] > 0 ? 4 : 0)}px`,
                background: b.color, borderRadius: '3px 3px 0 0', transition: 'height .5s',
                title: `${d[b.key]} ${b.unit || ''}`,
              }} />
            ))}
          </div>
          {d[xKey] !== undefined && (
            <div style={{ fontSize: 9, color: D.t3, marginTop: 4, textAlign: 'center', lineHeight: 1.2 }}>
              {String(d[xKey]).replace('h', '')}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function LineChart({ data, xKey, yKey, color = '#9B59F5', height = 160 }) {
  if (data.length < 2) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: D.t3, fontSize: 13 }}>Sin datos suficientes</div>
  const maxVal = Math.max(...data.map(d => d[yKey] || 0), 0.1)
  const W = 600, H = height, PAD = { t: 10, r: 10, b: 24, l: 30 }
  const cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b
  const points = data.map((d, i) => ({
    x: PAD.l + (i / (data.length - 1)) * cw,
    y: PAD.t + (1 - (d[yKey] || 0) / maxVal) * ch,
    val: d[yKey] || 0,
  }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${path} L ${points[points.length - 1].x} ${PAD.t + ch} L ${points[0].x} ${PAD.t + ch} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`grad-${yKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${yKey})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} />
          {p.val > 0 && <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={9} fill={color}>{p.val.toFixed(1)}</text>}
          <text x={p.x} y={PAD.t + ch + 14} textAnchor="middle" fontSize={9} fill="#888">
            {data[i][xKey]}
          </text>
        </g>
      ))}
    </svg>
  )
}

function StatCard({ icon, label, value, bg, color }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${color}40`, borderRadius: 12, padding: '16px' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: D.t0, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: D.t3, marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function AnalyticsPage({ user }) {
  const [view, setView]         = useState('weekly')
  const [sessions, setSessions] = useState([])
  const [goal, setGoal]         = useState(null)
  const [selectedDate, setDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedWeek, setWeek] = useState(getMonday())
  const [selYear, setSelYear]   = useState(new Date().getFullYear())
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const s = storage.getSessions(user.id)
    setSessions(s)
    const g = storage.getGoal(user.id, getMonday())
    setGoal(g)
  }, [user.id])

  const userSessions = sessions.filter(s => s.userId === user.id)
  const completed = userSessions.filter(s => s.status === 'completada')
  const incomplete = userSessions.filter(s => s.status === 'incompleta')
  const totalHours = +(completed.reduce((a, s) => a + s.effectiveMinutes, 0) / 60).toFixed(1)
  const avgFatigue = completed.filter(s => s.fatigueLevel).length
    ? (completed.filter(s => s.fatigueLevel).reduce((a, s) => a + s.fatigueLevel, 0) / completed.filter(s => s.fatigueLevel).length).toFixed(1)
    : null
  const weekStart = getMonday()
  const progress = getWeeklyProgress(userSessions, user.id, weekStart, goal?.goalHours)

  const dailyData = buildDailyStats(userSessions, selectedDate).filter(h => h.completed > 0 || h.incomplete > 0)
  const weeklyData = buildWeeklyStats(userSessions, selectedWeek)
  const monthlyData = buildMonthlyStats(userSessions, selYear, selMonth).filter(d => d.completed > 0 || d.incomplete > 0)

  const exportPDF = () => {
    const monthSessions = userSessions.filter(s => {
      const d = new Date(s.startedAt)
      return d.getFullYear() === selYear && d.getMonth() + 1 === selMonth
    })
    if (!monthSessions.length) { alert('No hay sesiones en este período.'); return }
    const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    const rows = monthSessions.map(s => `
      <tr>
        <td>${new Date(s.startedAt).toLocaleDateString('es')}</td>
        <td>${new Date(s.startedAt).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})}</td>
        <td>${s.workDurationMin} min</td>
        <td style="color:${s.status==='completada'?'#074D22':'#8A3C10'};font-weight:600">${s.status}</td>
        <td>${s.fatigueLevel ? FATIGUE_ICONS[s.fatigueLevel]+' '+s.fatigueLevel+'/5' : '—'}</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte EquilibraStudy</title>
    <style>body{font-family:Inter,Arial,sans-serif;padding:32px;color:#1A1A1A;max-width:800px;margin:0 auto}
    h1{color:#003D4D;margin-bottom:4px}h2{color:#555;font-size:14px;margin-bottom:24px;font-weight:400}
    table{width:100%;border-collapse:collapse;margin:16px 0}
    th{background:#00C8F5;color:#003D4D;padding:10px;text-align:left;font-size:13px}
    td{padding:9px 10px;border-bottom:1px solid #eee;font-size:13px}
    .stat{display:inline-block;margin:8px 16px 8px 0;padding:10px 16px;background:#f7f7f7;border-radius:8px}
    .stat strong{display:block;font-size:20px}footer{margin-top:32px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:12px}</style>
    </head><body>
    <h1>EquilibraStudy — Reporte Mensual</h1>
    <h2>${MONTHS[selMonth-1]} ${selYear} · ${user.name} · ${user.email}</h2>
    <div>
      <div class="stat"><strong>${totalHours}h</strong>Horas efectivas</div>
      <div class="stat"><strong>${completed.length}</strong>Sesiones completadas</div>
      <div class="stat"><strong>${incomplete.length}</strong>Sesiones incompletas</div>
      ${avgFatigue ? `<div class="stat"><strong>${FATIGUE_ICONS[Math.round(avgFatigue)]} ${avgFatigue}/5</strong>Fatiga promedio</div>` : ''}
    </div>
    <table><thead><tr><th>Fecha</th><th>Hora</th><th>Duración</th><th>Estado</th><th>Fatiga</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <footer>Generado por EquilibraStudy · ${new Date().toLocaleDateString('es')} · Usa Ctrl+P para guardar como PDF</footer>
    </body></html>`
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 400)
  }

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: D.t0, margin: 0 }}>Analytics</h1>
      </div>

      {/* Goal progress */}
      <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 600, color: D.t0, fontSize: 15 }}>Meta semanal</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#6B5A00', background: '#FFFCC2', border: '1px solid #F5D800', borderRadius: 8, padding: '3px 12px' }}>
            {progress.percentage}%
          </span>
        </div>
        <div style={{ height: 10, background: D.card2, borderRadius: 99, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress.percentage}%` }} transition={{ duration: 0.8 }}
            style={{ height: '100%', background: '#F5D800', borderRadius: 99 }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: D.t3 }}>
          {progress.accumulated.toFixed(1)}h de {progress.goal ? `${progress.goal}h` : 'sin meta'} esta semana
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard icon="⏱️" label="Horas totales efectivas" value={`${totalHours}h`} bg="#D6F5FF" color="#00C8F5" />
        <StatCard icon="✅" label="Sesiones completadas" value={completed.length} bg="#D6FFE9" color="#33D17A" />
        <StatCard icon="⚠️" label="Sesiones incompletas" value={incomplete.length} bg="#FFE9D6" color="#FF8040" />
        <StatCard icon="😊" label="Fatiga promedio" value={avgFatigue ? `${FATIGUE_ICONS[Math.round(avgFatigue)]} ${avgFatigue}/5` : '—'} bg="#FFD6EE" color="#F060A8" />
      </div>

      {/* View selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {['daily', 'weekly', 'monthly'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', fontFamily: 'Inter', fontWeight: 500, cursor: 'pointer', fontSize: 14,
            background: view === v ? '#9B59F5' : '#F0F0F0', color: view === v ? '#2D0075' : '#555', transition: 'all .15s',
          }}>
            {v === 'daily' ? 'Día' : v === 'weekly' ? 'Semana' : 'Mes'}
          </button>
        ))}

        {view === 'daily' && (
          <input type="date" value={selectedDate} onChange={e => setDate(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E5E5E5', fontSize: 13, fontFamily: 'Inter', color: D.t0 }} />
        )}
        {view === 'weekly' && (
          <input type="date" value={selectedWeek} onChange={e => setWeek(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1.5px solid #E5E5E5', fontSize: 13, fontFamily: 'Inter', color: D.t0 }} />
        )}
        {view === 'monthly' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <select value={selMonth} onChange={e => setSelMonth(+e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #E5E5E5', fontSize: 13, fontFamily: 'Inter' }}>
              {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <input type="number" value={selYear} onChange={e => setSelYear(+e.target.value)} min={2024} max={2030}
              style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #E5E5E5', fontSize: 13, width: 72, fontFamily: 'Inter' }} />
          </div>
        )}

        {view === 'monthly' && (
          <button onClick={exportPDF} style={{
            marginLeft: 'auto', padding: '8px 18px', borderRadius: 8, border: 'none',
            background: '#F5D800', color: '#6B5A00', fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', fontSize: 13,
          }}>
            📄 Exportar PDF
          </button>
        )}
      </div>

      {/* Chart */}
      <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: D.t3 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, background: '#00C8F5', borderRadius: 2 }} />Completada (min)</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, background: '#FFD6D6', borderRadius: 2 }} />Incompleta (min)</span>
        </div>

        {view === 'daily' && (
          dailyData.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: D.t3, fontSize: 14 }}>Sin sesiones este día.<br /><span style={{ fontSize: 12 }}>Completa tu primer Pomodoro para ver estadísticas aquí.</span></div>
            : <BarChart data={dailyData} xKey="hour" bars={[{ key: 'completed', color: '#00C8F5' }, { key: 'incomplete', color: '#FFD6D6' }]} height={160} />
        )}
        {view === 'weekly' && (
          weeklyData.every(d => d.completed === 0 && d.incomplete === 0)
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: D.t3, fontSize: 14 }}>Sin sesiones esta semana.</div>
            : <BarChart data={weeklyData} xKey="day" bars={[{ key: 'completed', color: '#00C8F5' }, { key: 'incomplete', color: '#FFD6D6' }]} height={160} />
        )}
        {view === 'monthly' && (
          monthlyData.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px 0', color: D.t3, fontSize: 14 }}>Sin sesiones este mes.</div>
            : <BarChart data={monthlyData} xKey="day" bars={[{ key: 'completed', color: '#9B59F5' }, { key: 'incomplete', color: '#EDE0FF' }]} height={160} />
        )}
      </div>

      {/* Session history */}
      {userSessions.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>📈</div>
          <div style={{ fontWeight: 600, color: D.t0, marginBottom: 6 }}>Aquí aparecerán tus estadísticas</div>
          <div style={{ color: D.t3, fontSize: 14 }}>Completa tu primer Pomodoro para ver tus datos aquí.</div>
        </div>
      ) : (
        <div style={{ background: D.card, border: `1px solid ${D.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E5E5', fontWeight: 600, color: D.t0, fontSize: 15 }}>
            Historial de sesiones
          </div>
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            {[...userSessions].reverse().map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px',
                borderBottom: `1px solid ${D.border}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s.status === 'completada' ? '#33D17A' : '#FF8040' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: D.t0 }}>
                    {s.workDurationMin} min trabajo · {s.status}
                    {s.wasSuggested && <span style={{ marginLeft: 6, fontSize: 10, background: '#FFE9D6', color: '#FF8040', padding: '1px 5px', borderRadius: 4 }}>inteligente</span>}
                  </div>
                  <div style={{ fontSize: 11, color: D.t3 }}>{new Date(s.startedAt).toLocaleString('es')}</div>
                </div>
                <div style={{ fontSize: 12, color: D.t3, textAlign: 'right' }}>
                  {s.effectiveMinutes > 0 && <div style={{ color: '#33D17A', fontWeight: 600 }}>+{s.effectiveMinutes}min</div>}
                  {s.fatigueLevel && <div>{FATIGUE_ICONS[s.fatigueLevel]} {s.fatigueLevel}/5</div>}
                  {s.pauseCountOver1min > 0 && <div style={{ color: '#FF8040' }}>{s.pauseCountOver1min} pausas</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

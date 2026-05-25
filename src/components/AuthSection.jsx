import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../context/ToastContext'
import { storage } from '../services/storage'
import { sendVerificationEmail } from '../services/emailService'

const isEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase().trim())

const perks = [
  { icon: '⚡', text: 'Pomodoro adaptativo según tu calendario de exámenes', color: 'var(--indigo-l)' },
  { icon: '🎯', text: 'Metas semanales con progreso en tiempo real',          color: 'var(--cyan)'     },
  { icon: '📊', text: 'Analytics: día, semana y mes con gráficas',            color: 'var(--violet)'   },
  { icon: '🛡', text: 'Privacidad total — datos cifrados y privados',          color: 'var(--emerald)'  },
  { icon: '📄', text: 'Reporte PDF mensual para tu tutor',                    color: 'var(--amber)'    },
  { icon: '😴', text: 'Sistema de bienestar cognitivo basado en fatiga',       color: 'var(--pink)'     },
]

function getStrength(pw) {
  let s = 0
  if (pw.length >= 8) s++; if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++
  const labels = ['', 'Muy débil', 'Débil', 'Regular', 'Buena', 'Excelente']
  const colors = ['', '#FB7185', '#FB7185', '#FBBF24', '#22D3EE', '#34D399']
  const widths = ['0%', '20%', '40%', '60%', '80%', '100%']
  return { label: labels[s], color: colors[s], width: widths[s] }
}

function Field({ label, id, type = 'text', placeholder, value, onChange, hint, err, ok }) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className={`field-input${err ? ' err' : ok ? ' ok' : ''}`}
        autoComplete={type === 'password' ? 'new-password' : 'off'} />
      {hint && !err && !ok && <div className="field-hint">{hint}</div>}
      {err && <div className="field-err show">{err}</div>}
      {ok  && <div className="field-ok  show">{ok}</div>}
    </div>
  )
}

/* ── OTP input boxes ──────────────────────────── */
function OTPInput({ value, onChange, hasError }) {
  const refs = useRef([])
  const digits = value.split('')

  const handleChange = (i, v) => {
    const d = v.replace(/\D/, '').slice(-1)
    const next = [...digits]; next[i] = d
    onChange(next.join(''))
    if (d && i < 5) refs.current[i + 1]?.focus()
  }
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const handlePaste = e => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(p); e.preventDefault()
    refs.current[Math.min(p.length, 5)]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 4 }}>
      {[0,1,2,3,4,5].map(i => (
        <input
          key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 700,
<<<<<<< HEAD
            border: `2px solid ${hasError ? '#FB7185' : (digits[i] ? 'var(--indigo-l)' : 'var(--border2)')}`,
            borderRadius: 12,
            background: hasError ? 'rgba(251,113,133,0.07)' : (digits[i] ? 'rgba(77,166,255,0.08)' : 'var(--surface)'),
=======
            border: `2px solid ${hasError ? '#FB7185' : (digits[i] ? 'var(--azul)' : 'var(--border2)')}`,
            borderRadius: 12,
            background: hasError ? 'rgba(251,113,133,0.08)' : (digits[i] ? 'rgba(0,200,245,0.1)' : 'var(--surface)'),
>>>>>>> 66dff1b720499475d68b843dfeb615b0e430e995
            color: 'var(--t0)', fontFamily: 'Inter', outline: 'none',
            transition: 'all .15s', cursor: 'text',
            boxShadow: digits[i] && !hasError ? '0 0 0 3px rgba(77,166,255,0.15)' : 'none',
          }}
        />
      ))}
    </div>
  )
}

/* ── Email Verification screen ──────────────── */
function EmailVerification({ email, userName, pendingUser, onVerified, onBack }) {
  const [code,      setCode]      = useState('')
  const [inputCode, setInputCode] = useState('')
  const [hasError,  setHasError]  = useState(false)
  const [attempts,  setAttempts]  = useState(0)
  const [countdown, setCountdown] = useState(300)
  const [resent,    setResent]    = useState(false)
  const [sending,   setSending]   = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { addToast } = useToast()

  const generate = useCallback(() => String(Math.floor(100000 + Math.random() * 900000)), [])

  useEffect(() => {
    const c = generate()
    setCode(c)
    setSending(true)
    sendVerificationEmail(email, userName, c).then(res => {
      setSending(false)
      if (res.ok) {
        setEmailSent(true)
        addToast('Correo enviado', `Revisa la bandeja de entrada de ${email}.`, 'success')
      } else if (res.demo) {
        setEmailSent(false)
      } else {
        addToast('Error al enviar', 'No se pudo enviar el correo. Usa el código de abajo.', 'error')
      }
    })
  }, [email, userName, generate])

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return
    const id = setInterval(() => setCountdown(p => Math.max(0, p - 1)), 1000)
    return () => clearInterval(id)
  }, [countdown])

  const fmtCountdown = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleResend = () => {
    const c = generate()
    setCode(c); setInputCode(''); setHasError(false); setCountdown(300); setResent(true)
    setSending(true)
    sendVerificationEmail(email, userName, c).then(res => {
      setSending(false)
      if (res.ok) {
        setEmailSent(true)
        addToast('Código reenviado', `Revisa la bandeja de ${email}.`, 'success')
      } else {
        addToast('Código reenviado', 'El código de abajo es el nuevo.', 'info')
      }
    })
    setTimeout(() => setResent(false), 3000)
  }

  const verify = () => {
    if (inputCode.length < 6) return
    if (inputCode === code) {
      setHasError(false)
      // Save user
      storage.addUser(pendingUser)
      storage.addAudit({ userId: pendingUser.id, userEmail: pendingUser.email, userRole: pendingUser.role, action: 'register', entity: 'user', summary: `Registro verificado: ${pendingUser.name}` })
      addToast(`¡Bienvenida, ${userName}!`, 'Correo verificado. Tu cuenta está activa.', 'success')
      onVerified(pendingUser)
    } else {
      setHasError(true); setAttempts(a => a + 1); setInputCode('')
      if (attempts + 1 >= 3) {
        addToast('Demasiados intentos', 'Solicita un nuevo código.', 'error')
        setInputCode(''); setHasError(false)
      } else {
        addToast('Código incorrecto', `${3 - attempts - 1} intentos restantes.`, 'error')
      }
    }
  }

  // Auto-verify on 6 digits
  useEffect(() => { if (inputCode.length === 6) verify() }, [inputCode])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ textAlign: 'center', padding: '8px 4px' }}
    >
      {/* Animated envelope */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        style={{ fontSize: 52, marginBottom: 16, display: 'block' }}
      >
        ✉️
      </motion.div>

      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t0)', marginBottom: 8 }}>
        Verifica tu correo
      </h3>
      <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 6, lineHeight: 1.6 }}>
        Enviamos un código de 6 dígitos a
      </p>
      <div style={{
        display: 'inline-block', padding: '5px 14px', borderRadius: 8, marginBottom: 22,
        background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.3)',
        fontSize: 14, fontWeight: 600, color: 'var(--indigo-l)',
      }}>
        {email}
      </div>

      <OTPInput value={inputCode} onChange={setInputCode} hasError={hasError} />

      {hasError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ color: '#FB7185', fontSize: 12, marginBottom: 12 }}>
          Código incorrecto. Inténtalo de nuevo.
        </motion.div>
      )}

      {/* Countdown */}
      <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 10, marginBottom: 18 }}>
        {countdown > 0
          ? <>Caduca en <span style={{ color: countdown < 60 ? '#FB7185' : 'var(--t2)', fontWeight: 600 }}>{fmtCountdown(countdown)}</span></>
          : <span style={{ color: '#FB7185' }}>El código expiró.</span>
        }
      </div>

      {/* Estado del envío / código de respaldo */}
      {sending ? (
        <div style={{ textAlign: 'center', marginBottom: 18, color: 'var(--t3)', fontSize: 13 }}>
          <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            Enviando correo…
          </motion.span>
        </div>
      ) : emailSent ? (
        <div style={{
<<<<<<< HEAD
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,200,245,0.06)', border: '1px solid rgba(0,200,245,0.2)',
          borderRadius: 8, padding: '10px 14px',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700, color: 'var(--cian)', letterSpacing: '0.2em' }}>
            {code}
          </span>
          <button
            onClick={() => { navigator.clipboard?.writeText(code); addToast('Copiado', 'Código copiado al portapapeles.', 'success') }}
            style={{ background: 'rgba(0,200,245,0.15)', border: '1px solid rgba(0,200,245,0.3)', borderRadius: 6, padding: '5px 10px', color: 'var(--cian)', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter', fontWeight: 600 }}>
            Copiar
          </button>
=======
          background: 'rgba(51,209,122,0.08)', border: '1px solid rgba(51,209,122,0.3)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 18, textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: 'var(--verde)', fontWeight: 600 }}>
            ✉️ Correo enviado a {email}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>
            Revisa tu bandeja de entrada (y la carpeta de spam por si acaso)
          </div>
>>>>>>> 66dff1b720499475d68b843dfeb615b0e430e995
        </div>
      ) : (
        <div style={{
          background: 'rgba(0,200,245,0.07)', border: '1px solid rgba(0,200,245,0.3)',
          borderRadius: 12, padding: '14px 16px', marginBottom: 18, textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, color: 'var(--cian)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            💡 Modo demo — configura EmailJS para envío real
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 8 }}>
            Tu código de verificación (úsalo para completar el registro):
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700, color: 'var(--azul)', letterSpacing: '0.2em' }}>
              {code}
            </span>
            <button
              onClick={() => { navigator.clipboard?.writeText(code); addToast('Copiado', 'Código copiado al portapapeles.', 'success') }}
              style={{ background: 'rgba(0,200,245,0.15)', border: 'none', borderRadius: 6, padding: '5px 10px', color: 'var(--cian)', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter' }}>
              Copiar
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{
          flex: 1, padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent', color: 'var(--t2)', fontFamily: 'Inter', fontSize: 13, cursor: 'pointer',
        }}>
          ← Volver
        </button>
        <button onClick={handleResend} disabled={resent} style={{
          flex: 2, padding: '11px', borderRadius: 10, border: 'none',
          background: resent ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, var(--indigo), #4F46E5)',
          color: resent ? 'var(--t3)' : '#fff', fontFamily: 'Inter', fontWeight: 600, cursor: resent ? 'default' : 'pointer', fontSize: 13,
        }}>
          {resent ? '✓ Código reenviado' : '↻ Reenviar código'}
        </button>
      </div>
    </motion.div>
  )
}

/* ── register panel ──────────────────────── */
function RegisterPanel({ onSwitch, onLogin }) {
  const { addToast } = useToast()
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [pass,        setPass]        = useState('')
  const [pass2,       setPass2]       = useState('')
  const [errors,      setErrors]      = useState({})
  const [screen,      setScreen]      = useState('form') // 'form' | 'verify' | 'success'
  const [pendingUser, setPendingUser] = useState(null)

  const str = getStrength(pass)

  const validate = () => {
    const e = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Ingresa tu nombre completo.'
    if (!isEmail(email)) e.email = 'Ingresa un correo electrónico válido.'
    if (isEmail(email) && storage.findUser(email)) e.email = 'Este correo ya está registrado.'
    if (pass.length < 8) e.pass = 'La contraseña debe tener al menos 8 caracteres.'
    if (pass !== pass2) e.pass2 = 'Las contraseñas no coinciden.'
    return e
  }

  const submit = e => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      addToast('Revisa el formulario', 'Hay campos que necesitan corrección.', 'error')
      return
    }
    const user = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      pass,
      role: 'estudiante',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    }
    setPendingUser(user)
    setScreen('verify')
  }

  const handleVerified = user => {
    setScreen('success')
    setPendingUser(user)
  }

  if (screen === 'verify') {
    return (
      <AnimatePresence mode="wait">
        <EmailVerification
          key="verify"
          email={email.toLowerCase().trim()}
          userName={name.trim()}
          pendingUser={pendingUser}
          onVerified={handleVerified}
          onBack={() => setScreen('form')}
        />
      </AnimatePresence>
    )
  }

  if (screen === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '32px 16px', position: 'relative' }}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          style={{
            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 24px',
            background: 'rgba(52,211,153,0.12)', border: '2px solid rgba(52,211,153,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
            boxShadow: '0 0 40px rgba(52,211,153,0.3)',
          }}>
          🎉
        </motion.div>
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            initial={{ y: 0, x: (i - 3.5) * 22, opacity: 1 }}
            animate={{ y: -70, opacity: 0 }}
            transition={{ delay: i * 0.07, duration: 0.7 }}
            style={{ position: 'absolute', fontSize: 16, left: `${15 + i * 9}%`, bottom: '55%' }}>
            {['⭐','✨','🎊','💫','🌟','🎉','🎈','✨'][i]}
          </motion.div>
        ))}
        <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--t0)', marginBottom: 8 }}>
          ¡Correo verificado!
        </h3>
        <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 24 }}>
          Tu cuenta está activa. Ya puedes iniciar sesión y comenzar a estudiar.
        </p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-full"
          onClick={onSwitch}
          style={{ marginBottom: 10 }}>
          Ir a iniciar sesión →
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="btn btn-ghost btn-full"
          onClick={() => pendingUser && onLogin(pendingUser)}>
          Entrar directamente →
        </motion.button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Nombre completo" id="reg-name" placeholder="Tu nombre" value={name} onChange={setName} err={errors.name} />
      <Field label="Correo electrónico" id="reg-email" type="email" placeholder="tu@correo.com"
        value={email} onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })) }}
        err={errors.email}
        ok={isEmail(email) && !errors.email ? '✓ Correo válido' : ''} />
      <Field label="Contraseña" id="reg-pass" type="password" placeholder="Mínimo 8 caracteres"
        value={pass} onChange={v => { setPass(v); setErrors(p => ({ ...p, pass: '' })) }} err={errors.pass} />
      {pass && (
        <div style={{ marginTop: -12, marginBottom: 16 }}>
          <div className="strength">
            <motion.div className="strength-fill" animate={{ width: str.width, background: str.color }} transition={{ duration: 0.35 }} />
          </div>
          <div className="strength-label" style={{ color: str.color }}>{str.label}</div>
        </div>
      )}
      <Field label="Confirmar contraseña" id="reg-pass2" type="password" placeholder="Repite tu contraseña"
        value={pass2} onChange={v => { setPass2(v); setErrors(p => ({ ...p, pass2: '' })) }} err={errors.pass2}
        ok={pass2 && pass2 === pass && pass2.length >= 8 ? '✓ Las contraseñas coinciden' : ''} />

      <motion.button type="submit" className="btn btn-primary btn-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ marginTop: 4 }}>
        Continuar → Verificar correo
      </motion.button>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--t3)', marginTop: 16 }}>
        ¿Ya tienes cuenta?{' '}
        <span onClick={onSwitch} style={{ color: 'var(--indigo-l)', cursor: 'pointer', fontWeight: 500 }}>
          Inicia sesión
        </span>
      </div>
    </form>
  )
}

/* ── login panel ─────────────────────────── */
function LoginPanel({ onSwitch, onLogin }) {
  const { addToast } = useToast()
  const [email,  setEmail]  = useState('')
  const [pass,   setPass]   = useState('')
  const [errors, setErrors] = useState({})

  const submit = e => {
    e.preventDefault()
    const errs = {}
    if (!email.trim() || !isEmail(email)) errs.email = 'Ingresa un correo electrónico válido.'
    if (!pass) errs.pass = 'Ingresa tu contraseña.'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const user = storage.getUsers().find(u => u.email === email.toLowerCase().trim() && u.pass === pass)
    if (!user) {
      addToast('Credenciales incorrectas', 'Verifica tu correo y contraseña.', 'error')
      setErrors({ email: ' ', pass: 'Correo o contraseña incorrectos.' }); return
    }
    if (user.isActive === false) {
      addToast('Cuenta suspendida', 'Contacta al administrador.', 'error'); return
    }
    addToast(`¡Hola de nuevo, ${user.name}!`, 'Inicio de sesión exitoso. Redirigiendo…', 'success')
    setTimeout(() => onLogin(user), 800)
  }

  return (
    <form onSubmit={submit} noValidate>
      <Field label="Correo electrónico" id="log-email" type="email" placeholder="tu@correo.com"
        value={email} onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })) }} err={errors.email} />
      <Field label="Contraseña" id="log-pass" type="password" placeholder="Tu contraseña"
        value={pass} onChange={v => { setPass(v); setErrors(p => ({ ...p, pass: '' })) }} err={errors.pass} />
      <motion.button type="submit" className="btn btn-primary btn-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ marginTop: 4 }}>
        Ingresar a EquilibraStudy →
      </motion.button>
      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--t3)', marginTop: 16 }}>
        ¿No tienes cuenta?{' '}
        <span onClick={onSwitch} style={{ color: 'var(--indigo-l)', cursor: 'pointer', fontWeight: 500 }}>
          Regístrate gratis
        </span>
      </div>
    </form>
  )
}

/* ── main ────────────────────────────────── */
export default function AuthSection({ onLogin }) {
  const [tab, setTab] = useState('register')

  return (
    <section className="section" id="registro" style={{ background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)',
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none',
      }} />

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 48, alignItems: 'center' }}>

          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65, ease: [0.16,1,0.3,1] }}>
            <span className="badge" style={{ marginBottom: 20 }}>Acceso institucional</span>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, color: 'var(--t0)', marginBottom: 16, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
              Empieza a estudiar con{' '}<span className="gt">propósito</span> hoy
            </h2>
            <p style={{ fontSize: 15, color: 'var(--t2)', marginBottom: 32, lineHeight: 1.75 }}>
              Crea tu cuenta con cualquier correo electrónico y accede a todas las funcionalidades de forma completamente gratuita.
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {perks.map((p, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: `${p.color}15`, border: `1px solid ${p.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{p.icon}</span>
                  <span style={{ fontSize: 14, color: 'var(--t2)', paddingTop: 5 }}>{p.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65, ease: [0.16,1,0.3,1] }}
            style={{
              background: 'var(--bg)', border: '1px solid var(--border2)',
              borderRadius: 'var(--r-xl)', overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px var(--border)',
            }}>
            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
              {['register', 'login'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '16px', background: 'transparent', border: 'none', fontFamily: 'Inter', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', position: 'relative', transition: 'color .2s',
                  color: tab === t ? 'var(--t0)' : 'var(--t3)',
                }}>
                  {t === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
                  {tab === t && (
                    <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--indigo), var(--cyan))', borderRadius: 2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>

            {/* Body */}
            <div style={{ padding: '28px' }}>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
                  {tab === 'register'
                    ? <RegisterPanel onSwitch={() => setTab('login')} onLogin={onLogin} />
                    : <LoginPanel   onSwitch={() => setTab('register')} onLogin={onLogin} />
                  }
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #registro .container > div { grid-template-columns: 1fr !important; }
          #registro .container > div > div:first-child { display: none; }
        }
      `}</style>
    </section>
  )
}

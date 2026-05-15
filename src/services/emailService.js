import emailjs from '@emailjs/browser'

// ─── Configuración EmailJS ────────────────────────────────────────────────────
// 1. Crea cuenta gratis en https://www.emailjs.com (200 correos/mes gratis)
// 2. En "Email Services" conecta tu Gmail o Outlook → copia el Service ID
// 3. En "Email Templates" crea plantilla con cuerpo: {{{html_content}}}  ← triple llave
//    y asunto: {{subject}}  →  copia el Template ID
// 4. En "Account" copia tu Public Key
// 5. Reemplaza los tres valores de abajo
const SERVICE_ID  = 'YOUR_SERVICE_ID'
const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
const PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'

const CONFIGURED = !SERVICE_ID.startsWith('YOUR_')

function buildHTML(name, code) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#00C8F5,#4DA6FF);padding:40px 40px 36px;text-align:center;">
      <div style="background:rgba(255,255,255,0.25);width:60px;height:60px;border-radius:16px;margin:0 auto 18px;display:inline-flex;align-items:center;justify-content:center;">
        <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
          <path d="M10 17C10 17 2 11.5 2 6.5C2 4.0 4.0 2 6.5 2C8.0 2 9.3 2.8 10 4C10.7 2.8 12.0 2 13.5 2C16.0 2 18 4.0 18 6.5C18 11.5 10 17 10 17Z" fill="#fff"/>
        </svg>
      </div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">EquilibraStudy</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Verificación de correo electrónico</p>
    </div>

    <!-- Body -->
    <div style="padding:40px 40px 32px;">
      <p style="color:#1A1A2E;font-size:16px;margin:0 0 10px;font-weight:600;">Hola, ${name} 👋</p>
      <p style="color:#555;font-size:14px;line-height:1.75;margin:0 0 32px;">
        Gracias por registrarte en <strong>EquilibraStudy</strong>. Para activar tu cuenta, ingresa el siguiente código de verificación en la pantalla de registro:
      </p>

      <!-- Code box -->
      <div style="background:#f0f8ff;border:2px dashed #00C8F5;border-radius:16px;padding:32px 24px;text-align:center;margin-bottom:32px;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:14px;font-weight:600;">Tu código de verificación</div>
        <div style="font-size:48px;font-weight:700;letter-spacing:0.3em;color:#1A1A2E;font-family:'Courier New',monospace;">${code}</div>
        <div style="margin-top:16px;display:inline-flex;align-items:center;gap:6px;background:#fff3cd;border-radius:99px;padding:6px 16px;">
          <span style="font-size:14px;">⏱</span>
          <span style="font-size:12px;color:#856404;font-weight:500;">Válido por 5 minutos</span>
        </div>
      </div>

      <!-- Steps -->
      <div style="background:#f9fafb;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <p style="color:#1A1A2E;font-size:13px;font-weight:600;margin:0 0 12px;">¿Cómo usar el código?</p>
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:8px;">
          <span style="background:#00C8F5;color:#fff;width:20px;height:20px;border-radius:50%;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">1</span>
          <span style="color:#555;font-size:13px;">Vuelve a la pantalla de registro de EquilibraStudy</span>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:8px;">
          <span style="background:#00C8F5;color:#fff;width:20px;height:20px;border-radius:50%;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">2</span>
          <span style="color:#555;font-size:13px;">Ingresa el código de 6 dígitos en las casillas</span>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <span style="background:#00C8F5;color:#fff;width:20px;height:20px;border-radius:50%;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">3</span>
          <span style="color:#555;font-size:13px;">¡Tu cuenta quedará activada al instante!</span>
        </div>
      </div>

      <p style="color:#aaa;font-size:12px;line-height:1.7;margin:0;">
        Si no creaste una cuenta en EquilibraStudy, puedes ignorar este correo sin ningún problema. Tu información está segura.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;border-top:1px solid #eee;padding:24px 40px;text-align:center;">
      <p style="color:#bbb;font-size:12px;margin:0 0 6px;">© 2025 EquilibraStudy · Plataforma académica inteligente</p>
      <p style="color:#ddd;font-size:11px;margin:0;">Universidad del Magdalena</p>
    </div>

  </div>
</body>
</html>`
}

export async function sendVerificationEmail(toEmail, userName, code) {
  if (!CONFIGURED) {
    // Modo demo: sin EmailJS configurado, mostramos el código en pantalla
    return { ok: false, demo: true }
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email:     toEmail,
        to_name:      userName,
        subject:      'Tu código de verificación — EquilibraStudy',
        html_content: buildHTML(userName, code),
      },
      PUBLIC_KEY
    )
    return { ok: true }
  } catch (err) {
    console.error('EmailJS error:', err)
    return { ok: false, demo: false }
  }
}

// v6
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret }       = require('firebase-functions/params')
const { initializeApp }      = require('firebase-admin/app')
const { getFirestore }       = require('firebase-admin/firestore')
const { getAuth }            = require('firebase-admin/auth')
const nodemailer             = require('nodemailer')

initializeApp()

const GMAIL_USER = defineSecret('GMAIL_USER')
const GMAIL_PASS = defineSecret('GMAIL_PASS')

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function templateEmail(nome, codigo) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Seu código de acesso — Lumi</title></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #EFEDE8;">

        <tr><td style="padding:36px 40px 0;">
          <p style="margin:0;font-size:28px;font-style:italic;font-weight:400;color:#1E1E1F;letter-spacing:-0.02em;">Lumi</p>
        </td></tr>

        <tr><td style="padding:28px 40px 8px;">
          <p style="margin:0 0 10px;font-size:20px;font-weight:600;color:#1E1E1F;letter-spacing:-0.02em;">Olá, ${nome}!</p>
          <p style="margin:0;font-size:15px;color:#6B6B6B;line-height:1.65;">Que bom ter você por aqui. Use o código abaixo para confirmar seu e-mail e começar a cuidar dos seus fios com a gente.</p>
        </td></tr>

        <tr><td style="padding:28px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;border-radius:14px;">
            <tr><td align="center" style="padding:28px 24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#A3A099;">Seu código</p>
              <p style="margin:0;font-size:38px;font-weight:500;letter-spacing:0.16em;color:#1E1E1F;">${codigo}</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 40px 32px;">
          <p style="margin:0;font-size:13px;color:#A3A099;line-height:1.6;text-align:center;">O código expira em <span style="color:#6B6B6B;font-weight:600;">10 minutos</span>.<br/>Se você não criou uma conta no Lumi, pode ignorar este e-mail com segurança.</p>
        </td></tr>

        <tr><td style="padding:20px 40px;border-top:1px solid #EFEDE8;">
          <p style="margin:0;font-size:12px;color:#C4C1BA;text-align:center;line-height:1.5;">Lumi · Sua jornada de cuidado capilar<br/>Este é um e-mail automático, não precisa responder.</p>
        </td></tr>

      </table>

      <p style="margin:20px 0 0;font-size:11px;color:#C4C1BA;">Enviado com cuidado pela equipe Lumi</p>
    </td></tr>
  </table>
</body></html>`
}

exports.enviarCodigoOTP = onCall(
  { secrets: [GMAIL_USER, GMAIL_PASS], invoker: 'public' },
  async (request) => {
    const { uid, email, nome, forcar } = request.data

    if (!uid || !email) {
      throw new HttpsError('invalid-argument', 'uid e email são obrigatórios.')
    }

    const db  = getFirestore()
    const ref = db.collection('otp_verificacao').doc(uid)


    if (!forcar) {
      const snap = await ref.get()
      if (snap.exists) {
        const dados = snap.data()
        if (Date.now() < dados.expira) {
          // Código ainda válido — não envia novo
          return { sucesso: true, jaExiste: true }
        }
      }
    }

    const codigo = gerarCodigo()
    const expira = Date.now() + 10 * 60 * 1000

    await ref.set({ codigo, email, expira, tentativas: 0, criadoEm: new Date() })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER.value(), pass: GMAIL_PASS.value() },
    })

    try {
      await transporter.sendMail({
        from:    `"Lumi" <${GMAIL_USER.value()}>`,
        to:      email,
        subject: `Seu código de acesso é ${codigo}`,
        html:    templateEmail(nome || 'usuária', codigo),
      })
    } catch (err) {
      console.error('Erro nodemailer:', err)
      throw new HttpsError('internal', 'Erro ao enviar email. Tente novamente.')
    }

    return { sucesso: true, jaExiste: false }
  }
)

exports.verificarCodigoOTP = onCall(
  { secrets: [GMAIL_USER, GMAIL_PASS], invoker: 'public' },
  async (request) => {
    const { uid, codigo } = request.data


    if (!uid || !codigo) {
      throw new HttpsError('invalid-argument', 'uid e codigo são obrigatórios.')
    }

    const db   = getFirestore()
    const auth = getAuth()
    const ref  = db.collection('otp_verificacao').doc(uid)
    const snap = await ref.get()


    if (!snap.exists) {
      return { sucesso: false, motivo: 'nao_encontrado', mensagem: 'Código não encontrado. Solicite um novo.' }
    }

    const dados = snap.data()

    if (Date.now() > dados.expira) {
      await ref.delete()
      return { sucesso: false, motivo: 'expirado', mensagem: 'Código expirado. Solicite um novo.' }
    }

    if (dados.tentativas >= 5) {
      await ref.delete()
      return { sucesso: false, motivo: 'tentativas', mensagem: 'Muitas tentativas. Solicite um novo código.' }
    }

    if (dados.codigo !== codigo.trim()) {
      await ref.update({ tentativas: dados.tentativas + 1 })
      const restantes = 4 - dados.tentativas
      return { sucesso: false, motivo: 'incorreto', mensagem: `Código incorreto. ${restantes} tentativa(s) restante(s).` }
    }

    await auth.updateUser(uid, { emailVerified: true })
    await ref.delete()

    return { sucesso: true, emailVerificado: true }
  }
)
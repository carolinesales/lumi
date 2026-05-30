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
<head><meta charset="UTF-8" /><title>Confirme seu email — Lumi</title></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="padding:40px 48px 32px;border-bottom:1px solid #F0EDE8;">
          <p style="margin:0;font-size:26px;font-style:italic;font-weight:400;color:#181714;">Lumi</p>
        </td></tr>
        <tr><td style="padding:40px 48px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#181714;">Olá, ${nome} 👋</p>
          <p style="margin:0 0 32px;font-size:15px;color:#495059;line-height:1.6;">Use o código abaixo para confirmar seu email.</p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <div style="display:inline-block;background:#F7F6F3;border-radius:16px;padding:24px 48px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#9A958E;">Seu código</p>
              <p style="margin:0;font-size:40px;font-weight:300;letter-spacing:0.18em;color:#181714;">${codigo}</p>
            </div>
          </td></tr></table>
          <p style="margin:32px 0 0;font-size:13px;color:#9A958E;line-height:1.6;text-align:center;">Expira em <strong style="color:#495059;">10 minutos</strong>. Se não foi você, ignore.</p>
        </td></tr>
        <tr><td style="padding:24px 48px;border-top:1px solid #F0EDE8;background:#FAFAFA;">
          <p style="margin:0;font-size:12px;color:#C0BEB8;text-align:center;">Lumi — Sua jornada capilar inteligente</p>
        </td></tr>
      </table>
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

    // Se já existe código válido e não está forçando reenvio, não gera novo
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
        subject: `${codigo} é seu código de verificação — Lumi`,
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

    // Argumentos ausentes: ainda é erro de programação, não de usuário
    if (!uid || !codigo) {
      throw new HttpsError('invalid-argument', 'uid e codigo são obrigatórios.')
    }

    const db   = getFirestore()
    const auth = getAuth()
    const ref  = db.collection('otp_verificacao').doc(uid)
    const snap = await ref.get()

    // A partir daqui, falhas de verificação retornam 200 com { sucesso: false }
    // para não poluir o console do navegador com erros HTTP esperados.
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
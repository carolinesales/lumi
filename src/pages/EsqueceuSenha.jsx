import { useEffect, useState }            from 'react'
import { Link, useNavigate }              from 'react-router-dom'
import { sendPasswordResetEmail }         from 'firebase/auth'

import { auth }      from '@/lib/firebase'
import { useIdioma } from '@/contexts/IdiomaContext'
import { Button }    from '@/components/ui/button'
import Input         from '@/components/ui/input'
import { cn }        from '@/lib/utils'

// ─── Layout  ───────────────────────────────────

function AuthLayout({ photo, children }) {
  return (
    <div className="force-light flex h-screen overflow-hidden bg-white">
      <div className="hidden w-[48%] shrink-0 lg:block">
        <img
          src={photo}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[center_20%] grayscale"
        />
      </div>
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 pt-14 pb-14 lg:justify-center lg:px-20">
        <div className="w-full max-w-[360px]">{children}</div>
      </div>
    </div>
  )
}

function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-3">
      <i className="fa-solid fa-circle-exclamation text-sm text-[#dc3232]" aria-hidden="true" />
      <p className="font-nunito text-sm text-[#dc3232]">{message}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EsqueceuSenha() {
  const { t }    = useIdioma()
  const navigate = useNavigate()

  const [email,     setEmail]     = useState('')
  const [erro,      setErro]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [enviado,   setEnviado]   = useState(false)
  const [countdown, setCountdown] = useState(0)

  const ERROS = {
    'auth/invalid-email':     'E-mail inválido.',
    'auth/missing-email':     'Digite seu e-mail.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
  }

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  async function enviar(e) {
    e?.preventDefault()
    if (!email.trim()) { setErro('Digite seu e-mail.'); return }
    setErro(''); setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setEnviado(true)
      setCountdown(60)
    } catch (err) {
      // Mesmo em erro de "usuário não existe", não revelamos — só erros técnicos reais
      if (err.code === 'auth/user-not-found') {
        // Por segurança, tratamos como sucesso (não revela se o e-mail existe)
        setEnviado(true)
        setCountdown(60)
      } else {
        setErro(ERROS[err.code] ?? 'Não foi possível enviar agora. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Tela 2 — Confirmação ──────────────────────────────────────────────────
  if (enviado) {
    return (
      <AuthLayout photo="/hero-login.jpg">
        <div className="flex flex-col gap-8">

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="font-['Montserrat'] text-2xl font-medium leading-[40px] text-lumi-black">
                Verifique seu e-mail
              </h2>
              <p className="font-nunito text-base leading-[22px] text-lumi-gray">
                Se houver uma conta associada a{' '}
                <strong className="font-bold text-lumi-black">{email}</strong>, você receberá um link para redefinir sua senha.
              </p>
            </div>
            <p className="font-nunito text-base leading-[22px] text-lumi-gray">
              Não recebeu? Verifique a pasta de spam ou tente novamente.
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex w-full items-center justify-center rounded-[24px] bg-black px-6 py-3 font-nunito text-sm text-white transition hover:opacity-90"
            >
              Voltar ao login
            </button>

            <p className="text-center font-nunito text-sm">
              {countdown > 0 ? (
                <>
                  <span className="text-[#1e1e1e]">Reenviar link em</span>{' '}
                  <span className="font-semibold text-[#1e1e1e]">{countdown}s</span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => enviar()}
                  disabled={loading}
                  className="font-semibold text-[#1e1e1e] underline underline-offset-2 transition hover:opacity-70 disabled:opacity-40"
                >
                  {loading ? 'Enviando...' : 'Reenviar link'}
                </button>
              )}
            </p>
          </div>

        </div>
      </AuthLayout>
    )
  }

  // ── Tela 1 — Solicitar ──────────────────────────────────────────────────────
  return (
    <AuthLayout photo="/hero-login.jpg">
      <div className="flex flex-col gap-10">

        <div className="flex flex-col gap-2">
          <h2 className="font-['Montserrat'] text-2xl font-medium text-lumi-black">
            Esqueceu sua senha?
          </h2>
          <p className="font-nunito text-sm leading-6 text-lumi-gray">
            Digite seu e-mail e enviaremos um link para você criar uma nova senha.
          </p>
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block font-nunito text-sm font-semibold text-lumi-black">
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="voce@email.com"
              error={!!erro}
              required
            />
          </div>

          <ErrorBox message={erro} />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" /> Enviando...</>
              : 'Enviar link'}
          </Button>
        </form>

        <p className="text-center font-nunito text-sm text-lumi-black">
          Lembrou a senha?{' '}
          <Link to="/login" className="font-semibold underline underline-offset-2 transition hover:opacity-70">
            Entrar
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
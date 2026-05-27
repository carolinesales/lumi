import { useEffect, useState }                         from 'react'
import { useNavigate }                                  from 'react-router-dom'
import { reload, sendEmailVerification, signOut }       from 'firebase/auth'

import { auth }      from '@/lib/firebase'
import { useIdioma } from '@/contexts/IdiomaContext'
import { Button }    from '@/components/ui/button'
import { cn }        from '@/lib/utils'

export default function VerificarEmail() {
  const { t }    = useIdioma()
  const navigate = useNavigate()
  const user     = auth.currentUser

  const [verificado,  setVerificado]  = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [enviando,    setEnviando]    = useState(false)
  const [msg,         setMsg]         = useState('')
  const [isErro,      setIsErro]      = useState(false)
  const [countdown,   setCountdown]   = useState(0)

  // Polling automático a cada 3s
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return
      await reload(user)
      if (user.emailVerified) {
        clearInterval(interval)
        setVerificado(true)
        setTimeout(() => navigate('/questionario'), 2800)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [user, navigate])

  // Countdown reenvio
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  async function verificarAgora() {
    setVerificando(true)
    await reload(user)
    if (user.emailVerified) {
      setVerificado(true)
      setTimeout(() => navigate('/questionario'), 2800)
    } else {
      setMsg(t('ve_ainda_nao'))
      setIsErro(true)
      setTimeout(() => setMsg(''), 4000)
    }
    setVerificando(false)
  }

  async function reenviar() {
    if (!user || countdown > 0) return
    setEnviando(true)
    try {
      await sendEmailVerification(user)
      setMsg(t('ve_reenviado'))
      setIsErro(false)
      setCountdown(60)
      setTimeout(() => setMsg(''), 4000)
    } catch {
      setMsg(t('ve_erro_reenvio'))
      setIsErro(true)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Foto desktop */}
      <div className="hidden w-[48%] shrink-0 lg:block">
        <img src="/hero-cadastro.jpg" alt="" aria-hidden="true"
          className="h-full w-full object-cover object-[center_20%] grayscale" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 py-14">
        <div className="flex w-full max-w-[360px] flex-col items-center">

          {/* Logo */}
          <h1 className="mb-10 self-start font-serif text-[28px] italic text-lumi-black">
            Lumi
          </h1>

          {/* ── Aguardando verificação ── */}
          {!verificado && (
            <div className="flex w-full flex-col items-center gap-7 lumi-animate-in">

              {/* Ícone flutuante */}
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-lumi-border bg-lumi-bg"
                style={{ animation: 'lumi-float-soft 4s ease-in-out infinite' }}>
                <i className="fa-regular fa-envelope text-[28px] text-lumi-black" aria-hidden="true" />
              </div>

              {/* Texto */}
              <div className="text-center">
                <h2 className="mb-2.5 font-['Montserrat'] text-xl font-medium tracking-tight text-lumi-black">
                  {t('ve_titulo')}
                </h2>
                <p className="font-nunito text-sm leading-6 text-lumi-gray">{t('ve_sub')}</p>
                <p className="mt-1 font-nunito text-sm font-bold text-lumi-black">{user?.email}</p>
              </div>

              {/* Feedback */}
              {msg && (
                <div className={cn(
                  'w-full rounded-xl border px-4 py-3 text-center font-nunito text-sm',
                  isErro
                    ? 'border-red-200 bg-red-50 text-[#dc3232]'
                    : 'border-green-200 bg-green-50 text-green-700',
                )}>
                  {msg}
                </div>
              )}

              {/* Botões */}
              <div className="flex w-full flex-col gap-2.5">
                <Button size="lg" className="w-full" onClick={verificarAgora} disabled={verificando}>
                  {verificando
                    ? <><i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" />{t('ve_verificando')}</>
                    : t('ve_ja_verifiquei')}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={reenviar}
                  disabled={enviando || countdown > 0}
                >
                  {enviando
                    ? t('ve_enviando')
                    : countdown > 0
                    ? `${t('ve_reenviar_em')} ${countdown}s`
                    : t('ve_reenviar')}
                </Button>

                <button
                  type="button"
                  onClick={() => { signOut(auth); navigate('/') }}
                  className="py-2 font-nunito text-sm text-lumi-muted transition hover:text-lumi-gray"
                >
                  {t('ve_outro_email')}
                </button>
              </div>
            </div>
          )}

          {/* ── Email verificado ── */}
          {verificado && (
            <div className="flex flex-col items-center gap-8 text-center lumi-animate-in">
              {/* Check animado */}
              <svg width="80" height="80" viewBox="0 0 90 90" aria-label="Email verificado">
                <circle cx="45" cy="45" r="42" fill="#181714"
                  style={{ animation: 'lumi-soft-pulse 0.6s var(--lumi-ease) both' }} />
                <path d="M 26 45 L 39 59 L 64 31" fill="none" stroke="#fff"
                  strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 56, strokeDashoffset: 0,
                    animation: 'lumi-fade-up-soft 0.5s 0.3s ease forwards' }} />
              </svg>

              <div>
                <h2 className="mb-2 font-['Montserrat'] text-xl font-medium text-lumi-black">
                  {t('ve_verificado_titulo')}
                </h2>
                <p className="font-nunito text-sm leading-6 text-lumi-gray max-w-[260px]">
                  {t('ve_verificado_sub')}
                </p>
              </div>

              {/* Barra de progresso */}
              <div className="h-0.5 w-[180px] overflow-hidden rounded-full bg-lumi-border">
                <div className="h-full rounded-full bg-lumi-black"
                  style={{ animation: 'load 2.8s var(--lumi-ease) forwards', width: 0 }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
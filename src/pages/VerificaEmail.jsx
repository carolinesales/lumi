import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation }     from 'react-router-dom'
import { onAuthStateChanged, signOut }  from 'firebase/auth'
import { httpsCallable }                from 'firebase/functions'

import { auth, functions } from '@/lib/firebase'
import { cn }              from '@/lib/utils'

const TOTAL = 6

// ─── Layout (espelha o AuthLayout do Login) ───────────────────────────────────

function AuthLayout({ photo, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="hidden w-[48%] shrink-0 lg:block">
        <img
          src={photo}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[center_20%] grayscale"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-14 lg:px-20">
        <div className="w-full max-w-[360px]">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerificarEmail() {
  const navigate    = useNavigate()
  const location    = useLocation()
  const jaEnviouRef = useRef(false)

  // Dados do cadastro para devolver ao voltar (preserva preenchimento)
  const dadosCadastro = location.state?.dadosCadastro ?? null

  const [user,       setUser]       = useState(null)
  const [digitos,    setDigitos]    = useState(Array(TOTAL).fill(''))
  const [erro,       setErro]       = useState('')
  const [loading,    setLoading]    = useState(false)
  const [enviando,   setEnviando]   = useState(false)
  const [countdown,  setCountdown]  = useState(0)
  const [verificado, setVerificado] = useState(false)
  const [voltando,   setVoltando]   = useState(false)

  const inputRefs = useRef([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && !jaEnviouRef.current) {
        jaEnviouRef.current = true
        setUser(u)
        enviarOTP(u)
      }
    })
    return () => unsub()
  }, []) // eslint-disable-line

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  async function enviarOTP(u, forcar = false) {
    const currentUser = u ?? user
    if (!currentUser) return
    setEnviando(true); setErro('')
    try {
      const nome = currentUser.displayName?.split(' ')[0] ?? ''
      const fn   = httpsCallable(functions, 'enviarCodigoOTP')
      await fn({ uid: currentUser.uid, email: currentUser.email, nome, forcar })
      setCountdown(60)
    } catch (err) {
      setErro(err.message ?? 'Erro ao enviar código.')
    } finally {
      setEnviando(false)
    }
  }

  function reenviar() {
    jaEnviouRef.current = true
    enviarOTP(user, true)
  }

  async function verificar(codigo) {
    const code = codigo ?? digitos.join('')
    if (code.length < TOTAL) { setErro('Digite todos os 6 dígitos.'); return }
    setLoading(true); setErro('')
    try {
      const fn = httpsCallable(functions, 'verificarCodigoOTP')
      const { data } = await fn({ uid: user.uid, codigo: code })
      if (data?.sucesso) {
        setVerificado(true)
      } else {
        // Falha esperada (código incorreto, expirado, etc) — retorna 200
        setErro(data?.mensagem ?? 'Código inválido.')
        setDigitos(Array(TOTAL).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      // Erro inesperado (rede, servidor)
      setErro('Não foi possível verificar agora. Tente novamente.')
      setDigitos(Array(TOTAL).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // Deleta a conta não verificada e volta ao cadastro (evita conta órfã)
  async function corrigirEmail() {
    setVoltando(true); setErro('')
    try {
      if (auth.currentUser) {
        await auth.currentUser.delete()
      }
      navigate('/cadastro', { state: { dadosCadastro } })
    } catch (err) {
      // Se falhar (ex: precisa re-login), faz signOut como fallback
      await signOut(auth)
      navigate('/cadastro', { state: { dadosCadastro } })
    }
  }

  function handleChange(valor, idx) {
    const v = valor.replace(/\D/g, '').slice(-1)
    const novos = [...digitos]
    novos[idx] = v
    setDigitos(novos)
    setErro('')
    if (v && idx < TOTAL - 1) inputRefs.current[idx + 1]?.focus()
    if (v && idx === TOTAL - 1 && novos.every(d => d !== '')) {
      setTimeout(() => verificar(novos.join('')), 100)
    }
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !digitos[idx] && idx > 0) {
      const novos = [...digitos]
      novos[idx - 1] = ''
      setDigitos(novos)
      inputRefs.current[idx - 1]?.focus()
    }
    if (e.key === 'Enter') verificar()
  }

  function handlePaste(e) {
    e.preventDefault()
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TOTAL)
    if (!texto) return
    const novos = Array(TOTAL).fill('')
    texto.split('').forEach((c, i) => { novos[i] = c })
    setDigitos(novos)
    inputRefs.current[Math.min(texto.length, TOTAL - 1)]?.focus()
    if (texto.length === TOTAL) setTimeout(() => verificar(texto), 100)
  }

  const nome = user?.displayName?.split(' ')[0] ?? ''

  // ── Tela de boas-vindas pós-verificação ──────────────────────────────────
  if (verificado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="flex w-full max-w-[400px] flex-col items-center gap-8 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-black"
            style={{ animation: 'lumi-pop-in .4s cubic-bezier(.22,1,.36,1) both' }}
          >
            <i className="fa-solid fa-check text-[32px] text-white" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-['Montserrat'] text-2xl font-medium tracking-tight text-lumi-black">
              Olá, {nome}! 👋
            </h2>
            <p className="font-nunito text-base leading-relaxed text-lumi-gray">
              Seu e-mail foi confirmado. Agora vamos conhecer seus fios e montar sua rotina personalizada.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-[#E8E8E8] bg-white p-5 text-left">
            {[
              { icon: 'fa-magnifying-glass', text: 'Diagnóstico capilar personalizado' },
              { icon: 'fa-calendar-days',    text: 'Cronograma de cuidados semanal'    },
              { icon: 'fa-chart-line',       text: 'Acompanhamento do Hair Score'      },
            ].map((item, i, arr) => (
              <div key={item.icon} className={cn(
                'flex items-center gap-3 py-2.5 first:pt-0 last:pb-0',
                i < arr.length - 1 && 'border-b border-[#F0F0F0]',
              )}>
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-lumi-bg">
                  <i className={cn('fa-solid text-sm text-lumi-black', item.icon)} aria-hidden="true" />
                </div>
                <span className="font-nunito text-sm text-lumi-black">{item.text}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate('/questionario')}
            className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-black px-6 py-3.5 font-nunito text-sm text-white transition hover:opacity-90"
          >
            Começar diagnóstico
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </button>
        </div>
      </div>
    )
  }

  // ── Tela de OTP ──────────────────────────────────────────────────────────
  return (
    <AuthLayout photo="/hero-cadastro.jpg">
      <div className="flex flex-col gap-8">

        {/* Cabeçalho */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-['Montserrat'] text-2xl font-medium leading-[40px] text-lumi-black">
              Confirme seu e-mail
            </h2>
            <p className="font-nunito text-base leading-[22px] text-lumi-gray">
              Enviamos um código de 6 dígitos para
            </p>
          </div>
          <p className="text-center font-nunito text-base font-semibold leading-6 text-lumi-black">
            {user?.email}
          </p>
        </div>

        {/* Inputs OTP — flexíveis com gap */}
        <div className="flex items-center gap-2" onPaste={handlePaste}>
          {digitos.map((d, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(e.target.value, i)}
              onKeyDown={e => handleKeyDown(e, i)}
              aria-label={`Dígito ${i + 1} do código`}
              className={cn(
                'h-[72px] min-w-0 flex-1 rounded-[8px] border bg-white text-center font-["Montserrat"] text-2xl font-medium text-lumi-black outline-none transition sm:h-[80px]',
                d || erro
                  ? erro ? 'border-[#dc3232]' : 'border-black'
                  : 'border-[#E0E0E0] focus:border-black',
              )}
            />
          ))}
        </div>

        {/* Erro */}
        {erro && (
          <p className="text-center font-nunito text-sm text-[#dc3232]">{erro}</p>
        )}

        {/* Botão + reenvio */}
        <div className="flex flex-col items-center gap-8">
          <button
            type="button"
            onClick={() => verificar()}
            disabled={loading || digitos.some(d => !d)}
            className="flex w-full items-center justify-center rounded-[24px] bg-black px-6 py-3 font-nunito text-sm text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {loading
              ? <i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" />
              : 'Confirmar'}
          </button>

          <p className="text-center font-nunito text-sm">
            <span className="text-lumi-black">Não recebeu o código?</span>{' '}
            {countdown > 0 ? (
              <span className="font-semibold text-lumi-black">Reenviar em {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={reenviar}
                disabled={enviando}
                className="font-semibold text-lumi-black underline underline-offset-2 transition hover:opacity-70 disabled:opacity-40"
              >
                {enviando ? 'Enviando...' : 'Reenviar'}
              </button>
            )}
          </p>

          <button
            type="button"
            onClick={corrigirEmail}
            disabled={voltando}
            className="font-nunito text-sm text-lumi-gray transition hover:text-lumi-black disabled:opacity-40"
          >
            {voltando ? 'Voltando...' : 'E-mail errado? Corrigir'}
          </button>
        </div>

      </div>
    </AuthLayout>
  )
}
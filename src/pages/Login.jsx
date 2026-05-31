import { useState }                        from 'react'
import { Link, useNavigate }               from 'react-router-dom'
import { signInWithEmailAndPassword }      from 'firebase/auth'

import { auth }      from '@/lib/firebase'
import { useIdioma } from '@/contexts/IdiomaContext'
import { Button }    from '@/components/ui/button'
import Input         from '@/components/ui/input'
import { cn }        from '@/lib/utils'

// ─── Componentes internos ─────────────────────────────────────────────────────

function AuthLayout({ photo, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Foto — só desktop */}
      <div className="hidden w-[48%] shrink-0 lg:block">
        <img
          src={photo}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-[center_20%] grayscale"
        />
      </div>
      {/* Formulário */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 pt-14 pb-14 lg:justify-center lg:px-20">
        <div className="w-full max-w-[360px]">
          {children}
        </div>
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return (
    <label className="mb-2 block font-nunito text-sm font-semibold text-lumi-black">
      {children}
    </label>
  )
}

function FieldInput({ className, ...props }) {
  return <Input className={className} {...props} />
}

function ErrorBox({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
      <i className="fa-solid fa-circle-exclamation text-sm text-[#dc3232]" aria-hidden="true" />
      <p className="font-nunito text-sm text-[#dc3232]">{message}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Login() {
  const { t }    = useIdioma()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [senha,    setSenha]    = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro,     setErro]     = useState('')
  const [loading,  setLoading]  = useState(false)

  const ERROS = {
    'auth/user-not-found':     t('login_erro_nao_encontrado'),
    'auth/wrong-password':     t('login_erro_senha'),
    'auth/invalid-credential': t('login_erro_credencial'),
    'auth/invalid-email':      t('login_erro_email'),
    'auth/too-many-requests':  t('login_erro_tentativas'),
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, senha)
      // Conta não verificada → volta para a verificação OTP
      if (!user.emailVerified) {
        navigate('/verificar-email')
        return
      }
      navigate('/app/home')
    } catch (err) {
      setErro(ERROS[err.code] ?? t('login_erro_generico'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout photo="/hero-login.jpg">
      <div className="flex flex-col gap-10 lumi-animate-in">

        {/* Título */}
        <div className="flex flex-col gap-2">
          <h2 className="font-['Montserrat'] text-2xl font-medium text-lumi-black">
            {t('login_titulo')}
          </h2>
          <p className="font-nunito text-sm text-lumi-gray">
            {t('login_sub')}
          </p>
        </div>

        {/* Campos */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <FieldLabel>{t('login_email')}</FieldLabel>
            <FieldInput
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>

          <div>
            <FieldLabel>{t('login_senha')}</FieldLabel>
            <div className="relative">
              <FieldInput
                type={verSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setVerSenha(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lumi-muted transition hover:text-lumi-black"
                aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <i className={cn('fa-regular text-sm', verSenha ? 'fa-eye' : 'fa-eye-slash')} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                className="font-nunito text-xs text-lumi-gray transition hover:text-lumi-black"
              >
                {t('login_esqueceu')}
              </button>
            </div>
          </div>

          <ErrorBox message={erro} />

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" />{t('login_entrando')}</>
              : t('login_entrar')}
          </Button>
        </form>

        {/* Link cadastro */}
        <p className="text-center font-nunito text-sm text-lumi-black">
          {t('login_sem_conta')}{' '}
          <Link
            to="/cadastro"
            className="font-semibold underline underline-offset-2 transition hover:opacity-70"
          >
            {t('login_criar')}
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
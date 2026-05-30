import { useState }                                          from 'react'
import { Link, useNavigate, useLocation }                    from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile }     from 'firebase/auth'
import { doc, serverTimestamp, setDoc }                      from 'firebase/firestore'

import { auth, db } from '@/lib/firebase'
import { useIdioma } from '@/contexts/IdiomaContext'
import { Button }    from '@/components/ui/button'
import { cn }        from '@/lib/utils'

const PAISES = [
  { flag: '🇧🇷', ddi: '+55' }, { flag: '🇺🇸', ddi: '+1'   },
  { flag: '🇵🇹', ddi: '+351'},{ flag: '🇦🇷', ddi: '+54'  },
  { flag: '🇨🇱', ddi: '+56' }, { flag: '🇨🇴', ddi: '+57'  },
  { flag: '🇲🇽', ddi: '+52' }, { flag: '🇬🇧', ddi: '+44'  },
  { flag: '🇪🇸', ddi: '+34' }, { flag: '🇫🇷', ddi: '+33'  },
  { flag: '🇩🇪', ddi: '+49' }, { flag: '🇮🇹', ddi: '+39'  },
  { flag: '🇯🇵', ddi: '+81' }, { flag: '🇨🇳', ddi: '+86'  },
  { flag: '🇮🇳', ddi: '+91' },
]

function formatarCelular(v) {
  const n = v.replace(/\D/g, '').slice(0, 11)
  if (!n.length)     return ''
  if (n.length <= 2) return `(${n}`
  if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`
  return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`
}

function AuthLayout({ photo, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="hidden w-[48%] shrink-0 lg:block">
        <img src={photo} alt="" aria-hidden="true"
          className="h-full w-full object-cover object-[center_20%] grayscale" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-14 lg:px-20">
        <div className="w-full max-w-[360px]">{children}</div>
      </div>
    </div>
  )
}

function FieldLabel({ children }) {
  return <label className="mb-2 block font-nunito text-sm font-semibold text-lumi-black">{children}</label>
}

function FieldInput({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-[#E8E8E8] bg-white px-4 py-3.5',
        'font-nunito text-base text-lumi-black outline-none transition',
        'placeholder:text-lumi-muted focus:border-lumi-black',
        className,
      )}
      {...props}
    />
  )
}

function PasswordField({ label, value, onChange }) {
  const [ver, setVer] = useState(false)
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <FieldInput type={ver ? 'text' : 'password'} value={value} onChange={onChange} className="pr-11" required />
        <button type="button" onClick={() => setVer(v => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lumi-muted transition hover:text-lumi-black"
          aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>
          <i className={cn('fa-regular text-sm', ver ? 'fa-eye' : 'fa-eye-slash')} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
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

export default function Cadastro() {
  const { t, idioma } = useIdioma()
  const navigate      = useNavigate()
  const location      = useLocation()

  // Dados preservados ao voltar de "Corrigir e-mail" (senha nunca é preservada)
  const preserv = location.state?.dadosCadastro ?? {}

  const ERROS = {
    'auth/email-already-in-use': t('cad_erro_email_uso'),
    'auth/weak-password':        t('cad_erro_senha_fraca'),
    'auth/invalid-email':        t('login_erro_email'),
  }

  const CRITERIOS = [
    { key: 'tamanho', label: t('cad_criterio_tamanho'), test: v => v.length >= 6 && v.length <= 12 },
    { key: 'letra',   label: t('cad_criterio_letra'),   test: v => /[a-zA-Z]/.test(v) },
    { key: 'numero',  label: t('cad_criterio_numero'),  test: v => /[0-9]/.test(v)    },
  ]

  const [aba,       setAba]       = useState('dados')
  const [nome,      setNome]      = useState(preserv.nome      ?? '')
  const [sobrenome, setSobrenome] = useState(preserv.sobrenome ?? '')
  const [email,     setEmail]     = useState(preserv.email     ?? '')
  const [ddi,       setDdi]       = useState(preserv.ddi       ?? '+55')
  const [celular,   setCelular]   = useState(preserv.celular   ?? '')
  const [senha,     setSenha]     = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro,      setErro]      = useState('')
  const [loading,   setLoading]   = useState(false)

  const criteriosOk = CRITERIOS.map(c => ({ ...c, ok: c.test(senha) }))
  const senhaValida  = criteriosOk.every(c => c.ok)
  const forcaPct     = (criteriosOk.filter(c => c.ok).length / CRITERIOS.length) * 100
  const forcaCor     = forcaPct <= 33 ? '#dc3232' : forcaPct <= 66 ? '#b07830' : '#22c55e'
  const paisAtual    = PAISES.find(p => p.ddi === ddi) ?? PAISES[0]

  function avancar(e) {
    e.preventDefault()
    if (!nome.trim())      return setErro(t('cad_erro_nome'))
    if (!sobrenome.trim()) return setErro(t('cad_erro_sobrenome'))
    if (!email.trim())     return setErro(t('cad_erro_email_vazio'))
    setErro('')
    setAba('senha')
  }

  async function finalizar(e) {
    e.preventDefault()
    if (!senhaValida)        return setErro(t('cad_erro_criterios'))
    if (senha !== confirmar) return setErro(t('cad_erro_senhas_diferentes'))
    setErro('')
    setLoading(true)
    try {
      const idiomaAtual = localStorage.getItem('lumi_idioma') ?? idioma ?? 'pt'
      const { user }    = await createUserWithEmailAndPassword(auth, email, senha)
      await updateProfile(user, { displayName: `${nome} ${sobrenome}` })
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome, sobrenome, email,
        celular:        celular ? `${ddi} ${celular}` : '',
        idioma:         idiomaAtual,
        unidade:        idiomaAtual === 'en' ? 'pol' : 'cm',
        dataCadastro:   serverTimestamp(),
        perfilCompleto: false,
        notificacoes:   { diaria: true, semanal: true, especialista: false },
      })
      navigate('/verificar-email', { state: { dadosCadastro: { nome, sobrenome, email, ddi, celular } } })
    } catch (err) {
      setErro(ERROS[err.code] ?? t('cad_erro_generico'))
      setAba('dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout photo="/hero-cadastro.jpg">
      <div className="flex flex-col gap-8 lumi-animate-in">

        <div className="flex flex-col gap-2">
          <h2 className="font-['Montserrat'] text-2xl font-medium text-lumi-black">{t('cad_titulo')}</h2>
          <p className="font-nunito text-sm text-lumi-gray">{t('cad_sub')}</p>
        </div>

        <div className="flex border-b border-lumi-border">
          {[{ id: 'dados', label: t('cad_aba_dados') }, { id: 'senha', label: t('cad_aba_senha') }].map(a => (
            <button key={a.id} type="button"
              onClick={() => a.id === 'dados' && setAba('dados')}
              className={cn(
                '-mb-px flex-1 border-b-2 pb-2.5 font-nunito text-sm transition',
                aba === a.id
                  ? 'border-lumi-black font-bold text-lumi-black'
                  : 'border-transparent font-normal text-lumi-muted',
              )}>
              {a.label}
            </button>
          ))}
        </div>

        {aba === 'dados' && (
          <form onSubmit={avancar} className="flex flex-col gap-5">
            <div>
              <FieldLabel>{t('pp_nome')}</FieldLabel>
              <FieldInput value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div>
              <FieldLabel>{t('pp_sobrenome')}</FieldLabel>
              <FieldInput value={sobrenome} onChange={e => setSobrenome(e.target.value)} required />
            </div>
            <div>
              <FieldLabel>{t('login_email')}</FieldLabel>
              <FieldInput type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com" required />
            </div>

            <div>
              <FieldLabel>{t('pp_celular')}</FieldLabel>
              <div className="flex gap-2">
                <div className="relative flex h-[50px] w-[110px] shrink-0 items-center gap-2 rounded-xl border border-[#E8E8E8] px-3">
                  <span className="text-base">{paisAtual.flag}</span>
                  <span className="flex-1 font-nunito text-sm text-lumi-black">{ddi}</span>
                  <i className="fa-solid fa-chevron-down text-[10px] text-lumi-gray" aria-hidden="true" />
                  <select value={ddi} onChange={e => setDdi(e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0">
                    {PAISES.map(p => (
                      <option key={p.ddi} value={p.ddi}>{p.flag} {p.ddi}</option>
                    ))}
                  </select>
                </div>
                <FieldInput type="tel" value={celular}
                  onChange={e => setCelular(formatarCelular(e.target.value))}
                  placeholder={t('pp_celular_ph')} className="flex-1" />
              </div>
            </div>

            <ErrorBox message={erro} />
            <Button type="submit" size="lg" className="w-full">{t('cad_proximo')}</Button>

            <p className="text-center font-nunito text-sm text-lumi-black">
              {t('cad_ja_tem')}{' '}
              <Link to="/login" className="font-semibold underline underline-offset-2 transition hover:opacity-70">
                {t('cad_acessar')}
              </Link>
            </p>
          </form>
        )}

        {aba === 'senha' && (
          <form onSubmit={finalizar} className="flex flex-col gap-5">
            <PasswordField label={t('login_senha')}         value={senha}     onChange={e => setSenha(e.target.value)} />
            <PasswordField label={t('cad_confirmar_senha')} value={confirmar} onChange={e => setConfirmar(e.target.value)} />

            <div className="h-1 overflow-hidden rounded-full bg-lumi-input">
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${forcaPct}%`, background: forcaCor }} />
            </div>

            <div className="flex flex-col gap-2.5">
              {criteriosOk.map(c => (
                <div key={c.key} className="flex items-center gap-2.5">
                  <div className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all',
                    c.ok ? 'border-green-500 bg-green-500' : 'border-lumi-muted bg-transparent',
                  )}>
                    {c.ok && <i className="fa-solid fa-check text-[8px] text-white" aria-hidden="true" />}
                  </div>
                  <span className={cn('font-nunito text-sm', c.ok ? 'text-lumi-black' : 'text-lumi-gray')}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            <ErrorBox message={erro} />

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" />{t('cad_criando')}</>
                : t('cad_criar_btn')}
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
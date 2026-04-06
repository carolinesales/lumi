import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useNavigate, Link } from 'react-router-dom'

const ERROS = {
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/weak-password':        'Senha muito fraca.',
  'auth/invalid-email':        'E-mail inválido.',
}

const PAISES = [
  { flag: '🇧🇷', ddi: '+55'  },
  { flag: '🇺🇸', ddi: '+1'   },
  { flag: '🇵🇹', ddi: '+351' },
  { flag: '🇦🇷', ddi: '+54'  },
  { flag: '🇨🇱', ddi: '+56'  },
  { flag: '🇨🇴', ddi: '+57'  },
  { flag: '🇲🇽', ddi: '+52'  },
  { flag: '🇬🇧', ddi: '+44'  },
  { flag: '🇪🇸', ddi: '+34'  },
  { flag: '🇫🇷', ddi: '+33'  },
  { flag: '🇩🇪', ddi: '+49'  },
  { flag: '🇮🇹', ddi: '+39'  },
  { flag: '🇯🇵', ddi: '+81'  },
  { flag: '🇨🇳', ddi: '+86'  },
  { flag: '🇮🇳', ddi: '+91'  },
]

const CRITERIOS = [
  { key: 'tamanho', label: 'Entre 6 e 12 caracteres', test: v => v.length >= 6 && v.length <= 12 },
  { key: 'letra',   label: 'Pelo menos 1 letra',       test: v => /[a-zA-Z]/.test(v)             },
  { key: 'numero',  label: 'Pelo menos 1 número',      test: v => /[0-9]/.test(v)                },
]

function formatarCelular(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length === 0) return ''
  if (nums.length <= 2)  return `(${nums}`
  if (nums.length <= 7)  return `(${nums.slice(0,2)}) ${nums.slice(2)}`
  return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`
}

function InputField({ label, type = 'text', value, onChange, placeholder, required = false }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        {label}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        style={{ width: '100%', background: '#fff', border: `1px solid ${focused ? '#1A1A1A' : '#E8E8E8'}`, borderRadius: 10, padding: '13px 16px', fontFamily: 'Nunito Sans, sans-serif', fontSize: 16, fontWeight: 400, color: '#000', outline: 'none', transition: 'border-color .2s', boxSizing: 'border-box' }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

function PasswordField({ label, value, onChange }) {
  const [ver, setVer]         = useState(false)
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input type={ver ? 'text' : 'password'} value={value} onChange={onChange} required
          style={{ width: '100%', background: '#fff', border: `1px solid ${focused ? '#1A1A1A' : '#E8E8E8'}`, borderRadius: 10, padding: '13px 48px 13px 16px', fontFamily: 'Nunito Sans, sans-serif', fontSize: 16, color: '#000', outline: 'none', transition: 'border-color .2s', boxSizing: 'border-box' }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button type="button" onClick={() => setVer(v => !v)}
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <i className={`fa-regular ${ver ? 'fa-eye' : 'fa-eye-slash'}`} style={{ fontSize: 15, color: '#C0C0C0' }} />
        </button>
      </div>
    </div>
  )
}

function ErroBox({ mensagem }) {
  if (!mensagem) return null
  return (
    <div style={{ background: 'rgba(220,50,50,0.06)', border: '1px solid rgba(220,50,50,0.15)', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <i className="fa-solid fa-circle-exclamation" style={{ color: '#dc3232', fontSize: 13 }} />
      <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#dc3232', margin: 0 }}>{mensagem}</p>
    </div>
  )
}

export default function Cadastro() {
  const [aba, setAba]             = useState('dados')
  const [nome, setNome]           = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail]         = useState('')
  const [ddi, setDdi]             = useState('+55')
  const [celular, setCelular]     = useState('')
  const [senha, setSenha]         = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro]           = useState('')
  const [loading, setLoading]     = useState(false)
  const navigate = useNavigate()

  const criteriosOk = CRITERIOS.map(c => ({ ...c, ok: c.test(senha) }))
  const senhaValida  = criteriosOk.every(c => c.ok)
  const forcaPct     = (criteriosOk.filter(c => c.ok).length / CRITERIOS.length) * 100
  const forcaCor     = forcaPct <= 33 ? '#dc3232' : forcaPct <= 66 ? '#b07830' : '#22c55e'

  function avancar(e) {
    e.preventDefault()
    if (!nome.trim())      return setErro('Informe seu nome.')
    if (!sobrenome.trim()) return setErro('Informe seu sobrenome.')
    if (!email.trim())     return setErro('Informe seu e-mail.')
    setErro('')
    setAba('senha')
  }

  async function finalizar(e) {
    e.preventDefault()
    if (!senhaValida)        return setErro('A senha não atende aos critérios.')
    if (senha !== confirmar) return setErro('As senhas não coincidem.')
    setErro('')
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, senha)
      await updateProfile(user, { displayName: `${nome} ${sobrenome}` })
      await sendEmailVerification(user)
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome, sobrenome, email,
        celular: celular ? `${ddi} ${celular}` : '',
        dataCadastro:   serverTimestamp(),
        perfilCompleto: false,
      })
      navigate('/verificar-email')
    } catch (err) {
      setErro(ERROS[err.code] ?? 'Erro ao criar conta. Tente novamente.')
      setAba('dados')
    } finally {
      setLoading(false)
    }
  }

  const paisAtual = PAISES.find(p => p.ddi === ddi) ?? PAISES[0]

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#fff', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu0 { animation: fadeUp .6s .0s ease both }
        .fu1 { animation: fadeUp .6s .1s ease both }
        .fu2 { animation: fadeUp .6s .2s ease both }

        /* Mobile */
        .photo-panel-cad { display: none }
        .form-panel-cad {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 56px 24px 40px;
          background: #fff;
          box-sizing: border-box;
          overflow-y: auto;
        }
        .form-inner-cad {
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }

        /* Desktop */
        @media (min-width: 1024px) {
          .photo-panel-cad {
            display: block;
            width: 48%;
            flex-shrink: 0;
            position: relative;
            height: 100vh;
            overflow: hidden;
          }
          .form-panel-cad {
            flex: 1;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0 80px;
            overflow-y: auto;
            position: sticky;
            top: 0;
          }
          .form-inner-cad {
            width: 100%;
            max-width: 360px;
          }
        }
      `}</style>

      {/* ── FOTO — desktop ── */}
      <div className="photo-panel-cad">
        <img src="/hero-cadastro.jpg" alt="Lumi"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: 'grayscale(100%)' }} />
      </div>

      {/* ── FORMULÁRIO ── */}
      <div className="form-panel-cad">
        <div className="form-inner-cad">

          {/* Título */}
          <div className="fu0" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '40px', color: '#000', margin: 0 }}>
              Crie sua conta
            </h2>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '22px', color: '#838383', margin: 0 }}>
              Comece sua jornada de cuidados capilares.
            </p>
          </div>

          {/* Abas */}
          <div className="fu1" style={{ display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
            {[{ id: 'dados', label: 'Meus dados' }, { id: 'senha', label: 'Criar senha' }].map(a => (
              <button key={a.id}
                onClick={() => a.id === 'dados' && setAba('dados')}
                style={{ flex: 1, background: 'none', border: 'none', borderBottom: aba === a.id ? '2px solid #1A1A1A' : '2px solid transparent', padding: '10px 0', fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: aba === a.id ? 700 : 400, color: aba === a.id ? '#1A1A1A' : '#C0C0C0', cursor: 'pointer', marginBottom: -1, transition: 'all .2s' }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* ABA 1 — Meus dados */}
          {aba === 'dados' && (
            <form onSubmit={avancar} className="fu2" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <InputField label="Nome"      value={nome}      onChange={e => setNome(e.target.value)}      required />
              <InputField label="Sobrenome" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required />
              <InputField label="E-mail"    type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" required />

              {/* Celular */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
                  Celular
                </label>
                <div style={{ display: 'flex', gap: 8 }}>

                  {/* DDI customizado */}
                  <div style={{ position: 'relative', width: 121, height: 48, border: '1px solid #E8E8E8', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0, boxSizing: 'border-box' }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{paisAtual.flag}</span>
                    <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#1A1A1A', flex: 1 }}>{ddi}</span>
                    <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, color: '#9B9B9B' }} />
                    <select value={ddi} onChange={e => setDdi(e.target.value)}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%', border: 'none' }}>
                      {PAISES.map(p => (
                        <option key={p.ddi} value={p.ddi}>{p.flag} {p.ddi}</option>
                      ))}
                    </select>
                  </div>

                  {/* Número */}
                  <input type="tel" value={celular} onChange={e => setCelular(formatarCelular(e.target.value))}
                    placeholder="(00) 00000-0000"
                    style={{ flex: 1, background: '#fff', border: '1px solid #E8E8E8', borderRadius: 10, padding: '13px 16px', fontFamily: 'Nunito Sans, sans-serif', fontSize: 16, color: '#000', outline: 'none', transition: 'border-color .2s', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#1A1A1A'}
                    onBlur={e => e.target.style.borderColor = '#E8E8E8'}
                  />
                </div>
              </div>

              <ErroBox mensagem={erro} />

              <button type="submit"
                style={{ width: '100%', height: 50, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 25, fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}>
                Próximo passo
              </button>

              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#1E1E1E', margin: 0, textAlign: 'center' }}>
                Já tem uma conta?{' '}
                <Link to="/login" style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E1E1E', textDecoration: 'none', borderBottom: '1px solid #1E1E1E' }}>
                  Acesse por aqui
                </Link>
              </p>

            </form>
          )}

          {/* ABA 2 — Criar senha */}
          {aba === 'senha' && (
            <form onSubmit={finalizar} className="fu2" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              <PasswordField label="Senha"           value={senha}     onChange={e => setSenha(e.target.value)} />
              <PasswordField label="Confirmar senha" value={confirmar} onChange={e => setConfirmar(e.target.value)} />

              {/* Barra de força */}
              <div style={{ height: 3, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${forcaPct}%`, background: forcaCor, borderRadius: 99, transition: 'all .3s' }} />
              </div>

              {/* Critérios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {criteriosOk.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${c.ok ? '#22c55e' : '#D0D0D0'}`, background: c.ok ? '#22c55e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
                      {c.ok && <i className="fa-solid fa-check" style={{ fontSize: 8, color: '#fff' }} />}
                    </div>
                    <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: c.ok ? '#1A1A1A' : '#9B9B9B', transition: 'color .2s' }}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>

              <ErroBox mensagem={erro} />

              <button type="submit" disabled={loading}
                style={{ width: '100%', height: 50, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 25, fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, transition: 'all .2s' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14 }} />
                    Criando conta...
                  </span>
                ) : 'Criar minha conta'}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  )
}
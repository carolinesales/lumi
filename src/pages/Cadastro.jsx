import { useState } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'

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

const inputStyle = {
  width: '100%', background: '#EFEFEF', border: '1.5px solid transparent',
  borderRadius: 12, padding: '14px 16px', fontSize: 14,
  fontFamily: 'Nunito Sans, sans-serif', color: '#1A1A1A',
  outline: 'none', transition: 'all .2s', boxSizing: 'border-box',
}

const labelStyle = {
  fontFamily: 'Nunito Sans, sans-serif', fontSize: 13,
  fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 8,
}

const btnPrimary = {
  width: '100%', background: '#1A1A1A', color: '#fff', border: 'none',
  borderRadius: 50, padding: '16px 24px', fontSize: 15,
  fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600,
  cursor: 'pointer', transition: 'all .2s', marginTop: 8,
}

function formatarCelular(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length === 0)  return ''
  if (nums.length <= 2)   return `(${nums}`
  if (nums.length <= 7)   return `(${nums.slice(0,2)}) ${nums.slice(2)}`
  if (nums.length <= 11)  return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`
  return valor
}

function InputField({ label, type = 'text', value, onChange, placeholder, required = false }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{ ...inputStyle, border: focused ? '1.5px solid #1A1A1A' : '1.5px solid transparent', background: focused ? '#fff' : '#EFEFEF' }}
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
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={ver ? 'text' : 'password'} value={value} onChange={onChange} required
          style={{ ...inputStyle, paddingRight: 48, border: focused ? '1.5px solid #1A1A1A' : '1.5px solid transparent', background: focused ? '#fff' : '#EFEFEF' }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button type="button" onClick={() => setVer(v => !v)}
          style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <i className={`fa-regular ${ver ? 'fa-eye' : 'fa-eye-slash'}`} style={{ fontSize: 16, color: '#6B6B6B' }} />
        </button>
      </div>
    </div>
  )
}

function ErroBox({ mensagem }) {
  if (!mensagem) return null
  return (
    <div style={{ background: 'rgba(220,50,50,0.07)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <i className="fa-solid fa-circle-exclamation" style={{ color: '#dc3232', fontSize: 14 }} />
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
  const forcaCor     = forcaPct <= 33 ? '#dc3232' : forcaPct <= 66 ? '#b07830' : '#4CAF50'

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
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome, sobrenome, email,
        celular: celular ? `${ddi} ${celular}` : '',
        dataCadastro:   serverTimestamp(),
        perfilCompleto: false,
      })
      await sendEmailVerification(user)
      navigate('/verificar-email')
    } catch (err) {
      setErro(ERROS[err.code] ?? 'Erro ao criar conta. Tente novamente.')
      setAba('dados')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 8 }}>
        <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', letterSpacing: 1 }}>
          Lumi
        </h1>
      </div>

      <div style={{ flex: 1, padding: '24px 24px 40px' }}>

        {/* Voltar + título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <button onClick={() => aba === 'senha' ? setAba('dados') : navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <i className="fa-solid fa-chevron-left" style={{ fontSize: 14, color: '#1A1A1A' }} />
          </button>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            Crie sua conta
          </h2>
        </div>

        {/* Abas */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid #E0E0E0', marginBottom: 28 }}>
          {[{ id: 'dados', label: 'Meus dados' }, { id: 'senha', label: 'Criar senha' }].map(a => (
            <button key={a.id}
              onClick={() => a.id === 'dados' && setAba('dados')}
              style={{ flex: 1, background: 'none', border: 'none', borderBottom: aba === a.id ? '2px solid #1A1A1A' : '2px solid transparent', padding: '10px 0', fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: aba === a.id ? 700 : 400, color: aba === a.id ? '#1A1A1A' : '#6B6B6B', cursor: 'pointer', marginBottom: -1.5, transition: 'all .2s' }}>
              {a.label}
            </button>
          ))}
        </div>

        {/* ABA 1 — Meus dados */}
        {aba === 'dados' && (
          <form onSubmit={avancar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <InputField label="Nome"   value={nome}      onChange={e => setNome(e.target.value)}      required />
            <InputField label="Sobrenome" value={sobrenome} onChange={e => setSobrenome(e.target.value)} required />
            <InputField label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" required />

            {/* Celular */}
            <div>
              <label style={labelStyle}>Celular</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={ddi} onChange={e => setDdi(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', flexShrink: 0, cursor: 'pointer', paddingRight: 36, appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236B6B6B'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                  {PAISES.map(p => (
                    <option key={p.ddi} value={p.ddi}>{p.flag} {p.ddi}</option>
                  ))}
                </select>
                <input type="tel" value={celular}
                  onChange={e => setCelular(formatarCelular(e.target.value))}
                  placeholder="(00) 00000-0000"
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => { e.target.style.border='1.5px solid #1A1A1A'; e.target.style.background='#fff' }}
                  onBlur={e => { e.target.style.border='1.5px solid transparent'; e.target.style.background='#EFEFEF' }}
                />
              </div>
            </div>

            <ErroBox mensagem={erro} />

            <button type="submit" style={btnPrimary}>Próximo passo</button>

          </form>
        )}

        {/* ABA 2 — Criar senha */}
        {aba === 'senha' && (
          <form onSubmit={finalizar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <PasswordField label="Senha"           value={senha}     onChange={e => setSenha(e.target.value)} />
            <PasswordField label="Confirmar senha" value={confirmar} onChange={e => setConfirmar(e.target.value)} />

            {/* Barra de força */}
            <div style={{ height: 4, background: '#E0E0E0', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${forcaPct}%`, background: forcaCor, borderRadius: 99, transition: 'all .3s' }} />
            </div>

            {/* Critérios */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {criteriosOk.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${c.ok ? '#4CAF50' : '#C0C0C0'}`, background: c.ok ? '#4CAF50' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
                    {c.ok && <i className="fa-solid fa-check" style={{ fontSize: 9, color: '#fff' }} />}
                  </div>
                  <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: c.ok ? '#1A1A1A' : '#6B6B6B', transition: 'color .2s' }}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>

            <ErroBox mensagem={erro} />

            <button type="submit" disabled={loading}
              style={{ ...btnPrimary, opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
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
  )
}
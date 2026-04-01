import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useNavigate, useLocation } from 'react-router-dom'

const ERROS = {
  'auth/user-not-found':     'Usuário não encontrado.',
  'auth/wrong-password':     'Senha incorreta.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email':      'E-mail inválido.',
  'auth/too-many-requests':  'Muitas tentativas. Aguarde.',
}

export default function Login() {
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, senha)
      navigate('/app/home')
    } catch (err) {
      setErro(ERROS[err.code] ?? 'Erro ao entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#EFEFEF',
    border: '1.5px solid transparent',
    borderRadius: 12,
    padding: '14px 16px',
    fontSize: 14,
    fontFamily: 'Nunito Sans, sans-serif',
    color: '#1A1A1A',
    outline: 'none',
    transition: 'all .2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 8 }}>
        <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', letterSpacing: 1 }}>
          Lumi
        </h1>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: '24px 24px 40px' }}>

        {/* Voltar + título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <i className="fa-solid fa-chevron-left" style={{ fontSize: 14, color: '#1A1A1A' }} />
          </button>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            Login
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* E-mail */}
          <div>
            <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>
              E-mail
            </label>
            <input
              type="email" required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.target.style.border = '1.5px solid #1A1A1A'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.border = '1.5px solid transparent'; e.target.style.background = '#EFEFEF' }}
            />
          </div>

          {/* Senha */}
          <div>
            <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 8 }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={verSenha ? 'text' : 'password'} required
                value={senha}
                onChange={e => setSenha(e.target.value)}
                style={{ ...inputStyle, paddingRight: 48 }}
                onFocus={e => { e.target.style.border = '1.5px solid #1A1A1A'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.border = '1.5px solid transparent'; e.target.style.background = '#EFEFEF' }}
              />
              <button type="button" onClick={() => setVerSenha(v => !v)}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <i className={`fa-regular ${verSenha ? 'fa-eye' : 'fa-eye-slash'}`} style={{ fontSize: 16, color: '#6B6B6B' }} />
              </button>
            </div>
          </div>

          {/* Esqueceu a senha */}
          <div style={{ textAlign: 'right', marginTop: -8 }}>
            <button type="button"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', padding: 0 }}>
              Esqueceu sua senha?
            </button>
          </div>

          {erro && (
            <div style={{ background: 'rgba(220,50,50,0.07)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fa-solid fa-circle-exclamation" style={{ color: '#dc3232', fontSize: 14 }} />
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#dc3232', margin: 0 }}>{erro}</p>
            </div>
          )}

          {/* Botão */}
          <button type="submit" disabled={loading}
            style={{ width: '100%', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 50, padding: '16px 24px', fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, transition: 'all .2s', marginTop: 8 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14 }} />
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>

        </form>
      </div>
    </div>
  )
}
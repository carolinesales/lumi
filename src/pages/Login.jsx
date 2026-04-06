import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useNavigate, Link } from 'react-router-dom'

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

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#fff', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu0 { animation: fadeUp .6s .0s ease both }
        .fu1 { animation: fadeUp .6s .1s ease both }
        .fu2 { animation: fadeUp .6s .2s ease both }
        .fu3 { animation: fadeUp .6s .3s ease both }

        .field-input {
          width: 100%;
          background: #fff;
          border: 1px solid #E8E8E8;
          border-radius: 10px;
          padding: 13px 16px;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 16px;
          font-weight: 400;
          line-height: 140%;
          color: #000;
          outline: none;
          transition: border-color .2s;
          box-sizing: border-box;
        }
        .field-input:focus { border-color: #1A1A1A }
        .field-input::placeholder { color: #D0D0D0 }

        .field-label {
          font-family: 'Nunito Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1A1A1A;
          display: block;
          margin-bottom: 8px;
        }

        /* ── MOBILE ── */
        .photo-panel { display: none }

        .form-panel {
          width: 100%;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 56px 24px 40px;
          background: #fff;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .form-inner {
          display: flex;
          flex-direction: column;
          gap: 42px;
          width: 100%;
        }

        /* ── DESKTOP ── */
        @media (min-width: 1024px) {
          .photo-panel {
            display: block;
            width: 48%;
            flex-shrink: 0;
            position: relative;
            height: 100vh;
            overflow: hidden;
          }
          .form-panel {
            flex: 1;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 0 80px;
            overflow-y: auto;
          }
          .form-inner {
            width: 100%;
            max-width: 360px;
          }
        }
      `}</style>

      {/* ── FOTO — desktop ── */}
      <div className="photo-panel">
        <img src="/hero-login.jpg" alt="Lumi"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', filter: 'grayscale(100%)' }} />
      </div>

      {/* ── FORMULÁRIO ── */}
      <div className="form-panel">
        <div className="form-inner">

          {/* Título */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 className="fu0" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 24, fontWeight: 500, lineHeight: '40px', color: '#000', margin: 0 }}>
              Login
            </h2>
            <p className="fu1" style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '22px', color: '#838383', margin: 0 }}>
              Entre e acompanhe sua evolução personalizada.
            </p>
          </div>

          {/* Campos */}
          <div className="fu2" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label className="field-label">E-mail</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="field-input" placeholder="voce@email.com" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label className="field-label">Senha</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input type={verSenha ? 'text' : 'password'} required value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="field-input" placeholder="••••••••"
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setVerSenha(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <i className={`fa-regular ${verSenha ? 'fa-eye' : 'fa-eye-slash'}`} style={{ fontSize: 15, color: '#C0C0C0' }} />
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <button type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#9B9B9B', padding: 0 }}
                  onMouseOver={e => e.target.style.color = '#1A1A1A'}
                  onMouseOut={e => e.target.style.color = '#9B9B9B'}>
                  Esqueceu sua senha?
                </button>
              </div>
            </div>

            {erro && (
              <div style={{ background: 'rgba(220,50,50,0.06)', border: '1px solid rgba(220,50,50,0.15)', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="fa-solid fa-circle-exclamation" style={{ color: '#dc3232', fontSize: 13 }} />
                <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#dc3232', margin: 0 }}>{erro}</p>
              </div>
            )}

          </div>

          {/* Botão + link */}
          <div className="fu3" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', height: 50, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 25, fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, transition: 'all .2s' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14 }} />
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>

            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 400, color: '#1E1E1E', margin: 0, textAlign: 'center' }}>
              Ainda não tem conta?{' '}
              <Link to="/cadastro"
                style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 600, color: '#1E1E1E', textDecoration: 'none', borderBottom: '1px solid #1E1E1E' }}>
                Criar conta
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
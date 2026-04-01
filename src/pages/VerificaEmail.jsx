import { useState, useEffect } from 'react'
import { sendEmailVerification, signOut, reload } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'

export default function VerificarEmail() {
  const [verificado, setVerificado]   = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [enviando, setEnviando]       = useState(false)
  const [msg, setMsg]                 = useState('')
  const [countdown, setCountdown]     = useState(0)
  const navigate = useNavigate()
  const user = auth.currentUser

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return
      await reload(user)
      if (user.emailVerified) {
        clearInterval(interval)
        setVerificado(true)
        setTimeout(() => navigate('/questionario'), 3000)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [user, navigate])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function verificarAgora() {
    setVerificando(true)
    await reload(user)
    if (user.emailVerified) {
      setVerificado(true)
      setTimeout(() => navigate('/questionario'), 3000)
    } else {
      setMsg('E-mail ainda não verificado. Verifique sua caixa de entrada.')
      setTimeout(() => setMsg(''), 4000)
    }
    setVerificando(false)
  }

  async function reenviar() {
    if (!user || countdown > 0) return
    setEnviando(true)
    try {
      await sendEmailVerification(user)
      setMsg('E-mail reenviado com sucesso!')
      setCountdown(60)
      setTimeout(() => setMsg(''), 4000)
    } catch {
      setMsg('Erro ao reenviar. Tente em alguns minutos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes floatSoft { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes drawCheck { from{stroke-dashoffset:56} to{stroke-dashoffset:0} }
        @keyframes growCircle{ from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes progress  { from{width:0%} to{width:100%} }

        .fu0 { animation: fadeUp .7s .0s ease both }
        .fu1 { animation: fadeUp .7s .12s ease both }
        .fu2 { animation: fadeUp .7s .24s ease both }
        .fu3 { animation: fadeUp .7s .36s ease both }
        .float { animation: floatSoft 4s ease-in-out infinite }
        .verified-fade { animation: fadeIn .8s ease both }
        .circle-in { animation: growCircle .6s cubic-bezier(.34,1.56,.64,1) both }
        .check-draw { stroke-dasharray:56; stroke-dashoffset:56; animation: drawCheck .5s .5s ease forwards }
        .progress-bar { animation: progress 2.8s ease forwards }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', paddingTop: 24 }}>
        <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', letterSpacing: 1 }}>
          Lumi
        </h1>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 32px 48px' }}>

        {/* ── ESTADO 1: Quase lá ── */}
        {!verificado && (
          <>
            {/* Ícone flutuando */}
            <div className="fu0" style={{ marginBottom: 40 }}>
              <div className="float" style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <i className="fa-regular fa-envelope" style={{ fontSize: 28, color: '#1A1A1A' }} />
              </div>
            </div>

            {/* Título + e-mail */}
            <div className="fu1" style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>
                Quase lá
              </h2>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, maxWidth: 270, margin: '0 auto 4px' }}>
                Enviamos um link de verificação para
              </p>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>
                {user?.email}
              </p>
            </div>

            {/* Feedback */}
            {msg && (
              <div style={{ background: msg.includes('sucesso') ? 'rgba(76,175,80,0.07)' : 'rgba(220,50,50,0.07)', border: `1px solid ${msg.includes('sucesso') ? 'rgba(76,175,80,0.2)' : 'rgba(220,50,50,0.15)'}`, borderRadius: 12, padding: '11px 16px', marginBottom: 16, width: '100%', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: msg.includes('sucesso') ? '#2e7d32' : '#dc3232', margin: 0 }}>
                  {msg}
                </p>
              </div>
            )}

            <div className="fu2" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={verificarAgora} disabled={verificando}
                style={{ width: '100%', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 50, padding: '16px 24px', fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: verificando ? 'not-allowed' : 'pointer', opacity: verificando ? .6 : 1, transition: 'all .2s' }}>
                {verificando ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 13 }} />
                    Verificando...
                  </span>
                ) : 'Já verifiquei meu e-mail'}
              </button>

              <button onClick={reenviar} disabled={enviando || countdown > 0}
                style={{ width: '100%', background: 'transparent', color: countdown > 0 ? '#C0C0C0' : '#1A1A1A', border: `1.5px solid ${countdown > 0 ? '#E0E0E0' : '#1A1A1A'}`, borderRadius: 50, padding: '14px 24px', fontSize: 14, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: countdown > 0 ? 'not-allowed' : 'pointer', transition: 'all .2s' }}>
                {enviando ? 'Enviando...' : countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar e-mail'}
              </button>

              <button onClick={() => { signOut(auth); navigate('/') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#C0C0C0', padding: '8px 0', textAlign: 'center' }}>
                Usar outro e-mail
              </button>
            </div>
          </>
        )}

        {/* ── ESTADO 2: Verificado ── */}
        {verificado && (
          <div className="verified-fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            <div style={{ marginBottom: 36 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle className="circle-in" cx="45" cy="45" r="42"
                  fill="#1A1A1A"
                  style={{ transformOrigin: '45px 45px' }} />
                <path className="check-draw"
                  d="M 26 45 L 39 59 L 64 31"
                  fill="none" stroke="#fff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>
              E-mail verificado
            </h2>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, maxWidth: 260, marginBottom: 36 }}>
              Tudo certo! Você será redirecionada para o diagnóstico em instantes.
            </p>

            <div style={{ width: 180, height: 2, background: '#E0E0E0', borderRadius: 99, overflow: 'hidden' }}>
              <div className="progress-bar" style={{ height: '100%', background: '#1A1A1A', borderRadius: 99, width: 0 }} />
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
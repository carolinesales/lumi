import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const TIPO_ICON = {
  Hidratação:   'fa-droplet',
  Nutrição:     'fa-leaf',
  Reconstrução: 'fa-wrench',
  Detox:        'fa-sparkles',
  Umectação:    'fa-jar',
  Lavagem:      'fa-pump-soap',
}

const TIPO_DESC = {
  Hidratação:   'Reidrate seus fios para conquistar maciez e brilho.',
  Nutrição:     'Reponha os óleos e combata o ressecamento.',
  Reconstrução: 'Fortaleça os fios com proteínas e queratina.',
  Detox:        'Remova resíduos e regule a oleosidade do couro.',
  Umectação:    'Hidrate profundamente com óleos e manteigas.',
  Lavagem:      'Lave os fios com o método indicado para seu tipo.',
}

export default function Home() {
  const { user, logout }          = useAuth()
  const [hairScore, setHairScore] = useState(null)
  const [etapas, setEtapas]       = useState([])
  const [progresso, setProgresso] = useState({ concluidas: 0, total: 0 })
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()
  const nome = user?.displayName?.split(' ')[0] ?? 'você'

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    async function carregar() {
      try {
        const scoreSnap = await getDocs(query(collection(db, 'usuarios', uid, 'hair_scores'), orderBy('dataRegistro', 'desc'), limit(1)))
        if (!scoreSnap.empty) setHairScore(scoreSnap.docs[0].data())
        const cronSnap = await getDocs(query(collection(db, 'usuarios', uid, 'cronogramas'), orderBy('dataInicio', 'desc'), limit(1)))
        if (!cronSnap.empty) {
          const cronId = cronSnap.docs[0].id
          const etapasSnap = await getDocs(collection(db, 'usuarios', uid, 'cronogramas', cronId, 'etapas'))
          const todas = etapasSnap.docs.map(d => ({ id: d.id, cronogramaId: cronId, ...d.data() }))
          setEtapas(todas)
          setProgresso({ concluidas: todas.filter(e => e.concluida).length, total: todas.length })
        }
      } finally { setLoading(false) }
    }
    carregar()
  }, [user])

  const etapaHoje     = etapas.find(e => !e.concluida && !e.pulada)
  const etapasFuturas = etapas.filter(e => e.id !== etapaHoje?.id && !e.concluida).slice(0, 6)
  const pct           = progresso.total > 0 ? Math.round((progresso.concluidas / progresso.total) * 100) : 0
  const scoreCor      = hairScore?.pontuacao >= 80 ? '#22c55e' : hairScore?.pontuacao >= 60 ? '#f59e0b' : hairScore?.pontuacao >= 40 ? '#f97316' : '#ef4444'

  const NavBar = () => (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: '0.5px solid #F0F0F0', display: 'flex', padding: '10px 0 20px', zIndex: 30 }}>
      {[
        { icon: 'fa-house',             label: 'Inicial',    href: '/app/home'       },
        { icon: 'fa-calendar',          label: 'Cronograma', href: '/app/cronograma' },
        { icon: 'fa-clock-rotate-left', label: 'Histórico',  href: '/app/historico'  },
        { icon: 'fa-user',              label: 'Perfil',     href: '/app/perfil'     },
      ].map((item, i) => {
        const ativo = window.location.pathname === item.href
        return (
          <a key={i} href={item.href} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            {ativo && <div style={{ width: 20, height: 3, background: '#1A1A1A', borderRadius: 99, marginBottom: 2 }} />}
            <i className={`fa-solid ${item.icon}`} style={{ fontSize: 20, color: ativo ? '#1A1A1A' : '#C0C0C0' }} />
            <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 10, color: ativo ? '#1A1A1A' : '#C0C0C0', fontWeight: ativo ? 700 : 400 }}>
              {item.label}
            </span>
          </a>
        )
      })}
    </div>
  )

  const Conteudo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px 24px 0' }}>

      {/* Saudação */}
      <div>
        <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#9B9B9B', margin: '0 0 2px' }}>Olá,</p>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{nome}</h2>
      </div>

      {/* Próxima Etapa */}
      {etapaHoje && (
        <div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 10px' }}>Próxima Etapa</p>
          <div onClick={() => navigate(`/app/etapa/${etapaHoje.cronogramaId}/${etapaHoje.id}`)}
            style={{ background: '#F5F5F5', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: '0.5px solid #E8E8E8' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`fa-solid ${TIPO_ICON[etapaHoje.tipoCuidado] ?? 'fa-droplet'}`} style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{etapaHoje.tipoCuidado}</p>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: 13, color: '#C0C0C0' }} />
              </div>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, fontWeight: 700, color: '#6B6B6B', margin: '2px 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
                {etapaHoje.dia}
              </p>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#9B9B9B', margin: 0, lineHeight: 1.4 }}>
                {TIPO_DESC[etapaHoje.tipoCuidado]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Etapas Futuras */}
      {etapasFuturas.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>Etapas Futuras</p>
            <button onClick={() => navigate('/app/cronograma')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#1A1A1A', padding: 0, fontWeight: 600, textDecoration: 'underline' }}>
              Ver tudo
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {etapasFuturas.map((etapa, i) => (
              <div key={i} onClick={() => navigate(`/app/etapa/${etapa.cronogramaId}/${etapa.id}`)}
                style={{ background: '#fff', borderRadius: 14, padding: '14px 12px', minWidth: 130, flexShrink: 0, border: '0.5px solid #E8E8E8', cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <i className={`fa-solid ${TIPO_ICON[etapa.tipoCuidado] ?? 'fa-droplet'}`} style={{ fontSize: 15, color: '#fff' }} />
                </div>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>{etapa.tipoCuidado}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="fa-regular fa-calendar" style={{ fontSize: 10, color: '#9B9B9B' }} />
                  <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#9B9B9B', margin: 0 }}>{etapa.dia}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progresso */}
      <div>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 10px' }}>Progresso Geral</p>
        <div style={{ background: '#F5F5F5', borderRadius: 16, padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 16, border: '0.5px solid #E8E8E8' }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="#E8E8E8" strokeWidth="6" />
              <circle cx="36" cy="36" r="28" fill="none" stroke="#1A1A1A" strokeWidth="6"
                strokeDasharray={`${(pct / 100) * 175.9} 175.9`}
                strokeLinecap="round" strokeDashoffset="44"
                transform="rotate(-90 36 36)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{pct}%</p>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 9, color: '#9B9B9B', margin: 0 }}>Concluído</p>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
              Você concluiu {progresso.concluidas} {progresso.concluidas === 1 ? 'etapa' : 'etapas'}
            </p>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', margin: 0, lineHeight: 1.5 }}>
              {progresso.total - progresso.concluidas > 0
                ? `Faltam ${progresso.total - progresso.concluidas} etapas para completar seu cronograma`
                : 'Parabéns! Você completou todas as etapas!'}
            </p>
          </div>
        </div>
      </div>

      {/* Hair Score */}
      {hairScore && (
        <div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 10px' }}>Hair Score</p>
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, border: '0.5px solid #E8E8E8' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontFamily: 'Times New Roman, serif', fontSize: 48, color: scoreCor, lineHeight: 1 }}>{hairScore.pontuacao}</span>
              <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#9B9B9B', marginBottom: 6 }}>/100</span>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, fontWeight: 700, color: scoreCor, background: `${scoreCor}18`, borderRadius: 99, padding: '3px 12px' }}>
                {hairScore.classificacao}
              </span>
              <div style={{ height: 3, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden', marginTop: 10 }}>
                <div style={{ height: '100%', width: `${hairScore.pontuacao}%`, background: scoreCor, borderRadius: 99 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!loading && etapas.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '32px 20px', textAlign: 'center', border: '0.5px solid #E8E8E8' }}>
          <i className="fa-solid fa-leaf" style={{ fontSize: 28, color: '#C0C0C0', marginBottom: 12, display: 'block' }} />
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>Nenhum cronograma ainda</p>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#9B9B9B', marginBottom: 20, lineHeight: 1.5 }}>Faça seu diagnóstico para começar.</p>
          <button onClick={() => navigate('/questionario')}
            style={{ background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 25, padding: '12px 24px', fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Iniciar diagnóstico
          </button>
        </div>
      )}

    </div>
  )

  return (
    <>
      <style>{`
        .home-mobile { display: flex }
        .home-desktop { display: none }
        @media (min-width: 1024px) {
          .home-mobile { display: none }
          .home-desktop { display: flex }
        }
      `}</style>

      {/* MOBILE */}
      <div className="home-mobile" style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', flexDirection: 'column', paddingBottom: 80 }}>
        <div style={{ background: '#fff', padding: '52px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, borderBottom: '0.5px solid #F0F0F0' }}>
          <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 26, color: '#1A1A1A', margin: 0 }}>Lumi</h1>
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 16, color: '#C0C0C0' }} />
          </button>
        </div>
        <Conteudo />
        <NavBar />
      </div>

      {/* DESKTOP */}
      <div className="home-desktop" style={{ minHeight: '100vh', background: '#F5F5F5' }}>
        {/* Sidebar */}
        <div style={{ width: 240, background: '#fff', borderRight: '0.5px solid #F0F0F0', position: 'fixed', top: 0, left: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 0' }}>
          <div style={{ padding: '0 24px 32px', borderBottom: '0.5px solid #F0F0F0' }}>
            <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', margin: 0 }}>Lumi</h1>
          </div>
          <nav style={{ flex: 1, padding: '24px 0' }}>
            {[
              { icon: 'fa-house',             label: 'Inicial',    href: '/app/home'       },
              { icon: 'fa-calendar',          label: 'Cronograma', href: '/app/cronograma' },
              { icon: 'fa-clock-rotate-left', label: 'Histórico',  href: '/app/historico'  },
              { icon: 'fa-user',              label: 'Perfil',     href: '/app/perfil'     },
            ].map((item, i) => {
              const ativo = window.location.pathname === item.href
              return (
                <a key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', textDecoration: 'none', background: ativo ? '#F5F5F5' : 'transparent', borderLeft: ativo ? '3px solid #1A1A1A' : '3px solid transparent' }}>
                  <i className={`fa-solid ${item.icon}`} style={{ fontSize: 16, color: ativo ? '#1A1A1A' : '#C0C0C0', width: 20 }} />
                  <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: ativo ? '#1A1A1A' : '#9B9B9B', fontWeight: ativo ? 700 : 400 }}>
                    {item.label}
                  </span>
                </a>
              )
            })}
          </nav>
          <div style={{ padding: '24px' }}>
            <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 15, color: '#C0C0C0' }} />
              <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#9B9B9B' }}>Sair</span>
            </button>
          </div>
        </div>

        {/* Conteúdo desktop */}
        <div style={{ marginLeft: 240, flex: 1, maxWidth: 800, padding: '40px 48px 80px' }}>
          <Conteudo />
        </div>
      </div>
    </>
  )
}
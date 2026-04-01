import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Home() {
  const { user, logout }                  = useAuth()
  const [hairScore, setHairScore]         = useState(null)
  const [recomendacoes, setRecomendacoes] = useState([])
  const [scores, setScores]               = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!user) return
    const uid = user.uid

    Promise.all([
      getDocs(query(collection(db, 'usuarios', uid, 'hair_scores'), orderBy('dataRegistro', 'desc'), limit(1))),
      getDocs(query(collection(db, 'usuarios', uid, 'recomendacoes'), orderBy('dataGerada', 'desc'), limit(3))),
      getDocs(query(collection(db, 'usuarios', uid, 'hair_scores'), orderBy('dataRegistro', 'asc'), limit(10))),
    ]).then(([scoreSnap, recSnap, scoresSnap]) => {
      if (!scoreSnap.empty) setHairScore(scoreSnap.docs[0].data())
      setRecomendacoes(recSnap.docs.map(d => d.data()))
      setScores(scoresSnap.docs.map((d, i) => ({ label: `D${i + 1}`, score: d.data().pontuacao })))
      setLoading(false)
    })
  }, [user])

  const nome     = user?.displayName?.split(' ')[0] ?? 'você'
  const score    = hairScore?.pontuacao ?? null
  const label    = hairScore?.classificacao ?? null
  const scoreCor = score >= 80 ? '#4CAF50' : score >= 60 ? '#b07830' : score >= 40 ? '#E65100' : '#dc3232'

  const TIPO_ICON = {
    Hidratação:   'fa-droplet',
    Nutrição:     'fa-leaf',
    Reconstrução: 'fa-wrench',
    Detox:        'fa-sparkles',
    Manutenção:   'fa-heart',
  }

  const PRIORIDADE_COR = {
    Alta:  '#dc3232',
    Média: '#b07830',
    Baixa: '#2e7d32',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation: fadeUp .5s ease both }
        .fu1 { animation: fadeUp .5s .1s ease both }
        .fu2 { animation: fadeUp .5s .2s ease both }
        .fu3 { animation: fadeUp .5s .3s ease both }
        .fu4 { animation: fadeUp .5s .4s ease both }
      `}</style>

      {/* Header */}
      <div style={{ background: '#F5F5F5', padding: '24px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', letterSpacing: 1, margin: 0 }}>
          Lumi
        </h1>
        <button onClick={logout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <i className="fa-solid fa-right-from-bracket" style={{ fontSize: 16, color: '#6B6B6B' }} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '8px 24px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Saudação */}
        <div className="fu">
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', margin: '0 0 2px' }}>
            Olá,
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            {nome} ✨
          </h2>
        </div>

        {/* Hair Score */}
        {score !== null && (
          <div className="fu1" style={{ background: '#fff', borderRadius: 20, padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Hair Score atual
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontFamily: 'Times New Roman, serif', fontSize: 52, color: scoreCor, lineHeight: 1 }}>
                  {score}
                </span>
                <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', marginBottom: 6 }}>
                  /100
                </span>
              </div>
              <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, fontWeight: 700, color: scoreCor, background: `${scoreCor}15`, borderRadius: 99, padding: '4px 14px' }}>
                {label}
              </span>
            </div>

            {/* Mini barra */}
            <div style={{ height: 3, background: '#EFEFEF', borderRadius: 99, overflow: 'hidden', marginTop: 14 }}>
              <div style={{ height: '100%', width: `${score}%`, background: scoreCor, borderRadius: 99, transition: 'width 1s ease' }} />
            </div>
          </div>
        )}

        {/* Gráfico evolução */}
        {scores.length > 1 && (
          <div className="fu2" style={{ background: '#fff', borderRadius: 20, padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Evolução do Hair Score
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={scores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'Nunito Sans', fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'Nunito Sans', fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontFamily: 'Nunito Sans', fontSize: 12 }}
                  formatter={v => [`${v} pts`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="#1A1A1A" strokeWidth={2}
                  dot={{ fill: '#1A1A1A', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recomendações */}
        {recomendacoes.length > 0 && (
          <div className="fu3" style={{ background: '#fff', borderRadius: 20, padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Recomendações para você
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recomendacoes.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#F5F5F5', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${TIPO_ICON[rec.tipo] ?? 'fa-leaf'}`} style={{ fontSize: 13, color: '#1A1A1A' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{rec.tipo}</p>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRIORIDADE_COR[rec.prioridade] ?? '#6B6B6B', flexShrink: 0 }} />
                    </div>
                    <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', margin: 0, lineHeight: 1.5 }}>{rec.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {score === null && !loading && (
          <div className="fu1" style={{ background: '#fff', borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
            <i className="fa-solid fa-leaf" style={{ fontSize: 32, color: '#C0C0C0', marginBottom: 16, display: 'block' }} />
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
              Nenhum diagnóstico ainda
            </h3>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', marginBottom: 24, lineHeight: 1.6 }}>
              Faça seu primeiro diagnóstico capilar para começar sua jornada com o Lumi.
            </p>
            <a href="/questionario"
              style={{ display: 'inline-block', background: '#1A1A1A', color: '#fff', borderRadius: 50, padding: '14px 28px', fontSize: 14, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, textDecoration: 'none' }}>
              Iniciar diagnóstico
            </a>
          </div>
        )}

      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#fff', borderTop: '1px solid #EFEFEF', display: 'flex', padding: '12px 0 20px' }}>
        {[
          { icon: 'fa-house',       label: 'Home',        href: '/app/home'     },
          { icon: 'fa-clock-rotate-left', label: 'Histórico', href: '/app/historico' },
          { icon: 'fa-calendar',    label: 'Cronograma',  href: '/app/cronograma' },
          { icon: 'fa-user',        label: 'Perfil',      href: '/app/perfil'   },
        ].map((item, i) => {
          const ativo = window.location.pathname === item.href
          return (
            <a key={i} href={item.href}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              <i className={`fa-solid ${item.icon}`} style={{ fontSize: 18, color: ativo ? '#1A1A1A' : '#C0C0C0' }} />
              <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 10, color: ativo ? '#1A1A1A' : '#C0C0C0', fontWeight: ativo ? 700 : 400 }}>
                {item.label}
              </span>
            </a>
          )
        })}
      </div>

    </div>
  )
}
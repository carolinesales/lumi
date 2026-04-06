import { useEffect, useState } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
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

const DIAS_SEMANA = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Cronograma() {
  const { user }                        = useAuth()
  const [etapas, setEtapas]             = useState([])
  const [cronogramaId, setCronogramaId] = useState(null)
  const [mesAtual, setMesAtual]         = useState(new Date())
  const [loading, setLoading]           = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    async function carregar() {
      const cronSnap = await getDocs(query(collection(db, 'usuarios', user.uid, 'cronogramas'), orderBy('dataInicio', 'desc'), limit(1)))
      if (!cronSnap.empty) {
        const cronId = cronSnap.docs[0].id
        setCronogramaId(cronId)
        const etapasSnap = await getDocs(collection(db, 'usuarios', user.uid, 'cronogramas', cronId, 'etapas'))
        setEtapas(etapasSnap.docs.map(d => ({ id: d.id, cronogramaId: cronId, ...d.data() })))
      }
      setLoading(false)
    }
    carregar()
  }, [user])

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()
  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias   = new Date(ano, mes + 1, 0).getDate()
  const hoje        = new Date()

  const diasComEtapa = {}
  etapas.forEach(e => {
    if (e.dataEtapa) {
      const d = e.dataEtapa.toDate ? e.dataEtapa.toDate() : new Date(e.dataEtapa)
      if (d.getMonth() === mes && d.getFullYear() === ano) {
        diasComEtapa[d.getDate()] = e
      }
    }
  })

  const celulas = []
  for (let i = 0; i < primeiroDia; i++) celulas.push(null)
  for (let d = 1; d <= totalDias; d++) celulas.push(d)

  const etapasMes = etapas.filter(e => {
    if (!e.dataEtapa) return false
    const d = e.dataEtapa.toDate ? e.dataEtapa.toDate() : new Date(e.dataEtapa)
    return d.getMonth() === mes && d.getFullYear() === ano
  }).sort((a, b) => {
    const da = a.dataEtapa.toDate ? a.dataEtapa.toDate() : new Date(a.dataEtapa)
    const db_ = b.dataEtapa.toDate ? b.dataEtapa.toDate() : new Date(b.dataEtapa)
    return da - db_
  })

  const concluidas = etapas.filter(e => e.concluida).length
  const pct = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0

  const Sidebar = () => (
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
    </div>
  )

  const Conteudo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Calendário */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', border: '0.5px solid #E8E8E8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={() => setMesAtual(new Date(ano, mes - 1, 1))}
            style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-chevron-left" style={{ fontSize: 12, color: '#6B6B6B' }} />
          </button>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            {MESES[mes]} de {ano}
          </p>
          <button onClick={() => setMesAtual(new Date(ano, mes + 1, 1))}
            style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 12, color: '#6B6B6B' }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {DIAS_SEMANA.map(d => (
            <div key={d} style={{ textAlign: 'center', fontFamily: 'Nunito Sans, sans-serif', fontSize: 10, color: '#C0C0C0', fontWeight: 600, padding: '4px 0' }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
          {celulas.map((dia, i) => {
            if (!dia) return <div key={i} />
            const isToday = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()
            const etapa   = diasComEtapa[dia]
            return (
              <div key={i} onClick={() => etapa && navigate(`/app/etapa/${etapa.cronogramaId}/${etapa.id}`)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 2px', cursor: etapa ? 'pointer' : 'default' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isToday ? '#1A1A1A' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: isToday ? '#fff' : '#1A1A1A', fontWeight: isToday ? 700 : 400 }}>
                    {dia}
                  </span>
                </div>
                {etapa && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: etapa.concluida ? '#22c55e' : '#1A1A1A', marginTop: 2 }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progresso */}
      {etapas.length > 0 && (
        <div style={{ background: '#F5F5F5', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 16, border: '0.5px solid #E8E8E8' }}>
          <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#E8E8E8" strokeWidth="5" />
              <circle cx="28" cy="28" r="22" fill="none" stroke="#1A1A1A" strokeWidth="5"
                strokeDasharray={`${(pct / 100) * 138.2} 138.2`}
                strokeLinecap="round" strokeDashoffset="34.5"
                transform="rotate(-90 28 28)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{pct}%</p>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: '0 0 3px' }}>
              {concluidas} de {etapas.length} etapas concluídas
            </p>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', margin: 0 }}>
              {etapas.length - concluidas} etapas restantes
            </p>
          </div>
        </div>
      )}

      {/* Lista etapas do mês */}
      {etapasMes.length > 0 && (
        <div>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 10px' }}>
            Etapas de {MESES[mes]}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {etapasMes.map((etapa, i) => {
              const d = etapa.dataEtapa?.toDate ? etapa.dataEtapa.toDate() : null
              return (
                <div key={i} onClick={() => navigate(`/app/etapa/${etapa.cronogramaId}/${etapa.id}`)}
                  style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '0.5px solid #E8E8E8', cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: etapa.concluida ? '#F5F5F5' : '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${TIPO_ICON[etapa.tipoCuidado] ?? 'fa-droplet'}`} style={{ fontSize: 18, color: etapa.concluida ? '#C0C0C0' : '#fff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: etapa.concluida ? '#9B9B9B' : '#1A1A1A', margin: '0 0 4px', textDecoration: etapa.concluida ? 'line-through' : 'none' }}>
                      {etapa.tipoCuidado}
                    </p>
                    {d && (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#9B9B9B' }}>
                          <i className="fa-regular fa-calendar" style={{ marginRight: 4 }} />
                          {d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#9B9B9B' }}>
                          <i className="fa-regular fa-clock" style={{ marginRight: 4 }} />
                          {d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                  {etapa.concluida && (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 11, color: '#fff' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && etapas.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '32px 20px', textAlign: 'center', border: '0.5px solid #E8E8E8' }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>Nenhuma etapa ainda</p>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#9B9B9B' }}>Faça seu diagnóstico para gerar o cronograma.</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      <style>{`
        .cron-mobile  { display: flex }
        .cron-desktop { display: none }
        @media (min-width: 1024px) {
          .cron-mobile  { display: none }
          .cron-desktop { display: flex }
        }
      `}</style>

      {/* MOBILE */}
      <div className="cron-mobile" style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', flexDirection: 'column', paddingBottom: 100 }}>
        <div style={{ background: '#fff', padding: '52px 24px 16px', borderBottom: '0.5px solid #F0F0F0', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 26, color: '#1A1A1A', margin: 0 }}>Lumi</h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: '4px 0 0' }}>Cronograma</p>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <Conteudo />
        </div>
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
      </div>

      {/* DESKTOP */}
      <div className="cron-desktop" style={{ minHeight: '100vh', background: '#F5F5F5' }}>
        <Sidebar />
        <div style={{ marginLeft: 240, flex: 1, maxWidth: 800, padding: '40px 48px 80px' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A', margin: '0 0 24px' }}>Cronograma</h2>
          <Conteudo />
        </div>
      </div>
    </>
  )
}
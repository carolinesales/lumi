import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'

const TIPO_ICON = {
  Hidratação:   'fa-droplet',
  Nutrição:     'fa-leaf',
  Reconstrução: 'fa-wrench',
  Detox:        'fa-sparkles',
  Umectação:    'fa-jar',
  Lavagem:      'fa-pump-soap',
}

const TIPO_DESC = {
  Hidratação:   { curta: 'Reidrate seus fios para conquistar maciez e brilho.', longa: 'A hidratação é a base do cronograma capilar e a etapa mais essencial para manter os cabelos saudáveis. Ela repõe a água e os nutrientes essenciais, garantindo fios mais macios, brilhantes e maleáveis.' },
  Nutrição:     { curta: 'Reponha os óleos e combata o ressecamento.', longa: 'A nutrição é a etapa responsável por repor os lipídios (óleos naturais) do cabelo, criando uma barreira protetora que impede a perda de água e mantém os fios saudáveis.' },
  Reconstrução: { curta: 'Fortaleça os fios com proteínas e queratina.', longa: 'A reconstrução é a etapa do cronograma capilar que restaura a força e a estrutura dos fios, devolvendo as proteínas perdidas, principalmente a queratina.' },
  Detox:        { curta: 'Remova resíduos e regule a oleosidade do couro.', longa: 'O detox capilar limpa profundamente o couro cabeludo, removendo resíduos de produtos, excesso de sebo e impurezas que obstruem os folículos capilares.' },
  Umectação:    { curta: 'Hidrate profundamente com óleos e manteigas.', longa: 'A umectação é uma técnica de hidratação profunda que utiliza óleos e manteigas para tratar cabelos extremamente ressecados, especialmente eficaz quando feita à noite.' },
  Lavagem:      { curta: 'Lave os fios com o método indicado para seu tipo.', longa: 'A lavagem adequada é fundamental para remover impurezas sem agredir os fios. O método correto varia conforme o tipo de cabelo e os produtos utilizados.' },
}

export default function EtapaDetalhe() {
  const { cronogramaId, etapaId } = useParams()
  const { user }                  = useAuth()
  const navigate                  = useNavigate()
  const [etapa, setEtapa]         = useState(null)
  const [nota, setNota]           = useState('')
  const [loading, setLoading]     = useState(false)
  const [verMais, setVerMais]     = useState(false)
  const [sucesso, setSucesso]     = useState(false)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas', etapaId))
      .then(snap => { if (snap.exists()) { setEtapa({ id: snap.id, ...snap.data() }); } })
  }, [user, cronogramaId, etapaId])

  async function marcarConcluido() {
    setLoading(true)
    try {
      await updateDoc(doc(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas', etapaId), {
        concluida: true, nota, concluidaEm: new Date(),
      })
      setSucesso(true)
      setTimeout(() => navigate('/app/cronograma'), 1800)
    } finally { setLoading(false) }
  }

  async function pular() {
    await updateDoc(doc(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas', etapaId), { pulada: true })
    navigate('/app/cronograma')
  }

  if (!etapa) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F5' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#1A1A1A' }} />
    </div>
  )

  const desc      = TIPO_DESC[etapa.tipoCuidado] ?? { curta: '', longa: '' }
  const dataEtapa = etapa.dataEtapa?.toDate ? etapa.dataEtapa.toDate() : null
  const isHoje    = dataEtapa ? (() => {
    const h = new Date()
    return dataEtapa.getDate() === h.getDate() && dataEtapa.getMonth() === h.getMonth() && dataEtapa.getFullYear() === h.getFullYear()
  })() : false

  if (sucesso) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, maxWidth: 430, margin: '0 auto' }}>
      <style>{`@keyframes popIn { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }`}</style>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'popIn .5s ease forwards' }}>
        <i className="fa-solid fa-check" style={{ fontSize: 36, color: '#fff' }} />
      </div>
      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Etapa concluída!</p>
      <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#9B9B9B', margin: 0 }}>Seus fios agradecem.</p>
    </div>
  )

  const Conteudo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Por que é importante */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '0.5px solid #E8E8E8' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Por que é importante
        </h2>
        <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#6B6B6B', lineHeight: 1.7, margin: 0 }}>
          {verMais ? desc.longa : desc.curta}
        </p>
        <button onClick={() => setVerMais(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#1A1A1A', padding: '8px 0 0', textDecoration: 'underline' }}>
          {verMais ? 'Ver menos' : 'Ver explicação detalhada'}
        </button>
      </div>

      {/* Data */}
      {dataEtapa && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
          <i className="fa-regular fa-calendar" style={{ fontSize: 14, color: '#9B9B9B' }} />
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', margin: 0 }}>
            {isHoje ? 'Hoje' : dataEtapa.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            {' · '}
            {dataEtapa.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Atenção */}
      {!isHoje && !etapa.concluida && (
        <div style={{ background: '#F5F5F5', borderRadius: 12, padding: '16px', border: '0.5px solid #E8E8E8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 14, color: '#f59e0b' }} />
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Atenção</p>
          </div>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, margin: '0 0 12px' }}>
            Esta <strong>não é a etapa atual</strong> do seu cronograma capilar.
          </p>
          <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '0.5px solid #E8E8E8' }}>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 6, color: '#9B9B9B' }} />
              Finalize as etapas anteriores para garantir o melhor resultado no tratamento dos seus fios.
            </p>
          </div>
        </div>
      )}

      {/* Já concluída */}
      {etapa.concluida && (
        <div style={{ background: '#F5F5F5', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, border: '0.5px solid #E8E8E8' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fa-solid fa-check" style={{ fontSize: 13, color: '#fff' }} />
          </div>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#16a34a', fontWeight: 600, margin: 0 }}>
            Etapa concluída com sucesso.
          </p>
        </div>
      )}

      {/* Nota */}
      {!etapa.concluida && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '0.5px solid #E8E8E8' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
            Adicionar nota
          </h3>
          <div style={{ position: 'relative' }}>
            <textarea value={nota} onChange={e => setNota(e.target.value)}
              placeholder="Escreva sua nota aqui..."
              rows={4}
              style={{ width: '100%', background: '#F5F5F5', border: '0.5px solid #E8E8E8', borderRadius: 12, padding: '14px 16px', fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#1A1A1A', outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
          </div>
        </div>
      )}

      {/* Nota salva */}
      {etapa.concluida && etapa.nota && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '0.5px solid #E8E8E8' }}>
          <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Nota</h3>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', background: '#F5F5F5', borderRadius: 10, padding: '12px 14px', margin: 0, lineHeight: 1.6 }}>
            {etapa.nota}
          </p>
        </div>
      )}

      {/* Botões */}
      {!etapa.concluida && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={marcarConcluido} disabled={loading}
            style={{ width: '100%', height: 52, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 26, fontFamily: 'Nunito Sans, sans-serif', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition: 'all .2s' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14 }} />
                Salvando...
              </span>
            ) : 'Marcar como Concluído'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={pular}
              style={{ flex: 1, height: 48, background: '#F5F5F5', color: '#1A1A1A', border: '0.5px solid #E8E8E8', borderRadius: 24, fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Pular
            </button>
            <button
              style={{ flex: 1, height: 48, background: '#F5F5F5', color: '#1A1A1A', border: '0.5px solid #E8E8E8', borderRadius: 24, fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Reagendar
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <>
      <style>{`
        .etapa-mobile  { display: flex }
        .etapa-desktop { display: none }
        @media (min-width: 1024px) {
          .etapa-mobile  { display: none }
          .etapa-desktop { display: flex }
        }
      `}</style>

      {/* MOBILE */}
      <div className="etapa-mobile" style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: '#1A1A1A', padding: '52px 24px 28px', position: 'relative' }}>
          <button onClick={() => navigate('/app/cronograma')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, position: 'absolute', top: 52, left: 24 }}>
            <i className="fa-solid fa-chevron-left" style={{ fontSize: 18, color: '#fff' }} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`fa-solid ${TIPO_ICON[etapa.tipoCuidado] ?? 'fa-droplet'}`} style={{ fontSize: 24, color: '#fff' }} />
            </div>
            <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>
              {etapa.tipoCuidado}
            </h1>
          </div>
        </div>
        <div style={{ flex: 1, background: '#F5F5F5', borderRadius: '24px 24px 0 0', marginTop: -16, padding: '24px 24px 40px' }}>
          <Conteudo />
        </div>
      </div>

      {/* DESKTOP */}
      <div className="etapa-desktop" style={{ minHeight: '100vh', background: '#F5F5F5' }}>
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
              const ativo = window.location.pathname.startsWith('/app/etapa') && item.href === '/app/cronograma'
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

        {/* Conteúdo */}
        <div style={{ marginLeft: 240, flex: 1, maxWidth: 800, padding: '40px 48px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <button onClick={() => navigate('/app/cronograma')}
              style={{ background: '#fff', border: '0.5px solid #E8E8E8', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-chevron-left" style={{ fontSize: 13, color: '#1A1A1A' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fa-solid ${TIPO_ICON[etapa.tipoCuidado] ?? 'fa-droplet'}`} style={{ fontSize: 20, color: '#fff' }} />
              </div>
              <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                {etapa.tipoCuidado}
              </h2>
            </div>
          </div>
          <Conteudo />
        </div>
      </div>
    </>
  )
}
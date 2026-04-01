import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PRIORIDADE_COR = {
  Alta:  { bg: 'rgba(220,50,50,0.07)',   color: '#dc3232',  border: 'rgba(220,50,50,0.2)'   },
  Média: { bg: 'rgba(212,165,116,0.12)', color: '#b07830',  border: 'rgba(212,165,116,0.3)' },
  Baixa: { bg: 'rgba(76,175,80,0.07)',   color: '#2e7d32',  border: 'rgba(76,175,80,0.2)'   },
}

const TIPO_ICON = {
  Hidratação:   'fa-droplet',
  Nutrição:     'fa-leaf',
  Reconstrução: 'fa-wrench',
  Detox:        'fa-sparkles',
  Manutenção:   'fa-heart',
}

export default function Resultado() {
  const [resultado, setResultado]       = useState(null)
  const [scoreAnimado, setScoreAnimado] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const data = sessionStorage.getItem('lumi_resultado')
    if (!data) { navigate('/questionario'); return }
    const parsed = JSON.parse(data)
    setResultado(parsed)

    let current = 0
    const target = parsed.pontuacao
    const inc    = Math.ceil(target / 50)
    const timer  = setInterval(() => {
      current += inc
      if (current >= target) { setScoreAnimado(target); clearInterval(timer) }
      else setScoreAnimado(current)
    }, 30)
    return () => clearInterval(timer)
  }, [navigate])

  if (!resultado) return null

  const { pontuacao, classificacao, diagnostico, recomendacoes, cronograma } = resultado

  // Gauge semicircular
  const angulo = -90 + (pontuacao / 100) * 180
  const rad    = (angulo * Math.PI) / 180
  const r = 68, cx = 90, cy = 90
  const px = cx + r * Math.cos(rad)
  const py = cy + r * Math.sin(rad)

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation: fadeUp .5s ease both }
        .fu1 { animation: fadeUp .5s .1s ease both }
        .fu2 { animation: fadeUp .5s .2s ease both }
        .fu3 { animation: fadeUp .5s .3s ease both }
        .fu4 { animation: fadeUp .5s .4s ease both }
      `}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 8 }}>
        <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', letterSpacing: 1 }}>
          Lumi
        </h1>
      </div>

      <div style={{ flex: 1, padding: '16px 24px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div className="fu">
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', margin: '0 0 4px' }}>
            Seu diagnóstico
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            Resultado capilar
          </h2>
        </div>

        {/* Hair Score */}
        <div className="fu1" style={{ background: '#fff', borderRadius: 20, padding: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Hair Score
          </p>

          <svg viewBox="0 0 180 100" style={{ width: 180, margin: '0 auto', display: 'block' }}>
            {/* Trilha */}
            <path d="M 22 90 A 68 68 0 0 1 158 90"
              fill="none" stroke="#EFEFEF" strokeWidth="12" strokeLinecap="round" />
            {/* Preenchimento */}
            <path d="M 22 90 A 68 68 0 0 1 158 90"
              fill="none" stroke={classificacao.cor} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${(pontuacao / 100) * 213} 213`} />
            {/* Ponteiro */}
            <circle cx={px} cy={py} r="5" fill={classificacao.cor} />
            {/* Score */}
            <text x="90" y="82" textAnchor="middle"
              style={{ fontFamily: 'Times New Roman, serif', fontSize: 38, fontWeight: 600, fill: '#1A1A1A' }}>
              {scoreAnimado}
            </text>
          </svg>

          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
            de 100 pontos
          </p>
          <div style={{ display: 'inline-block', marginTop: 8, padding: '4px 16px', borderRadius: 99, background: `${classificacao.cor}15` }}>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, fontWeight: 700, color: classificacao.cor, margin: 0 }}>
              {classificacao.label}
            </p>
          </div>
        </div>

        {/* Diagnóstico */}
        <div className="fu2" style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Diagnóstico principal
          </p>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>
            {diagnostico.tratamentos[0] !== 'manutenção'
              ? `Necessidade de ${diagnostico.tratamentos.join(' e ')}`
              : 'Manutenção da saúde capilar'}
          </h3>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>
            {diagnostico.resultadoPrincipal}
          </p>
        </div>

        {/* Recomendações */}
        <div className="fu3" style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Tratamentos recomendados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recomendacoes.map((rec, i) => {
              const cor = PRIORIDADE_COR[rec.prioridade]
              return (
                <div key={i} style={{ background: '#F5F5F5', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fa-solid ${TIPO_ICON[rec.tipo] ?? 'fa-leaf'}`} style={{ fontSize: 14, color: '#1A1A1A' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                        {rec.tipo}
                      </p>
                      <span style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, fontWeight: 700, color: cor.color, background: cor.bg, border: `1px solid ${cor.border}`, borderRadius: 99, padding: '2px 10px' }}>
                        {rec.prioridade}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', margin: 0, lineHeight: 1.5 }}>
                      {rec.descricao}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cronograma semana 1 */}
        <div className="fu4" style={{ background: '#fff', borderRadius: 20, padding: 20 }}>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Cronograma — semana 1
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cronograma.semanas[0]?.etapas.map((etapa, i) => (
              <div key={i} style={{ background: i % 2 === 0 ? '#F5F5F5' : '#EFEFEF', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                  {etapa.dia}
                </p>
                <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', margin: 0 }}>
                  {etapa.tipo}
                </p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', marginTop: 12, marginBottom: 0 }}>
            <i className="fa-solid fa-droplet" style={{ marginRight: 6, color: '#1A1A1A' }} />
            Lavagem recomendada: {cronograma.frequenciaLavagem}
          </p>
        </div>

        {/* CTA */}
        <button onClick={() => navigate('/app/home')}
          style={{ width: '100%', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 50, padding: '16px 24px', fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
          Ir para o meu painel
          <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8, fontSize: 13 }} />
        </button>

      </div>
    </div>
  )
}
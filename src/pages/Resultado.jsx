import { useEffect, useMemo, useState } from 'react'
import { useNavigate }                   from 'react-router-dom'
import { useIdioma }                     from '@/contexts/IdiomaContext'
import { Button }                        from '@/components/ui/button'
import { cn }                            from '@/lib/utils'

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPO_ICON = {
  Hidratação:   'fa-droplet',
  Nutrição:     'fa-leaf',
  Reconstrução: 'fa-wrench',
  Detox:        'fa-star',
  Manutenção:   'fa-heart',
}

const TIPO_SOFT = {
  Hidratação:   { soft: '#EEF4FF', ink: '#3A5FA0' },
  Nutrição:     { soft: '#EEF5E8', ink: '#4A6E3A' },
  Reconstrução: { soft: '#F5F0FF', ink: '#6A4E98' },
  Detox:        { soft: '#E8F6F4', ink: '#3A7068' },
  Manutenção:   { soft: '#FBF4E6', ink: '#7A5A10' },
}

const PRIO_COR = {
  Alta:  { bg: '#FCEBEB', ink: '#dc3232' },
  Média: { bg: '#FAEEDA', ink: '#b07830' },
  Baixa: { bg: '#EAF3DE', ink: '#2e7d32' },
}

const GAUGE_ARC_LEN = 213

function gaugePoint(score) {
  const rad = ((-90 + (score / 100) * 180) * Math.PI) / 180
  return { px: 90 + 68 * Math.cos(rad), py: 90 + 68 * Math.sin(rad) }
}

// ─── Gauge ────────────────────────────────────────────────────────────────────

function ScoreGauge({ score, cor }) {
  const { px, py } = useMemo(() => gaugePoint(score), [score])
  const dash = `${(score / 100) * GAUGE_ARC_LEN} ${GAUGE_ARC_LEN}`
  return (
    <svg viewBox="0 0 180 100" className="mx-auto block w-[180px] overflow-visible"
      aria-label={`Hair Score: ${score}`}>
      <path d="M 22 90 A 68 68 0 0 1 158 90"
        fill="none" stroke="#EBEBEB" strokeWidth="10" strokeLinecap="round" />
      <path d="M 22 90 A 68 68 0 0 1 158 90"
        fill="none" stroke={cor} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={dash} />
      <circle cx={px} cy={py} r="5" fill={cor} />
      <text x="90" y="80" textAnchor="middle"
        fontFamily="Montserrat, sans-serif" fontSize="38" fontWeight="300" fill="#171614">
        {score}
      </text>
    </svg>
  )
}

// ─── Componentes locais ───────────────────────────────────────────────────────

function SecLabel({ children }) {
  return (
    <span className="mb-3 block font-nunito text-[9px] font-bold uppercase tracking-[.18em] text-[#8A8880]">
      {children}
    </span>
  )
}

function Card({ children, className }) {
  return (
    <div className={cn('rounded-[22px] border border-[#EBEBEB] bg-white p-5', className)}>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Resultado() {
  const { t }    = useIdioma()
  const navigate = useNavigate()

  const [resultado,    setResultado]    = useState(null)
  const [scoreAnimado, setScoreAnimado] = useState(0)

  useEffect(() => {
    const data = sessionStorage.getItem('lumi_resultado')
    if (!data) { navigate('/questionario'); return }
    const parsed = JSON.parse(data)
    setResultado(parsed)

    let cur = 0
    const tgt = parsed.pontuacao
    const inc = Math.ceil(tgt / 50)
    const timer = setInterval(() => {
      cur += inc
      if (cur >= tgt) { setScoreAnimado(tgt); clearInterval(timer) }
      else setScoreAnimado(cur)
    }, 30)
    return () => clearInterval(timer)
  }, [navigate])

  if (!resultado) return null

  const { pontuacao, classificacao, diagnostico, recomendacoes, cronograma } = resultado

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#F7F5F1]">

      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EBEBEB] bg-[#F7F5F1]/95 px-5 pb-3.5 pt-14 backdrop-blur-md">
        <h1 className="font-serif text-2xl italic font-normal text-[#171614]">Lumi</h1>
        <span className="font-heading text-sm font-medium text-[#8A8880]">{t('res_titulo')}</span>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-12 pt-4">

        {/* Hair Score */}
        <Card className="lumi-animate-in text-center">
          <SecLabel>{t('home_hair_score')}</SecLabel>
          <ScoreGauge score={scoreAnimado} cor={classificacao.cor ?? '#171614'} />
          <p className="mb-2 mt-1 font-nunito text-[11px] text-[#8A8880]">{t('res_de_100')}</p>
          <span
            className="inline-block rounded-full px-4 py-1.5 font-heading text-xs font-bold"
            style={{ background: `${classificacao.cor ?? '#171614'}18`, color: classificacao.cor ?? '#171614' }}
          >
            {classificacao.label}
          </span>
        </Card>

        {/* Diagnóstico */}
        <Card className="lumi-animate-in" style={{ animationDelay: '.06s' }}>
          <SecLabel>{t('res_diagnostico_titulo')}</SecLabel>
          <h2 className="mb-2 font-heading text-base font-medium tracking-tight text-[#171614]">
            {diagnostico.tratamentos[0] !== 'manutenção'
              ? `${t('res_necessidade')} ${diagnostico.tratamentos.join(` ${t('res_e')} `)}`
              : t('res_manutencao')}
          </h2>
          <p className="font-nunito text-sm leading-relaxed text-[#8A8880]">
            {diagnostico.resultadoPrincipal}
          </p>
        </Card>

        {/* Recomendações */}
        <Card className="lumi-animate-in" style={{ animationDelay: '.12s' }}>
          <SecLabel>{t('res_tratamentos')}</SecLabel>
          <div className="flex flex-col">
            {recomendacoes.map((rec, i) => {
              const cor   = PRIO_COR[rec.prioridade]  ?? PRIO_COR.Baixa
              const tipoS = TIPO_SOFT[rec.tipo]        ?? { soft: '#F5F3EE', ink: '#5A5850' }
              return (
                <div key={i} className={cn(
                  'flex gap-3 py-3',
                  i < recomendacoes.length - 1 && 'border-b border-[#EBEBEB]',
                )}>
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-sm"
                    style={{ background: tipoS.soft, color: tipoS.ink }}
                  >
                    <i className={cn('fa-solid', TIPO_ICON[rec.tipo] ?? 'fa-leaf')} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-heading text-sm font-semibold text-[#171614]">{rec.tipo}</span>
                      <span
                        className="rounded-full px-2.5 py-0.5 font-nunito text-[10px] font-bold"
                        style={{ background: cor.bg, color: cor.ink }}
                      >
                        {rec.prioridade}
                      </span>
                    </div>
                    <p className="font-nunito text-xs leading-relaxed text-[#8A8880]">{rec.descricao}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Cronograma semana 1 */}
        <Card className="lumi-animate-in" style={{ animationDelay: '.18s' }}>
          <SecLabel>{t('res_cronograma')}</SecLabel>
          <div className="flex flex-col">
            {cronograma.semanas[0]?.etapas.map((etapa, i) => (
              <div key={i} className={cn(
                'flex items-center justify-between py-2.5',
                i < cronograma.semanas[0].etapas.length - 1 && 'border-b border-[#F5F5F5]',
              )}>
                <span className="font-heading text-sm font-medium text-[#171614]">{etapa.dia}</span>
                <span className="font-nunito text-xs text-[#8A8880]">{etapa.tipo}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 font-nunito text-[11px] text-[#C0BEB8]">
            <i className="fa-solid fa-droplet text-[10px] text-[#171614]" aria-hidden="true" />
            {t('res_lavagem')} {cronograma.frequenciaLavagem}
          </p>
        </Card>

        {/* CTA */}
        <div className="lumi-animate-in pt-1" style={{ animationDelay: '.24s' }}>
          <Button size="lg" className="w-full justify-between" onClick={() => navigate('/app/home')}>
            {t('res_cta')}
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </Button>
        </div>

      </div>
    </div>
  )
}
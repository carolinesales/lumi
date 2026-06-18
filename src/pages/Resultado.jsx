import { useEffect, useMemo, useState } from 'react'
import { useNavigate }                   from 'react-router-dom'
import { useIdioma }                     from '@/contexts/IdiomaContext'
import { Button }                        from '@/components/ui/button'
import { cn }                            from '@/lib/utils'
import AppShell                          from '@/components/lumi/AppShell'
import ilustracaoPronto                  from '@/assets/Reminder.png'
import { labelTipo }                     from '@/features/cronograma/lib/calendar'

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPO_ICON = {
  Hidratação:      'fa-droplet',
  Nutrição:        'fa-leaf',
  Reconstrução:    'fa-wrench',
  Detox:           'fa-star',
  Manutenção:      'fa-heart',
  'Pausa Técnica': 'fa-hand',
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
  const dash = `${(score / 100) * GAUGE_ARC_LEN} ${GAUGE_ARC_LEN}`
  return (
    <svg viewBox="0 0 180 100" className="mx-auto block w-[180px]"
      aria-label={`Hair Score: ${score}`}>
      <path d="M 22 90 A 68 68 0 0 1 158 90"
        fill="none" stroke="var(--paper-200, #EBEBEB)" strokeWidth="10" strokeLinecap="round" />
      <path d="M 22 90 A 68 68 0 0 1 158 90"
        fill="none" stroke={cor} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={dash} />
      <text x="90" y="80" textAnchor="middle"
        fontFamily="Montserrat, sans-serif" fontSize="38" fontWeight="300" fill="var(--text-primary, #171614)">
        {score}
      </text>
    </svg>
  )
}

// ─── Componentes locais ───────────────────────────────────────────────────────

function SecLabel({ children }) {
  return (
    <span className="mb-3 block font-['Montserrat'] text-base font-semibold text-text">
      {children}
    </span>
  )
}

function Card({ children, className }) {
  return (
    <div className={cn('rounded-[22px] border border-paper-200 bg-surface p-5', className)}>
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
    <AppShell>
      <main className="min-h-screen bg-surface-muted px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="mx-auto max-w-[1320px]">
        <header className="mb-5 sm:mb-8">
          <h1 className="font-['Montserrat'] text-xl font-semibold leading-[40px] text-text sm:text-2xl">{t('res_titulo')}</h1>
          <p className="mt-1 font-['Nunito_Sans'] text-sm leading-5 text-text-secondary">{t('res_subtitulo')}</p>
        </header>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">

          {/* Coluna principal */}
          <div className="flex flex-col gap-3 xl:w-[738px]">

        {/* Hair Score */}
        <Card className="lumi-animate-in text-center">
          <SecLabel>Lumi Score</SecLabel>
          <ScoreGauge score={scoreAnimado} cor={classificacao.cor ?? '#171614'} />
          <p className="mb-2 mt-3 font-nunito text-[11px] text-text-secondary">{t('res_de_100')}</p>
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
          <h2 className="mb-2 font-heading text-base font-medium tracking-tight text-text">
            {diagnostico.tratamentos[0] !== 'manutenção'
              ? `${t('res_necessidade')} ${diagnostico.tratamentos.join(` ${t('res_e')} `)}`
              : t('res_manutencao')}
          </h2>
          <p className="font-nunito text-sm leading-relaxed text-text-secondary">
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
                  i < recomendacoes.length - 1 && 'border-b border-paper-200',
                )}>
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-sm"
                    style={{ background: tipoS.soft, color: tipoS.ink }}
                  >
                    <i className={cn('fa-solid', TIPO_ICON[rec.tipo] ?? 'fa-leaf')} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-heading text-sm font-semibold text-text">{rec.tipo}</span>
                      <span
                        className="rounded-full px-2.5 py-0.5 font-nunito text-[10px] font-bold"
                        style={{ background: cor.bg, color: cor.ink }}
                      >
                        {rec.prioridade}
                      </span>
                    </div>
                    <p className="font-nunito text-xs leading-relaxed text-text-secondary">{rec.descricao}</p>
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
                'flex items-center justify-between py-4',
                i < cronograma.semanas[0].etapas.length - 1 && 'border-b border-paper-200',
              )}>
                <span className="font-heading text-sm font-medium text-text">{etapa.dia}</span>
                <span className="font-nunito text-xs text-text-secondary">{labelTipo(etapa.tipo, t)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-surface-subtle p-4">
            <span className="mb-1.5 block font-['Montserrat'] text-sm font-semibold text-text">{t('ht_insights')}</span>
            <p className="font-nunito text-sm leading-5 text-text-secondary">
              {t('res_lavagem')} {cronograma.frequenciaLavagem}
            </p>
          </div>
        </Card>

          </div>

          {/* Coluna lateral */}
          <div className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col items-center gap-6 rounded-[16px] bg-surface p-6">
              <div className="flex w-full flex-col items-center gap-2">
                <img src={ilustracaoPronto} alt="" aria-hidden="true" className="size-[200px] object-contain" />
                <div className="flex w-full flex-col gap-2">
                  <p className="font-['Montserrat'] text-base font-semibold text-text">{t('res_pronto_titulo')}</p>
                  <p className="font-['Nunito_Sans'] text-sm leading-5 text-text-secondary">
                    {t('res_pronto_texto')}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => navigate('/app/home')}
                className="w-full rounded-[24px] bg-ink py-3 font-['Nunito_Sans'] text-sm font-semibold text-white transition hover:opacity-90">
                {t('res_painel')}
              </button>
            </div>
          </div>

        </div>
      </div>
      </main>
    </AppShell>
  )
}
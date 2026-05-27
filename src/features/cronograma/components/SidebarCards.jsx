import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { getTreatment, toDate } from '../lib/calendar'
import { cn } from '@/lib/utils'
import ilustracaoVazia from '@/assets/Milestone-4_Streamline_Milano.svg'

// ─── Shared ───────────────────────────────────────────────────────────────────

function Card({ children, className }) {
  return (
    <div className={cn('flex flex-col gap-4 rounded-[24px] border border-lumi-border bg-white p-6', className)}>
      {children}
    </div>
  )
}

function CardHeader({ title, subtitle }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-['Montserrat'] text-base font-semibold text-lumi-black">{title}</p>
      {subtitle && (
        <p className="font-nunito text-sm text-lumi-secondary">{subtitle}</p>
      )}
    </div>
  )
}

function StatusBadge({ concluida }) {
  return (
    <span className={cn(
      "shrink-0 rounded-[24px] px-4 py-1.5 font-nunito text-xs font-semibold text-white",
      concluida ? 'bg-emerald-500' : 'bg-lumi-black',
    )}>
      {concluida ? 'Feito' : 'Iniciar'}
    </span>
  )
}

// ─── TodayCard ────────────────────────────────────────────────────────────────

export function TodayCard({ etapa, dateLabel, onOpen, onObservacao }) {
  if (!etapa) return <TodayCardEmpty dateLabel={dateLabel} onObservacao={onObservacao} />

  const t = getTreatment(etapa.tipoCuidado)

  return (
    <Card className="gap-3">
      <CardHeader title="Em foco hoje" subtitle={dateLabel} />
      <button
        type="button"
        onClick={() => onOpen(etapa)}
        className="flex w-full items-center gap-3 text-left transition hover:opacity-80"
      >
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', t.iconBg)}>
          <i className={cn('fa-solid text-sm', t.icon, t.iconColor)} />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-nunito text-sm font-semibold text-lumi-black">{etapa.tipoCuidado}</span>
          <span className="font-nunito text-xs text-lumi-gray">
            {etapa.concluida ? 'Concluído' : 'Pendente'}
          </span>
        </div>
        <StatusBadge concluida={etapa.concluida} />
      </button>
    </Card>
  )
}

function TodayCardEmpty({ dateLabel, onObservacao }) {
  return (
    <Card>
      <CardHeader title="Em foco hoje" subtitle={dateLabel} />
      <div className="flex flex-col items-center gap-6 rounded-[20px] border border-lumi-border p-6">
        <img
          src={ilustracaoVazia}
          alt="Nenhum cuidado programado"
          className="h-[180px] w-[180px] object-contain"
        />
        <div className="flex flex-col items-center gap-2">
          <p className="text-center font-['Montserrat'] text-sm font-semibold text-lumi-secondary">
            Nenhum cuidado programado
          </p>
          <p className="text-center font-nunito text-xs leading-5 text-lumi-secondary">
            Aproveite para observar seus fios e registrar como eles estão
          </p>
        </div>
        <button
          type="button"
          onClick={onObservacao}
          className="w-full rounded-[24px] bg-lumi-black py-3 font-nunito text-xs font-semibold text-white transition hover:opacity-90"
        >
          Registrar observação
        </button>
      </div>
    </Card>
  )
}

// ─── UpcomingCard ─────────────────────────────────────────────────────────────

export function UpcomingCard({ etapas, onOpen }) {
  return (
    <Card>
      <CardHeader
        title="Próximas etapas"
        subtitle="Seu ciclo continua nos próximos dias"
      />

      {etapas.length === 0 ? (
        <p className="font-nunito text-sm text-lumi-gray">Nenhuma etapa pendente.</p>
      ) : (
        <div className="flex flex-col divide-y divide-[#F5F5F5]">
          {etapas.map(etapa => {
            const data = toDate(etapa.dataEtapa)
            const t    = getTreatment(etapa.tipoCuidado)
            return (
              <button
                key={etapa.id}
                type="button"
                onClick={() => onOpen(etapa)}
                className="flex items-center gap-3 py-3 text-left transition hover:opacity-70 first:pt-0 last:pb-0"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', t.iconBg)}>
                  <i className={cn('fa-solid text-sm', t.icon, t.iconColor)} />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-nunito text-sm font-semibold text-lumi-black">
                    {etapa.tipoCuidado}
                  </span>
                  <span className="font-nunito text-xs text-lumi-gray">
                    {data?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <ChevronRight size={16} className="shrink-0 text-lumi-gray" />
              </button>
            )
          })}
        </div>
      )}
    </Card>
  )
}

// ─── ProgressCard ─────────────────────────────────────────────────────────────

export function ProgressCard({ concluidas, total, etapas }) {
  const resumo = useMemo(() => {
    const map = {}
    etapas.forEach(e => {
      const tipo = e.tipoCuidado || 'Outros'
      if (!map[tipo]) map[tipo] = { total: 0, done: 0 }
      map[tipo].total++
      if (e.concluida) map[tipo].done++
    })
    return Object.entries(map).slice(0, 4)
  }, [etapas])

  return (
    <Card>
      <CardHeader
        title="Progresso do ciclo"
        subtitle={`${concluidas} de ${total} etapas concluídas`}
      />

      <div className="flex flex-col gap-4">
        {resumo.map(([tipo, item]) => {
          const t   = getTreatment(tipo)
          const pct = item.total ? Math.round((item.done / item.total) * 100) : 0
          return (
            <div key={tipo} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-nunito text-sm font-semibold text-lumi-black">{tipo}</span>
                <span className="font-nunito text-xs text-lumi-gray">{item.done}/{item.total}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-lumi-input">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', t.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
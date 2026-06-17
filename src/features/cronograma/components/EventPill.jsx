import { getTreatment } from '../lib/calendar'
import { cn } from '@/lib/utils'

// Pill usado na visualização do Mês (desktop)
 
export function EventPill({ etapa, onClick, faded = false }) {
  const t = getTreatment(etapa.tipoCuidado)

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderLeft: `2.5px solid ${t.hex}` }}
      className={cn(
        'flex w-full items-center rounded-sm px-2 py-0.5 text-left transition hover:opacity-70',
        t.pillBg,
        faded && 'opacity-30',
        etapa.concluida && !faded && 'opacity-50',
      )}
    >
      <span className={cn(
        "truncate font-nunito text-[11px] font-medium",
        t.pillText,
        etapa.concluida && 'line-through',
      )}>
        {etapa.tipoCuidado}
      </span>
    </button>
  )
}

//Card usado na visualização da Semana
 
export function WeekEventPill({ etapa, onClick }) {
  const t = getTreatment(etapa.tipoCuidado)

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderLeft: `2.5px solid ${t.hex}` }}
      className={cn(
        'flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-left transition hover:opacity-80',
        t.pillBg,
        etapa.concluida && 'opacity-50',
      )}
    >
      <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', t.iconBg)}>
        <i className={cn('fa-solid text-[9px]', t.icon, t.iconColor)} />
      </div>
      <div className="flex flex-col">
        <span className={cn("font-nunito text-xs font-semibold", t.pillText, etapa.concluida && 'line-through')}>
          {etapa.tipoCuidado}
        </span>
        <span className="font-nunito text-[10px] text-lumi-gray">
          {etapa.concluida ? 'Concluído' : 'Pendente'}
        </span>
      </div>
    </button>
  )
}
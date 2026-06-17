// src/features/home/components/WeekCalendar.jsx
import { forwardRef, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// célula individual do dia

const DiaCell = forwardRef(function DiaCell({ dia, temEtapa, onClick }, ref) {
  const isHoje = dia.isHoje

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={`${dia.wd} ${dia.n}${temEtapa ? ' – etapa agendada' : ''}`}
      className={cn(
        'mx-1 flex min-w-[52px] shrink-0 flex-col items-center gap-1.5 rounded-full px-1 py-2.5 transition-colors duration-150',
        isHoje
          ? 'bg-ink'
          : temEtapa
          ? 'cursor-pointer bg-surface hover:bg-paper-150'
          : 'cursor-default bg-surface',
      )}
    >
      {/* Dia da semana */}
      <span className={cn(
        'font-nunito text-[11px] font-medium lowercase leading-none',
        isHoje ? 'text-white/60' : 'text-text-secondary',
      )}>
        {dia.wd}
      </span>

      {/* Número */}
      <span className={cn(
        'font-nunito text-sm font-semibold leading-none',
        isHoje ? 'text-white' : 'text-text',
      )}>
        {dia.n}
      </span>

      {/* espaço fixo para manter altura */}
      <span className="flex h-3.5 items-center justify-center">
        {temEtapa ? (
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
            <path
              d="M5 0C5 0 0 5.8 0 8.5C0 11.538 2.239 14 5 14C7.761 14 10 11.538 10 8.5C10 5.8 5 0 5 0Z"
              fill={isHoje ? '#FFFFFF' : '#7698D1'}
            />
          </svg>
        ) : (
          <span className="h-3.5 w-2.5" aria-hidden="true" />
        )}
      </span>
    </button>
  )
})

// calendario semanal

export default function WeekCalendar({ semana = [], getEtapaDia, onOpenEtapa }) {
  const scrollRef = useRef(null)
  const hojeRef   = useRef(null)

  useEffect(() => {
    const container = scrollRef.current
    const el        = hojeRef.current
    if (!container || !el) return
    const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    container.scrollLeft = Math.max(0, left)
  }, [semana])

  const diaRef      = semana.find(d => d.isHoje) ?? semana[0]
  const mesAnoLabel = diaRef
    ? diaRef.date
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase())
    : ''

  return (
    <div className="flex flex-col gap-4 self-stretch py-3.5">

      {/* Mês */}
      <span className="px-6 font-nunito text-[13px] font-medium leading-none text-text-secondary">
        {mesAnoLabel}
      </span>

      {/* Row de dias */}
      <div
        ref={scrollRef}
        className="flex items-start overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {semana.map((dia, i) => {
          const etapa    = getEtapaDia?.(dia)
          const temEtapa = Boolean(etapa)
          return (
            <DiaCell
              key={i}
              ref={dia.isHoje ? hojeRef : null}
              dia={dia}
              temEtapa={temEtapa}
              onClick={() => temEtapa && onOpenEtapa?.(etapa)}
            />
          )
        })}
      </div>
    </div>
  )
}
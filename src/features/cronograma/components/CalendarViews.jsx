import { ChevronRight } from 'lucide-react'
import { isSameDay, getWeekDays, getTreatment, WEEK_DAYS } from '../lib/calendar'
import { EventPill, WeekEventPill } from './EventPill'
import { cn } from '@/lib/utils'

// ─── Month View ───────────────────────────────────────────────────────────────

export function MonthView({ calendarioMes, hoje, getEtapasDoDia, onAbrirEtapa, onAbrirDia }) {
  return (
    <>
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-t border-b border-lumi-border">
        {WEEK_DAYS.map(day => (
          <div
            key={day}
            className="py-2.5 text-center font-nunito text-xs font-semibold text-lumi-gray sm:text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de células */}
      <div className="grid grid-cols-7">
        {calendarioMes.map(({ date, outOfMonth }, i) => (
          <CalendarCell
            key={i}
            date={date}
            outOfMonth={outOfMonth}
            hoje={hoje}
            etapasDia={getEtapasDoDia(date)}
            isLastRow={i >= calendarioMes.length - 7}
            isLastCol={(i + 1) % 7 === 0}
            onAbrirEtapa={onAbrirEtapa}
            onAbrirDia={onAbrirDia}
          />
        ))}
      </div>
    </>
  )
}

function CalendarCell({ date, outOfMonth, hoje, etapasDia, isLastRow, isLastCol, onAbrirEtapa, onAbrirDia }) {
  const isToday        = isSameDay(date, hoje)
  const isWeekend      = date.getDay() === 0 || date.getDay() === 6
  const primeiraEtapa  = etapasDia[0] ?? null
  const t              = primeiraEtapa ? getTreatment(primeiraEtapa.tipoCuidado) : null
  const todasConcluidas = etapasDia.length > 0 && etapasDia.every(e => e.concluida)

  const numberClass = cn(
    "inline-flex items-center justify-center rounded-full font-nunito text-sm font-semibold transition",
    isToday      ? 'bg-lumi-black text-white'
    : outOfMonth ? 'text-lumi-muted'
    : isWeekend  ? 'text-lumi-weekend'
    :              'text-lumi-body group-hover:text-lumi-black',
  )

  return (
    <div
      onClick={() => onAbrirDia(date)}
      className={cn(
        'group cursor-pointer bg-white transition hover:bg-lumi-hover',
        !isLastCol && 'border-r border-lumi-border',
        !isLastRow && 'border-b border-lumi-border',
      )}
    >
      {/* ── Mobile ── */}
      <div className="flex min-h-[72px] flex-col items-center justify-start px-1 pb-2 pt-2.5 sm:hidden">
        <span className={cn(numberClass, 'h-8 w-8')}>{date.getDate()}</span>
        <div className="mt-1.5 flex h-6 w-6 items-center justify-center">
          {!outOfMonth && todasConcluidas && <CheckBadge />}
          {!outOfMonth && !todasConcluidas && primeiraEtapa && (
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', t.iconBg)}>
              <i className={cn('fa-solid text-[10px]', t.icon, t.iconColor)} />
            </span>
          )}
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden min-h-[96px] flex-col p-2 sm:flex lg:min-h-[108px]">
        <div className="mb-1.5">
          <span className={cn(numberClass, 'h-7 w-7')}>{date.getDate()}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          {etapasDia.slice(0, 3).map(etapa => (
            <EventPill
              key={etapa.id}
              etapa={etapa}
              faded={outOfMonth}
              onClick={e => { e.stopPropagation(); onAbrirEtapa(etapa) }}
            />
          ))}
          {etapasDia.length > 3 && (
            <span className="pl-1 font-nunito text-[10px] text-lumi-gray">
              +{etapasDia.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function CheckBadge() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lumi-green">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

export function WeekView({ semana, hoje, getEtapasDoDia, onAbrirEtapa, onAbrirDia }) {
  const days = getWeekDays(semana)

  return (
    <div className="border-t border-lumi-border">
      {days.map((date, i) => {
        const isToday   = isSameDay(date, hoje)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const etapasDia = getEtapasDoDia(date)

        return (
          <div
            key={i}
            className={cn(
              'flex',
              i < days.length - 1 && 'border-b border-lumi-border',
              isToday ? 'bg-lumi-hover' : 'bg-white',
            )}
          >
            {/* Coluna do dia */}
            <button
              onClick={() => onAbrirDia(date)}
              className={cn(
                'flex w-[80px] shrink-0 flex-col justify-center gap-0.5 border-r border-lumi-border px-3 py-4 text-left transition hover:bg-lumi-bg sm:w-[100px] sm:px-4',
                isToday && 'bg-lumi-today',
              )}
            >
              <span className={cn(
                "font-nunito text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]",
                isWeekend ? 'text-lumi-weekend' : 'text-lumi-subtle',
              )}>
                {WEEK_DAYS[date.getDay()]}
              </span>
              <span className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full font-['Montserrat'] text-base font-semibold sm:text-lg",
                isToday      ? 'bg-lumi-black text-white'
                : isWeekend  ? 'text-lumi-weekend'
                :              'text-lumi-body',
              )}>
                {date.getDate()}
              </span>
            </button>

            {/* Etapas do dia */}
            <div className="flex min-h-[64px] flex-1 flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
              {etapasDia.length === 0 ? (
                <span className="font-nunito text-xs text-lumi-muted">Nenhum cuidado</span>
              ) : (
                etapasDia.map(etapa => (
                  <WeekEventPill key={etapa.id} etapa={etapa} onClick={() => onAbrirEtapa(etapa)} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Day View ─────────────────────────────────────────────────────────────────

export function DayView({ dia, hoje, getEtapasDoDia, onAbrirEtapa }) {
  const isToday   = isSameDay(dia, hoje)
  const etapasDia = getEtapasDoDia(dia)

  return (
    <div className="border-t border-lumi-border p-4 sm:p-6">
      {/* Header do dia */}
      <div className="mb-6 flex items-center gap-3">
        <span className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full font-['Montserrat'] text-xl font-semibold",
          isToday ? 'bg-lumi-black text-white' : 'bg-lumi-input text-lumi-body',
        )}>
          {dia.getDate()}
        </span>
        <div>
          <p className="font-['Montserrat'] text-base font-semibold capitalize text-lumi-body">
            {dia.toLocaleDateString('pt-BR', { weekday: 'long' })}
          </p>
          <p className="font-nunito text-sm text-lumi-gray">
            {dia.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {etapasDia.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-14 text-center">
          <span className="font-nunito text-sm font-semibold text-lumi-secondary">Nenhum cuidado programado</span>
          <span className="font-nunito text-xs text-lumi-gray">Aproveite para descansar seus fios</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {etapasDia.map(etapa => (
            <DayEventCard key={etapa.id} etapa={etapa} onClick={() => onAbrirEtapa(etapa)} />
          ))}
        </div>
      )}
    </div>
  )
}

function DayEventCard({ etapa, onClick }) {
  const t = getTreatment(etapa.tipoCuidado)

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderLeft: `3px solid ${t.hex}` }}
      className={cn(
        'flex items-center gap-4 rounded-2xl p-4 text-left transition hover:opacity-80',
        t.pillBg,
        etapa.concluida && 'opacity-50',
      )}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', t.iconBg)}>
        <i className={cn('fa-solid text-sm', t.icon, t.iconColor)} />
      </div>
      <div className="flex flex-1 flex-col">
        <span className={cn("font-nunito text-sm font-semibold", t.pillText, etapa.concluida && 'line-through')}>
          {etapa.tipoCuidado}
        </span>
        <span className="font-nunito text-xs text-lumi-gray">
          {etapa.concluida ? 'Concluído' : 'Pendente'}
        </span>
      </div>
      <span className={cn(
        "shrink-0 rounded-full px-4 py-1.5 font-nunito text-xs font-semibold text-white",
        etapa.concluida ? 'bg-emerald-500' : 'bg-lumi-black',
      )}>
        {etapa.concluida ? 'Feito' : 'Iniciar'}
      </span>
    </button>
  )
}
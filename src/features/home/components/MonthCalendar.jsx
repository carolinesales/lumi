import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { getTreatment } from '@/features/cronograma/lib/calendar'

function isSameDay(a, b) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const start = new Date(firstDay)
  start.setDate(start.getDate() - firstDay.getDay()) // começa no domingo

  const cells = []
  const cur = new Date(start)

  while (cur <= lastDay || cells.length % 7 !== 0) {
    cells.push({
      date: new Date(cur),
      outOfMonth: cur.getMonth() !== month,
    })

    cur.setDate(cur.getDate() + 1)
  }

  return cells
}

function formatMesAno(date) {
  return date
    .toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
    .replace(/^\w/, c => c.toUpperCase())
}

function formatDiaLabel(date) {
  const hoje = new Date()

  if (isSameDay(date, hoje)) return 'Hoje'

  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 1)

  if (isSameDay(date, amanha)) return 'Amanhã'

  return date
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
    .replace('.', '')
}

function DayCell({ date, outOfMonth, hoje, etapasDia, onSelect, selected }) {
  const isHoje = isSameDay(date, hoje)
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const temEtapa = etapasDia.length > 0
  const todasOk = temEtapa && etapasDia.every(e => e.concluida)

  const treatment = temEtapa ? getTreatment(etapasDia[0].tipoCuidado) : null
  const fundoEtapa = temEtapa && !outOfMonth ? (todasOk ? '#5E8C6A' : treatment?.hex) : null

  const textClass = isHoje
    ? 'text-white'
    : fundoEtapa
      ? 'text-white'
      : outOfMonth
        ? 'text-lumi-muted'
        : isWeekend
          ? 'text-lumi-weekend'
          : 'text-lumi-body'

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={cn(
        'flex h-10 items-center justify-center rounded-[8px] transition-colors',
        isHoje && 'bg-ink',
        !isHoje && selected && !fundoEtapa && 'bg-lumi-input',
        !isHoje && !fundoEtapa && !selected && 'hover:bg-lumi-hover',
      )}
      style={!isHoje && fundoEtapa ? { background: fundoEtapa } : undefined}
    >
      {todasOk ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={textClass} />
        </svg>
      ) : (
        <span className={cn('font-nunito text-sm font-semibold leading-5', textClass)}>
          {date.getDate()}
        </span>
      )}
    </button>
  )
}

function ProximoItem({ etapa, onOpenEtapa }) {
  const t = getTreatment(etapa.tipoCuidado)
  const dataEtapa = etapa.dataEtapa?.toDate?.() ?? new Date(etapa.dataEtapa ?? Date.now())

  return (
    <button
      type="button"
      onClick={() => onOpenEtapa?.(etapa)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-lumi-hover"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: t.hex }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={cn(
            'truncate font-nunito text-sm font-semibold',
            t.pillText,
            etapa.concluida && 'line-through opacity-50',
          )}
        >
          {etapa.tipoCuidado}
        </span>

        {etapa.subtipo && (
          <span className="truncate font-nunito text-xs text-lumi-gray">
            {etapa.subtipo}
          </span>
        )}
      </div>

      <span
        className={cn(
          'shrink-0 font-nunito text-xs font-medium',
          isSameDay(dataEtapa, new Date())
            ? 'font-semibold text-lumi-black'
            : 'text-lumi-gray',
        )}
      >
        {formatDiaLabel(dataEtapa)}
      </span>
    </button>
  )
}

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function MonthCalendar({ etapas = [], onOpenEtapa }) {
  const hoje = new Date()

  const [mes, setMes] = useState(hoje.getMonth())
  const [ano, setAno] = useState(hoje.getFullYear())
  const [diaSelected, setDiaSelected] = useState(hoje)

  const grid = useMemo(() => buildMonthGrid(ano, mes), [ano, mes])

  function getEtapasDoDia(date) {
    return etapas.filter(etapa => {
      const d = etapa.dataEtapa?.toDate?.() ?? new Date(etapa.dataEtapa ?? 0)
      return isSameDay(d, date)
    })
  }

  function irAnterior() {
    if (mes === 0) {
      setMes(11)
      setAno(a => a - 1)
      return
    }

    setMes(m => m - 1)
  }

  function irSeguinte() {
    if (mes === 11) {
      setMes(0)
      setAno(a => a + 1)
      return
    }

    setMes(m => m + 1)
  }

  const etapasDiaSel = getEtapasDoDia(diaSelected)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="font-['Montserrat'] text-base font-semibold text-lumi-black">
          {formatMesAno(new Date(ano, mes, 1))}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={irAnterior}
            aria-label="Mês anterior"
            className="grid size-6 place-items-center rounded-full transition hover:bg-lumi-input"
          >
            <i
              className="fa-solid fa-chevron-left text-[11px] text-lumi-gray"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={irSeguinte}
            aria-label="Próximo mês"
            className="grid size-6 place-items-center rounded-full transition hover:bg-lumi-input"
          >
            <i
              className="fa-solid fa-chevron-right text-[11px] text-lumi-gray"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 grid grid-cols-7">
          {DIAS.map(dia => (
            <span
              key={dia}
              className="text-center font-nunito text-xs font-light text-lumi-secondary"
            >
              {dia}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map(({ date, outOfMonth }, index) => (
            <DayCell
              key={`${date.toISOString()}-${index}`}
              date={date}
              outOfMonth={outOfMonth}
              hoje={hoje}
              etapasDia={getEtapasDoDia(date)}
              selected={isSameDay(date, diaSelected)}
              onSelect={setDiaSelected}
            />
          ))}
        </div>
      </div>

      {etapasDiaSel.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <p className="mb-1 font-nunito text-[11px] font-semibold uppercase tracking-[.08em] text-lumi-gray">
            {formatDiaLabel(diaSelected)}
          </p>

          {etapasDiaSel.map(etapa => (
            <ProximoItem
              key={etapa.id}
              etapa={etapa}
              onOpenEtapa={onOpenEtapa}
            />
          ))}
        </div>
      )}
    </div>
  )
}

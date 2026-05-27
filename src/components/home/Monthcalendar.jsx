// src/features/home/components/MonthCalendar.jsx

import { useMemo, useState }    from 'react'
import { cn }                   from '@/lib/utils'
import { getTreatment, WEEK_DAYS } from '@/features/cronograma/lib/calendar'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a, b) {
  return (
    a.getDate()     === b.getDate()  &&
    a.getMonth()    === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const start = new Date(firstDay)
  const dow   = (firstDay.getDay() + 6) % 7 // seg=0 … dom=6
  start.setDate(start.getDate() - dow)

  const cells = []
  const cur   = new Date(start)

  while (cur <= lastDay || cells.length % 7 !== 0) {
    cells.push({
      date:       new Date(cur),
      outOfMonth: cur.getMonth() !== month,
    })
    cur.setDate(cur.getDate() + 1)
  }

  return cells
}

function formatMesAno(date) {
  return date
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

function formatDiaLabel(date) {
  const hoje  = new Date()
  if (isSameDay(date, hoje)) return 'Hoje'
  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 1)
  if (isSameDay(date, amanha)) return 'Amanhã'
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')
}

// ─── Dot de etapa ─────────────────────────────────────────────────────────────

function EtapaDot({ tipoCuidado, concluida }) {
  const t = getTreatment(tipoCuidado)
  return (
    <span
      className={cn('inline-block h-1.5 w-1.5 rounded-full', concluida ? 'bg-lumi-green' : '')}
      style={concluida ? {} : { background: t.hex }}
    />
  )
}

// ─── Célula do dia ────────────────────────────────────────────────────────────

function DayCell({ date, outOfMonth, hoje, etapasDia, onSelect, selected }) {
  const isHoje    = isSameDay(date, hoje)
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const temEtapa  = etapasDia.length > 0
  const todasOk   = temEtapa && etapasDia.every(e => e.concluida)

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors',
        isHoje    ? 'bg-lumi-black'       :
        selected  ? 'bg-lumi-input'       :
                    'hover:bg-lumi-hover',
      )}
    >
      <span className={cn(
        'font-nunito text-xs font-semibold leading-none',
        isHoje      ? 'text-white'        :
        outOfMonth  ? 'text-lumi-muted'   :
        isWeekend   ? 'text-lumi-weekend' :
                      'text-lumi-body',
      )}>
        {date.getDate()}
      </span>

      {/* Dot de etapa */}
      <span className="flex h-1.5 items-center justify-center">
        {!outOfMonth && temEtapa && (
          todasOk
            ? <span className="h-1.5 w-1.5 rounded-full bg-lumi-green" />
            : <EtapaDot tipoCuidado={etapasDia[0].tipoCuidado} concluida={false} />
        )}
      </span>
    </button>
  )
}

// ─── Lista de próximos cuidados ───────────────────────────────────────────────

function ProximoItem({ etapa, onOpenEtapa }) {
  const t       = getTreatment(etapa.tipoCuidado)
  const dataEtapa = etapa.dataEtapa?.toDate?.() ?? new Date(etapa.dataEtapa ?? Date.now())

  return (
    <button
      type="button"
      onClick={() => onOpenEtapa?.(etapa)}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-lumi-hover"
    >
      {/* Dot de cor */}
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: t.hex }}
      />

      {/* Tipo + subtítulo */}
      <div className="flex flex-1 flex-col min-w-0">
        <span className={cn('font-nunito text-sm font-semibold truncate', t.pillText, etapa.concluida && 'line-through opacity-50')}>
          {etapa.tipoCuidado}
        </span>
        {etapa.subtipo && (
          <span className="font-nunito text-xs text-lumi-gray truncate">{etapa.subtipo}</span>
        )}
      </div>

      {/* Data */}
      <span className={cn(
        'shrink-0 font-nunito text-xs font-medium',
        isSameDay(dataEtapa, new Date()) ? 'text-lumi-black font-semibold' : 'text-lumi-gray',
      )}>
        {formatDiaLabel(dataEtapa)}
      </span>
    </button>
  )
}

// ─── MonthCalendar ────────────────────────────────────────────────────────────

const DIAS_SEMANA_CURTOS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

export default function MonthCalendar({
  etapas = [],
  onOpenEtapa,
  proximasEtapas = [],
}) {
  const hoje = new Date()

  const [mes,  setMes]  = useState(hoje.getMonth())
  const [ano,  setAno]  = useState(hoje.getFullYear())
  const [diaSelected, setDiaSelected] = useState(hoje)

  const grid = useMemo(() => buildMonthGrid(ano, mes), [ano, mes])

  function getEtapasDoDia(date) {
    return etapas.filter(e => {
      const d = e.dataEtapa?.toDate?.() ?? new Date(e.dataEtapa ?? 0)
      return isSameDay(d, date)
    })
  }

  function irMesAnterior() {
    if (mes === 0) { setMes(11); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }

  function irMesSeguinte() {
    if (mes === 11) { setMes(0); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }

  // Etapas do dia selecionado
  const etapasDiaSel = getEtapasDoDia(diaSelected)

  return (
    <div className="flex flex-col gap-4">

      {/* ── Cabeçalho do mês ── */}
      <div className="flex items-center justify-between">
        <span className="font-heading text-sm font-semibold text-lumi-black">
          {formatMesAno(new Date(ano, mes, 1))}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={irMesAnterior}
            aria-label="Mês anterior"
            className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-lumi-input"
          >
            <i className="fa-solid fa-chevron-left text-[10px] text-lumi-gray" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={irMesSeguinte}
            aria-label="Próximo mês"
            className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-lumi-input"
          >
            <i className="fa-solid fa-chevron-right text-[10px] text-lumi-gray" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Grade do calendário ── */}
      <div>
        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-1">
          {DIAS_SEMANA_CURTOS.map(d => (
            <span key={d} className="py-1 text-center font-nunito text-[10px] font-semibold uppercase tracking-wide text-lumi-muted">
              {d}
            </span>
          ))}
        </div>

        {/* Células */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {grid.map(({ date, outOfMonth }, i) => (
            <DayCell
              key={i}
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

      {/* ── Etapas do dia selecionado ── */}
      {etapasDiaSel.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <p className="mb-1 font-nunito text-[11px] font-semibold uppercase tracking-[.08em] text-lumi-gray">
            {formatDiaLabel(diaSelected)}
          </p>
          {etapasDiaSel.map(e => (
            <ProximoItem key={e.id} etapa={e} onOpenEtapa={onOpenEtapa} />
          ))}
        </div>
      )}

      {/* ── Próximos cuidados ── */}
      {proximasEtapas.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <p className="mb-1 font-nunito text-[11px] font-semibold uppercase tracking-[.08em] text-lumi-gray">
            Próximos
          </p>
          {proximasEtapas.slice(0, 5).map(e => (
            <ProximoItem key={e.id} etapa={e} onOpenEtapa={onOpenEtapa} />
          ))}
        </div>
      )}
    </div>
  )
}
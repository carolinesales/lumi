// src/features/hairScore/components/HairTimeline.jsx
import { useCallback, useMemo, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts'

import LumiCard   from '@/components/lumi/LumiCard'
import { Button } from '@/components/ui/button'
import { cn }     from '@/lib/utils'
import {
  normalizeHairScoreTimeline,
  getTimelineInsight,
} from '@/features/hairScore/utils/hairTimeline.utils'

// constantes e helpers para manipulação dos dados, formatação de labels e configuração do gráfico

const CHART_MARGIN  = Object.freeze({ top: 8, right: 16, left: 16, bottom: 0 })
const ACTIVE_DOT    = Object.freeze({ r: 5, fill: '#3D6B8A', stroke: '#FAF9FC', strokeWidth: 2 })
const CURSOR_STYLE  = Object.freeze({ stroke: 'rgba(150,150,150,0.25)', strokeWidth: 1, strokeDasharray: '4 4' })

const FILTROS = [
  { label: '7d',  dias: 7  },
  { label: '30d', dias: 30 },
  { label: '90d', dias: 90 },
]

const INFO_ITEMS = Object.freeze([
  { icon: 'fa-chart-line',  text: 'A curva mostra o movimento dos últimos registros, não uma nota isolada.' },
  { icon: 'fa-sparkles',    text: 'A interpretação transforma pequenos registros em sinais mais fáceis de entender.' },
  { icon: 'fa-circle-info', text: 'É uma orientação de autocuidado e não substitui avaliação profissional.' },
])

// helpers para manipulação dos dados e formatação de labels

function deduplicateByDay(items = []) {
  const map = new Map()
  for (const item of items) {
    const date = item.date?.toDate?.() ?? new Date(item.date ?? 0)
    if (Number.isNaN(date.getTime())) continue
    const key = date.toISOString().slice(0, 10)
    map.set(key, { ...item, _dayKey: key, _parsedDate: date })
  }
  return Array.from(map.values())
    .sort((a, b) => a._parsedDate.getTime() - b._parsedDate.getTime())
}

function filterByDays(items, dias) {
  if (!items.length) return items
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - dias)
  cutoff.setHours(0, 0, 0, 0)
  return items.filter(i => i._parsedDate >= cutoff)
}

function formatLabel(item) {
  const date = item._parsedDate
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—'
  const today = new Date()
  const isToday =
    date.getDate()     === today.getDate()  &&
    date.getMonth()    === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  if (isToday) return 'Hoje'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(date).replace('.', '')
}

function yDomain(items) {
  if (!items.length) return [0, 100]
  const values = items.map(i => i.score)
  return [
    Math.max(0,   Math.min(...values) - 12),
    Math.min(100, Math.max(...values) + 12),
  ]
}

// componentes do gráfico

function CustomDot({ cx, cy, index, dataLength, payload }) {
  const isLast = index === dataLength - 1
  if (isLast) return (
    <g key={`dot-last-${index}`}>
      <circle cx={cx} cy={cy} r={10} fill="#3D6B8A" fillOpacity={0.1} />
      <circle cx={cx} cy={cy} r={5}  fill="#3D6B8A" stroke="#FAF9FC" strokeWidth={2} />
    </g>
  )
  if (Math.abs(payload?.delta ?? 0) >= 3) return (
    <circle key={`dot-${index}`} cx={cx} cy={cy} r={3.5}
      fill="#7EB5D6" stroke="#FAF9FC" strokeWidth={1.5} />
  )
  return null
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { score, label } = payload[0].payload
  return (
    <div className="rounded-[10px] bg-ink px-2.5 py-1.5 shadow-lumi-float">
      <div className="font-heading text-[13px] font-semibold leading-[18px] text-white">{score}</div>
      <div className="font-nunito text-[10px] leading-[14px] text-white/60">{label}</div>
    </div>
  )
}

function CustomTick({ x, y, payload, index, visibleTicksCount }) {
  const isFirst = index === 0
  const isLast  = index === visibleTicksCount - 1
  const isToday = payload.value === 'Hoje'
  return (
    <text
      x={x} y={y + 12}
      textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
      fontFamily='"Nunito Sans", sans-serif'
      fontSize={9}
      fontWeight={isToday ? 700 : 600}
      fill={isToday ? '#3D6B8A' : '#999999'}
    >
      {payload.value}
    </text>
  )
}

// sub-componentes

function EmptyState() {
  return (
    <div className="rounded-2xl bg-surface-subtle p-6 text-center">
      <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-[#E8F2FA] text-[#6BA8D4]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <strong className="block font-heading text-[13px] font-semibold text-lumi-black">
        A leitura aparece com os registros
      </strong>
      <p className="mx-auto mt-2 max-w-[280px] font-nunito text-xs leading-5 text-lumi-secondary">
        Ao registrar cuidados, hábitos e mudanças, o Lumi começa a interpretar como seus fios respondem.
      </p>
    </div>
  )
}

function InfoModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/35 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
      style={{ animation: 'lumi-fade-up-soft .18s ease both' }}
    >
      <div
        className="w-full max-w-[480px] rounded-t-[30px] bg-surface px-4 pb-5 pt-3 shadow-lumi-float md:rounded-[30px] md:px-6 md:pb-6 md:pt-5"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'lumi-fade-up-soft .28s cubic-bezier(.22,1,.36,1) both' }}
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-lumi-border md:hidden" />
        <div className="overflow-hidden rounded-[26px] bg-transparent p-5 shadow-lumi-card">
          <h3 className="font-heading text-[22px] font-semibold leading-none tracking-tight text-lumi-black">
            Como o Lumi lê seus fios?
          </h3>
          <p className="mt-3 font-nunito text-sm leading-relaxed text-lumi-secondary">
            A leitura combina seus registros recentes, cuidados concluídos e variações do Hair Score para perceber como seus fios estão respondendo.
          </p>
          <div className="mt-4 flex flex-col gap-2.5">
            {INFO_ITEMS.map(item => (
              <div key={item.icon} className="flex items-start gap-2.5 font-nunito text-xs leading-relaxed text-lumi-secondary">
                <i className={cn('fa-solid mt-0.5 shrink-0 text-[#6BA8D4]', item.icon)} aria-hidden="true" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <Button className="mt-5 w-full" onClick={onClose}>Entendi</Button>
        </div>
      </div>
    </div>
  )
}

// export principal do componente de timeline do hair score

export default function HairTimeline({ scores = [], className }) {
  const [showInfo, setShowInfo] = useState(false)
  const [filtroDias, setFiltroDias] = useState(7)

  const normalized = useMemo(() => normalizeHairScoreTimeline(scores), [scores])
  const allItems   = useMemo(() => deduplicateByDay(normalized), [normalized])
  const items      = useMemo(() => filterByDays(allItems, filtroDias), [allItems, filtroDias])
  const chartData  = useMemo(() => items.map(item => ({ ...item, label: formatLabel(item) })), [items])
  const insight    = useMemo(() => getTimelineInsight(items), [items])
  const domain     = useMemo(() => yDomain(items), [items])

  const dataLength = chartData.length
  const renderDot  = useCallback(
    (props) => <CustomDot {...props} dataLength={dataLength} />,
    [dataLength],
  )

  return (
    <>
      <div className={cn("overflow-hidden rounded-[28px] bg-surface p-0 shadow-lumi-card", className)}>
        <div className="flex flex-col gap-4 p-6">

          {/* header */}
          <header className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-base font-semibold text-lumi-black">
                Leitura dos fios
              </h3>
              <p className="font-nunito text-sm leading-5 text-lumi-secondary">
                O Lumi acompanha mudanças e padrões percebidos nos seus registros.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              aria-label="Entender leitura dos fios"
              className="shrink-0 text-text-tertiary transition-all duration-200 hover:rotate-[15deg] hover:scale-110 hover:text-lumi-black"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </header>

          {/* filtro de período */}
          <div className="flex items-center gap-1.5" role="group" aria-label="Filtrar período">
            {FILTROS.map(f => (
              <button
                key={f.label}
                type="button"
                onClick={() => setFiltroDias(f.dias)}
                className={cn(
                  'rounded-full px-3 py-1 font-nunito text-xs font-semibold transition-colors',
                  filtroDias === f.dias
                    ? 'bg-ink text-white'
                    : 'bg-lumi-input text-lumi-gray hover:bg-lumi-border',
                )}
                aria-pressed={filtroDias === f.dias}
              >
                {f.label}
              </button>
            ))}
            <span className="ml-auto font-nunito text-[11px] text-lumi-muted">
              {items.length} {items.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          {/* body */}
          {items.length === 0 ? <EmptyState /> : (
            <div className="flex flex-col gap-4">

              {/* gráfico */}
              <div className="overflow-hidden rounded-2xl bg-surface-subtle pt-4">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={chartData} margin={CHART_MARGIN}>
                    <defs>
                      <linearGradient id="lumiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#7EB5D6" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#7EB5D6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid horizontal vertical={false} stroke="rgba(150,150,150,0.18)" strokeWidth={0.6} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false}
                      tick={<CustomTick />} interval={0} height={28} />
                    <YAxis hide domain={domain} />
                    <Tooltip content={<CustomTooltip />} cursor={CURSOR_STYLE} />
                    <Area
                      type="monotone" dataKey="score"
                      stroke="#7EB5D6" strokeWidth={2}
                      fill="url(#lumiGrad)"
                      dot={renderDot}
                      activeDot={ACTIVE_DOT}
                      animationDuration={600}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Insight */}
              <div className="rounded-2xl bg-surface-subtle p-3.5">
                <span className="mb-1.5 block font-nunito text-sm font-semibold text-lumi-black">
                  Insights Lumi
                </span>
                <p className="font-nunito text-sm leading-5 text-lumi-secondary">{insight}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  )
}

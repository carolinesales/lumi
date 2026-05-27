// src/features/routineEngine/components/AdaptiveRoutineCard.jsx
import { Button } from '@/components/ui/button'
import { cn }     from '@/lib/utils'
import { ROUTINE_ACTION_COPY, ROUTINE_FOCUS_COPY } from '@/content/copy/routineCopies'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeActions(actions = []) {
  const seen  = new Set()
  const unique = actions.filter(a => {
    if (!a?.id || seen.has(a.id)) return false
    seen.add(a.id); return true
  })

  const hasIntensa    = unique.some(a => a.id === 'hidratacaoIntensa')
  const hasManutencao = unique.some(a => a.id === 'manutencao')
  const hasReconst    = unique.some(a => a.id === 'reconstrucaoGradual')

  return unique
    .filter(a => {
      if (hasIntensa    && a.id === 'hidratacaoLeve')     return false
      if (hasManutencao && a.id === 'hidratacaoLeve')     return false
      if (hasReconst    && a.id === 'manutencao')         return false
      return true
    })
    .slice(0, 3)
}

function todayLabel() {
  const d = new Date()
  return `DIA ${d.getDate()}/${new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()}`
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdaptiveRoutineCard({ routine, onStartAction, className }) {
  if (!routine) return null

  const [main] = normalizeActions(routine.actions ?? [])
  const actionCopy = main ? (ROUTINE_ACTION_COPY?.[main.id] ?? null) : null
  const focusCopy  = routine.focus?.id ? (ROUTINE_FOCUS_COPY?.[routine.focus.id] ?? null) : null

  const title       = actionCopy?.title       ?? focusCopy?.title       ?? 'Seu cuidado está pronto'
  const description = actionCopy?.description ?? focusCopy?.description ?? 'O Lumi organizou um cuidado coerente para o momento atual dos seus fios.'

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-white', className)}>
      <div className="flex flex-col gap-6 p-6 pb-8">

        {/* Label + dia badge */}
        <div className="flex items-center justify-between">
          <span className="font-['Montserrat'] text-[10px] font-normal uppercase tracking-[1.5px] text-lumi-black">
            Próximo cuidado
          </span>
          <span className="rounded-full border border-[#ECEAF0] bg-[#FAF9FC] px-3 py-1 font-['Montserrat'] text-[10px] font-medium tracking-[1px] text-lumi-secondary">
            {todayLabel()}
          </span>
        </div>

        {/* Título + descrição */}
        <div className="flex flex-col gap-3">
          <h3 className="font-['Montserrat'] text-2xl font-semibold leading-8 text-lumi-black">
            {title}
          </h3>
          <p className="font-nunito text-sm leading-6 text-lumi-secondary">
            {description}
          </p>
        </div>

        {/* Meta — duração + score */}
        {main && (
          <div className="flex items-center gap-2 font-nunito text-xs text-lumi-secondary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 4.5V8.3L10.5 9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {main.duration ?? 20} min
            <span className="text-lumi-muted">|</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 12L5.5 7L9 9.5L14.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10.5 3.5H14.5V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            +{main.scoreDelta ?? 8} no Lumi Score
          </div>
        )}

        {/* CTA */}
        {main && (
          <Button
            onClick={() => onStartAction?.(main)}
            size="lg"
            className="w-full justify-between"
            aria-label={`Iniciar: ${title}`}
          >
            <span>Iniciar</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M7.5 2.5L12 7L7.5 11.5" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
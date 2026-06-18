// src/features/routineEngine/components/AdaptiveRoutineCard.jsx
import { Button } from '@/components/ui/button'
import { useIdioma } from '@/contexts/IdiomaContext'
import { cn }     from '@/lib/utils'
import { ROUTINE_ACTION_COPY, ROUTINE_FOCUS_COPY } from '@/content/copy/routineCopies'
import ilustracaoReminder from '@/assets/Reminder.png'

// helper para limpar e priorizar ações, garantindo que não haja redundâncias
// e limitando a 3 ações no máximo

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

// componenente principal

export default function AdaptiveRoutineCard({ routine, onStartAction, className }) {
  if (!routine) return null

  const { t, idioma } = useIdioma()

  const [main] = normalizeActions(routine.actions ?? [])
  const lang = idioma === 'en' ? 'en' : 'pt'
  const actionRaw = main ? (ROUTINE_ACTION_COPY?.[main.id] ?? null) : null
  const focusRaw  = routine.focus?.id ? (ROUTINE_FOCUS_COPY?.[routine.focus.id] ?? null) : null
  const actionCopy = actionRaw ? (actionRaw[lang] ?? actionRaw.pt) : null
  const focusCopy  = focusRaw  ? (focusRaw[lang]  ?? focusRaw.pt)  : null

  const title       = actionCopy?.title       ?? focusCopy?.title       ?? t('rot_pronto_titulo')
  const description = actionCopy?.description ?? focusCopy?.description ?? t('rot_pronto_desc')

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-surface', className)}>
      <div className="flex flex-col gap-6 p-6">

        {/* cabeçalho */}
        <div className="flex items-center justify-between">
          <span className="font-['Montserrat'] text-base font-semibold text-text">
            {t('rot_proximo_cuidado')}
          </span>
          <span className="rounded-full border border-paper-200 bg-surface-subtle px-3 py-1 font-['Montserrat'] text-[10px] font-medium capitalize tracking-[1px] text-text-secondary">
            {todayLabel()}
          </span>
        </div>

        {/* Ilustração + conteúdo */}
        <div className="flex items-center gap-2">
          <img
            src={ilustracaoReminder}
            alt=""
            aria-hidden="true"
            className="size-[150px] shrink-0 object-contain"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Título + descrição */}
            <div className="flex flex-col gap-1.5">
              <h3 className="font-['Montserrat'] text-base font-semibold text-text">
                {title}
              </h3>
              <p className="font-nunito text-sm leading-6 text-text-secondary">
                {description}
              </p>
            </div>

            {/* Meta — duração + score */}
            {main && (
              <div className="flex items-center gap-2 font-nunito text-xs text-text-secondary">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 4.5V8.3L10.5 9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {main.duration ?? 20} {t('rot_min')}
                <span className="text-text-tertiary">|</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M1 12L5.5 7L9 9.5L14.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.5 3.5H14.5V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                +{main.scoreDelta ?? 8} {t('rot_no_score')}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        {main && (
          <Button
            onClick={() => onStartAction?.(main)}
            size="default"
            className="w-full"
            aria-label={`Iniciar: ${title}`}
          >
            {t('rot_iniciar')}
          </Button>
        )}
      </div>
    </div>
  )
}
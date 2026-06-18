// src/features/gamification/components/ConquistasCard.jsx
import { useRef, useState } from 'react'

import { CONQUISTAS }      from '@/lib/gamificacao'
import { useIdioma }       from '@/contexts/IdiomaContext'
import ConquistasDrawer    from './ConquistasDrawer'
import { cn }              from '@/lib/utils'

import medalhaConquistada  from '@/assets/medalhas/Medalha_conquistada.svg'
import medalhaDesabilitada from '@/assets/medalhas/Medalha_desabilitada.svg'

// Traduz nome/desc de uma conquista (dados em PT no gamificacao.js).
export function labelConquista(conquista, campo, t) {
  const key = `conq_${conquista.id}_${campo}`
  const v = t(key)
  return (!v || v === key) ? (conquista[campo] ?? '') : v
}

// medalhas
function Medalha({ desbloqueada = true, t }) {
  return (
    <img
      src={desbloqueada ? medalhaConquistada : medalhaDesabilitada}
      alt={desbloqueada ? t('conq_aria') : t('conq_aria')}
      width={48}
      height={48}
      className="object-contain"
    />
  )
}

// conquista individual
function ConquistaItem({ conquista, desbloqueada, t }) {
  return (
    <div className={cn(
      'flex min-w-0 flex-1 flex-col items-center justify-start gap-4 rounded-2xl px-2 py-4',
      desbloqueada ? 'bg-surface-subtle' : 'bg-surface-muted',
    )}>
      <Medalha desbloqueada={desbloqueada} t={t} />
      <span className={cn(
        'w-full text-center font-nunito text-xs font-medium leading-[14px]',
        desbloqueada ? 'text-text' : 'text-text-tertiary',
      )}>
        {labelConquista(conquista, 'nome', t)}
      </span>
    </div>
  )
}

// card principal de conquistas
export default function ConquistasCard({ desbloqueadas = [], progressData = {} }) {
  const { t } = useIdioma()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const triggerRef = useRef(null)

  const desbloqueadasList = CONQUISTAS.filter(c =>  desbloqueadas.includes(c.id))
  const bloqueadasList    = CONQUISTAS.filter(c => !desbloqueadas.includes(c.id))

  // Mobile: 2 recentes + próxima meta
  const recentes      = desbloqueadasList.slice(-2)
  const proximaMeta   = bloqueadasList[0] ?? null
  const visiveisMobile = proximaMeta ? [...recentes, proximaMeta] : desbloqueadasList.slice(-3)
  const extra = 3 - visiveisMobile.length
  if (extra > 0) {
    const ids = new Set(visiveisMobile.map(c => c.id))
    bloqueadasList.filter(c => !ids.has(c.id)).slice(0, extra).forEach(c => visiveisMobile.push(c))
  }

  // Desktop: 6 recentes
  const visiveisDesktop = [...desbloqueadasList, ...bloqueadasList].slice(0, 6)

  return (
    <>
      <div className="w-full rounded-2xl bg-surface px-4 pb-8 pt-6">

        {/* Header */}
        <div className="mb-2 flex items-start gap-2">
          <span className="flex-1 font-heading text-base font-semibold leading-5 text-text">
            {t('conq_titulo')}
          </span>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 bg-transparent p-0 font-nunito text-xs font-normal text-text-secondary transition hover:text-text"
          >
            {t('conq_ver_mais')}
          </button>
        </div>

        {/* Subtítulo */}
        <p className="mb-[22px] font-nunito text-sm font-normal leading-5 text-text-secondary">
          {t('conq_subtitulo')}
        </p>

        {/* Mobile */}
        <div className="flex items-start gap-3.5 xl:hidden">
          {visiveisMobile.map(c => (
            <ConquistaItem key={c.id} conquista={c} desbloqueada={desbloqueadas.includes(c.id)} t={t} />
          ))}
        </div>

        {/* Desktop*/}
        <div className="hidden grid-cols-3 gap-3.5 xl:grid">
          {visiveisDesktop.map(c => (
            <ConquistaItem key={c.id} conquista={c} desbloqueada={desbloqueadas.includes(c.id)} t={t} />
          ))}
        </div>
      </div>

      <ConquistasDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        desbloqueadas={desbloqueadas}
        progressData={progressData}
        triggerRef={triggerRef}
      />
    </>
  )
}

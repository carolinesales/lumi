// src/features/gamification/components/ConquistasCard.jsx
import { useRef, useState } from 'react'

import { CONQUISTAS }      from '@/lib/gamificacao'
import ConquistasDrawer    from './ConquistasDrawer'
import { cn }              from '@/lib/utils'

import medalhaConquistada  from '@/assets/medalhas/Medalha_conquistada.svg'
import medalhaDesabilitada from '@/assets/medalhas/Medalha_desabilitada.svg'

// ─── Medalha ──────────────────────────────────────────────────────────────────

function Medalha({ desbloqueada = true }) {
  return (
    <img
      src={desbloqueada ? medalhaConquistada : medalhaDesabilitada}
      alt={desbloqueada ? 'Conquista desbloqueada' : 'Conquista bloqueada'}
      width={48}
      height={48}
      className="object-contain"
    />
  )
}

// ─── ConquistaItem ────────────────────────────────────────────────────────────

function ConquistaItem({ conquista, desbloqueada }) {
  return (
    <div className={cn(
      'flex min-w-0 flex-1 flex-col items-center justify-start gap-4 rounded-2xl px-2 py-4',
      desbloqueada ? 'bg-[#FAF9FC]' : 'bg-[#F5F4F4]',
    )}>
      <Medalha desbloqueada={desbloqueada} />
      <span className={cn(
        'w-full text-center font-nunito text-xs font-medium leading-[14px]',
        desbloqueada ? 'text-lumi-black' : 'text-[#A8A29E]',
      )}>
        {conquista.nome}
      </span>
    </div>
  )
}

// ─── Card principal ───────────────────────────────────────────────────────────

export default function ConquistasCard({ desbloqueadas = [], progressData = {} }) {
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

  // Desktop: todas, máximo 6
  const visiveisDesktop = [...desbloqueadasList, ...bloqueadasList].slice(0, 6)

  return (
    <>
      <div className="w-full rounded-2xl bg-white px-4 pb-8 pt-6">

        {/* Header */}
        <div className="mb-2 flex items-start gap-2">
          <span className="flex-1 font-heading text-base font-semibold leading-5 text-[#1E1E1F]">
            Conquistas
          </span>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="shrink-0 bg-transparent p-0 font-nunito text-xs font-normal text-lumi-secondary transition hover:text-lumi-black"
          >
            ver mais
          </button>
        </div>

        {/* Subtítulo */}
        <p className="mb-[22px] font-nunito text-sm font-normal leading-5 text-lumi-secondary">
          Sua evolução dentro da jornada Lumi
        </p>

        {/* Mobile — 1 linha de 3 */}
        <div className="flex items-start gap-3.5 xl:hidden">
          {visiveisMobile.map(c => (
            <ConquistaItem key={c.id} conquista={c} desbloqueada={desbloqueadas.includes(c.id)} />
          ))}
        </div>

        {/* Desktop — grid 3 colunas, 2 linhas */}
        <div className="hidden grid-cols-3 gap-3.5 xl:grid">
          {visiveisDesktop.map(c => (
            <ConquistaItem key={c.id} conquista={c} desbloqueada={desbloqueadas.includes(c.id)} />
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
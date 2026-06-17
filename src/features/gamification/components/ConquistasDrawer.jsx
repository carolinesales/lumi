import { useEffect, useRef } from 'react'
import { createPortal }      from 'react-dom'

import { CONQUISTAS }                         from '@/lib/gamificacao'
import { useMediaQuery }                      from '@/hooks/useMediaQuery'
import { calcularProgressoConquistas }        from '@/features/gamification/utils/gamificationUtils'
import { Button }                             from '@/components/ui/button'
import { cn }                                 from '@/lib/utils'

import medalhaConquistada  from '@/assets/medalhas/Medalha_conquistada.svg'
import medalhaDesabilitada from '@/assets/medalhas/Medalha_desabilitada.svg'

// Sub-componentes 

function Medalha({ desbloqueada = true, size = 56 }) {
  return (
    <img
      src={desbloqueada ? medalhaConquistada : medalhaDesabilitada}
      alt={desbloqueada ? 'Conquista desbloqueada' : 'Conquista bloqueada'}
      width={size}
      height={size}
      className="shrink-0 object-contain"
    />
  )
}

function ProgressBar({ atual, total }) {
  const pct = Math.min(Math.round((atual / total) * 100), 100)
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between font-nunito text-[10px] font-bold text-lumi-muted">
        <span>{atual} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#E8E4E0]">
        <div
          className="h-full rounded-full bg-[#C8C4BC] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ConquistaRow({ conquista, desbloqueada, progresso }) {
  return (
    <div className={cn(
      'flex items-start gap-4 rounded-2xl p-3',
      desbloqueada ? 'bg-[#FAF9FC]' : 'bg-[#F5F4F4]',
    )}>
      <Medalha desbloqueada={desbloqueada} size={56} />

      <div className="min-w-0 flex-1">
        <p className={cn(
          'mb-0.5 font-nunito text-sm font-semibold',
          desbloqueada ? 'text-lumi-black' : 'text-lumi-muted',
        )}>
          {conquista.nome}
        </p>
        <p className={cn(
          'font-nunito text-xs leading-5',
          desbloqueada ? 'text-lumi-secondary' : 'text-lumi-muted',
        )}>
          {conquista.desc}
        </p>
        {!desbloqueada && progresso && (
          <ProgressBar atual={progresso.atual} total={progresso.total} />
        )}
      </div>

      {desbloqueada && conquista.xp > 0 && (
        <span className="shrink-0 rounded-full bg-[#EAF3DE] px-2 py-0.5 font-nunito text-[11px] font-bold text-[#3B6D11]">
          +{conquista.xp} XP
        </span>
      )}
    </div>
  )
}

function ConquistasConteudo({ desbloqueadas, progressos }) {
  const desbloqueadasList = CONQUISTAS.filter(c =>  desbloqueadas.includes(c.id))
  const bloqueadasList    = CONQUISTAS.filter(c => !desbloqueadas.includes(c.id))

  return (
    <>
      {desbloqueadasList.length > 0 && (
        <section className="mb-6">
          <span className="mb-2 block font-nunito text-[11px] font-bold uppercase tracking-[.06em] text-lumi-muted">
            Conquistadas
          </span>
          <div className="flex flex-col gap-2">
            {desbloqueadasList.map(c => (
              <ConquistaRow key={c.id} conquista={c} desbloqueada />
            ))}
          </div>
        </section>
      )}

      {bloqueadasList.length > 0 && (
        <section>
          <span className="mb-2 block font-nunito text-[11px] font-bold uppercase tracking-[.06em] text-lumi-muted">
            Em progresso
          </span>
          <div className="flex flex-col gap-2">
            {bloqueadasList.map(c => (
              <ConquistaRow
                key={c.id}
                conquista={c}
                desbloqueada={false}
                progresso={progressos?.[c.id]}
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

// Focus trap para acessibilidade do modal ou drawer

function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return
    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    first?.focus()

    function trap(e) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [active, ref])
}

// Drawer mobile

function Drawer({ onClose, desbloqueadas, progressos, triggerRef }) {
  const startY   = useRef(null)
  const currentY = useRef(null)
  const sheetRef = useRef(null)

  useFocusTrap(sheetRef, true)
  useEffect(() => () => { triggerRef?.current?.focus() }, [triggerRef])

  function onTouchStart(e) { startY.current = e.touches[0].clientY }
  function onTouchMove(e) {
    const delta = e.touches[0].clientY - startY.current
    currentY.current = delta
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`
      sheetRef.current.style.transition = 'none'
    }
  }
  function onTouchEnd() {
    if (currentY.current > 120) { onClose() }
    else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform .3s ease'
    }
    currentY.current = null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-black/50">
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Conquistas"
        className="flex max-h-[88vh] w-full flex-col rounded-t-[24px] bg-white"
        style={{ animation: 'drawerUp .32s cubic-bezier(.32,0,.67,0) forwards' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Alça drag */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="flex cursor-grab justify-center pb-3 pt-4"
          aria-hidden="true"
        >
          <div className="h-1 w-9 rounded-full bg-lumi-border" />
        </div>

        {/* Header */}
        <div className="border-b border-lumi-border px-6 pb-4">
          <h2 className="font-['Montserrat'] text-[17px] font-semibold text-lumi-black">Conquistas</h2>
          <p className="font-nunito text-sm text-lumi-secondary">
            {desbloqueadas.length} de {CONQUISTAS.length} desbloqueadas
          </p>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-6 pb-10 pt-5">
          <ConquistasConteudo desbloqueadas={desbloqueadas} progressos={progressos} />
        </div>
      </div>
    </div>
  )
}

// Modal desktop

function Modal({ onClose, desbloqueadas, progressos, triggerRef }) {
  const modalRef = useRef(null)
  useFocusTrap(modalRef, true)
  useEffect(() => () => { triggerRef?.current?.focus() }, [triggerRef])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-10"
      onClick={onClose}
    >
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Conquistas"
        onClick={e => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-[520px] flex-col rounded-[24px] bg-white"
        style={{ animation: 'modalIn .25s ease forwards' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-lumi-border px-7 py-6">
          <div>
            <h2 className="font-['Montserrat'] text-lg font-semibold text-lumi-black">Conquistas</h2>
            <p className="font-nunito text-sm text-lumi-secondary">
              {desbloqueadas.length} de {CONQUISTAS.length} desbloqueadas
            </p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar conquistas">
            <i className="fa-solid fa-xmark text-sm" aria-hidden="true" />
          </Button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-7 py-6">
          <ConquistasConteudo desbloqueadas={desbloqueadas} progressos={progressos} />
        </div>
      </div>
    </div>
  )
}

// export principal do drawer ou modal

export default function ConquistasDrawer({
  open,
  onClose,
  desbloqueadas = [],
  progressData  = {},
  triggerRef,
}) {
  const isMobile = useMediaQuery('(max-width: 1023px)')

  const progressos = calcularProgressoConquistas({
    streak:            progressData.streak            ?? 0,
    etapasConcluidas:  progressData.etapasConcluidas  ?? 0,
    hairScore:         progressData.hairScore         ?? 0,
    totalDiagnosticos: progressData.totalDiagnosticos ?? 0,
    xp:                progressData.xp                ?? 0,
    cuidado7Dias:      progressData.cuidado7Dias      ?? 0,
  })

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const props = { onClose, desbloqueadas, progressos, triggerRef }

  return createPortal(
    isMobile ? <Drawer {...props} /> : <Modal {...props} />,
    document.body,
  )
}
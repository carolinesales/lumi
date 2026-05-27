import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const VIEWS = ['Mês', 'Semana', 'Dia']

export function CalendarToolbar({ label, view, onPrev, onNext, onToday, onViewChange }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

      {/* ── Mobile: < Label > centralizados ── */}
      <div className="flex flex-1 items-center sm:hidden">
        <NavButton onClick={onPrev} icon={ChevronLeft} />
        <div className="flex flex-1 justify-center">
          <ToolbarLabel label={label} />
        </div>
        <NavButton onClick={onNext} icon={ChevronRight} />
      </div>

      {/* ── Desktop: < > Label Hoje à esquerda ── */}
      <div className="hidden items-center gap-2 sm:flex">
        <NavButton onClick={onPrev} icon={ChevronLeft} />
        <NavButton onClick={onNext} icon={ChevronRight} />
        <ToolbarLabel label={label} />
        <button
          onClick={onToday}
          className="rounded-full border border-lumi-border px-3 py-1 font-nunito text-xs font-semibold text-lumi-gray transition hover:bg-lumi-bg"
        >
          Hoje
        </button>
      </div>

      {/* ── View switcher — só desktop ── */}
      <div className="hidden items-center rounded-full bg-lumi-input p-[3px] sm:flex">
        {VIEWS.map(v => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={cn(
              "rounded-full px-4 py-1.5 font-nunito text-sm font-semibold transition",
              view === v
                ? 'bg-white text-lumi-black'
                : 'text-lumi-subtle hover:text-lumi-body',
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

function NavButton({ onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-lumi-gray transition hover:bg-lumi-bg hover:text-lumi-body"
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  )
}

function ToolbarLabel({ label }) {
  // Separa "Maio" de "2026" para estilizar diferente
  const parts = label.split(' ')
  const year  = parts.find(p => /^\d{4}$/.test(p))
  const rest  = parts.filter(p => p !== year).join(' ')

  return (
    <span className="font-['Montserrat'] text-base font-semibold text-lumi-body">
      {rest}{' '}
      {year && <span className="font-normal text-lumi-subtle">{year}</span>}
    </span>
  )
}
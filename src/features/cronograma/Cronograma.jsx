import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

import AppShell from '@/components/lumi/AppShell'
import { useEtapas } from './hooks/useEtapas'
import { useCalendario } from './hooks/useCalendario'
import { CalendarToolbar }               from './components/CalendarToolbar'
import { MonthView, WeekView, DayView }  from './components/CalendarViews'
import { TodayCard, UpcomingCard, ProgressCard } from './components/SidebarCards'
import { cn } from './lib/cn'

const VIEWS = ['Mês', 'Semana', 'Dia']

export default function Cronograma() {
  const navigate = useNavigate()

  const {
    etapas, etapaHoje, proximasEtapas,
    getEtapasDoDia, concluidas, total, loading,
  } = useEtapas()

  const {
    view, setView,
    semanaAtual, diaAtual,
    calendarioMes,
    navAnterior, navProximo, navHoje, abrirDia,
    toolbarLabel,
  } = useCalendario()

  const hoje      = new Date()
  const dateLabel = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })

  function abrirEtapa(etapa) {
    if (!etapa?.cronogramaId || !etapa?.id) return
    navigate(`/app/etapa/${etapa.cronogramaId}/${etapa.id}`)
  }

  const sidebarProps = {
    etapaHoje, dateLabel, proximasEtapas,
    concluidas, total, etapas,
    onOpen:       abrirEtapa,
    onObservacao: () => navigate('/app/observacao'),
  }

  return (
    <AppShell onPrimaryAction={() => navigate('/app/home')}>
      <main className="min-h-screen bg-lumi-bg px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="mx-auto max-w-[1320px]">

          {/* ── Header ── */}
          <header className="mb-5 sm:mb-8">
            {/* Mobile*/}
            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lumi-body transition hover:bg-lumi-input"
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <h1 className="font-['Montserrat'] text-xl font-semibold text-lumi-black">
                Minha rotina
              </h1>
            </div>
            {/* Desktop*/}
            <h1 className="hidden font-['Montserrat'] text-2xl font-semibold text-lumi-black sm:block">
              Minha rotina
            </h1>
            <p className="mt-1 font-nunito text-sm leading-5 text-lumi-secondary">
              Visualize seu ciclo de cuidados, acompanhe os próximos rituais e mantenha sua rotina capilar em equilíbrio.
            </p>
          </header>

          {/* ── View switcher mobile ── */}
          <div className="mb-4 sm:hidden">
            <div className="flex items-center rounded-full bg-lumi-input p-[3px]">
              {VIEWS.map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex-1 rounded-full py-2 font-nunito text-sm font-semibold transition",
                    view === v ? 'bg-white text-lumi-black' : 'text-lumi-subtle',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* ── conteudo ── */}
          {loading ? (
            <LoadingSkeleton />
          ) : etapas.length === 0 ? (
            <EmptyState onCreate={() => navigate('/app/onboarding')} />
          ) : (
            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_340px]">

              {/* ── Calendário ── */}
              <div className="min-w-0 overflow-hidden rounded-2xl border border-lumi-border bg-white sm:rounded-3xl">
                <CalendarToolbar
                  label={toolbarLabel()}
                  view={view}
                  onPrev={navAnterior}
                  onNext={navProximo}
                  onToday={navHoje}
                  onViewChange={setView}
                />

                {view === 'Mês' && (
                  <MonthView
                    calendarioMes={calendarioMes}
                    hoje={hoje}
                    getEtapasDoDia={getEtapasDoDia}
                    onAbrirEtapa={abrirEtapa}
                    onAbrirDia={abrirDia}
                  />
                )}

                {view === 'Semana' && (
                  <WeekView
                    semana={semanaAtual}
                    hoje={hoje}
                    getEtapasDoDia={getEtapasDoDia}
                    onAbrirEtapa={abrirEtapa}
                    onAbrirDia={abrirDia}
                  />
                )}

                {view === 'Dia' && (
                  <DayView
                    dia={diaAtual}
                    hoje={hoje}
                    getEtapasDoDia={getEtapasDoDia}
                    onAbrirEtapa={abrirEtapa}
                  />
                )}
              </div>

              {/* ── Sidebar desktop ── */}
              <aside className="hidden flex-col gap-4 xl:flex">
                <Sidebar {...sidebarProps} />
              </aside>

              {/* ── Cards mobile (abaixo do calendário) ── */}
              <div className="flex flex-col gap-4 xl:hidden">
                <Sidebar {...sidebarProps} />
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}

// sidebar

function Sidebar({ etapaHoje, dateLabel, proximasEtapas, concluidas, total, etapas, onOpen, onObservacao }) {
  return (
    <>
      <TodayCard
        etapa={etapaHoje}
        dateLabel={dateLabel}
        onOpen={onOpen}
        onObservacao={onObservacao}
      />
      <UpcomingCard etapas={proximasEtapas} onOpen={onOpen} />
      <ProgressCard concluidas={concluidas} total={total} etapas={etapas} />
    </>
  )
}

// estado vazio (sem etapas criadas)

function EmptyState({ onCreate }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-6 rounded-3xl border border-lumi-border bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lumi-black text-white">
        <i className="fa-solid fa-calendar-plus text-lg" />
      </div>
      <div>
        <h2 className="font-['Montserrat'] text-xl font-semibold text-lumi-black">
          Sua rotina ainda não foi criada
        </h2>
        <p className="mx-auto mt-2 max-w-md font-nunito text-sm leading-6 text-lumi-secondary">
          Monte um cronograma personalizado para acompanhar hidratação, nutrição, reconstrução e outros cuidados.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="rounded-full bg-lumi-black px-6 py-3 font-nunito text-sm font-semibold text-white transition hover:opacity-90"
      >
        Criar minha rotina
      </button>
    </div>
  )
}

// skeleton de carregamento

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="h-[580px] animate-pulse rounded-3xl bg-white/80" />
      <div className="flex flex-col gap-4">
        <div className="h-[400px] animate-pulse rounded-[24px] bg-white/80" />
        <div className="h-48 animate-pulse rounded-[24px] bg-white/80" />
        <div className="h-52 animate-pulse rounded-[24px] bg-white/80" />
      </div>
    </div>
  )
}
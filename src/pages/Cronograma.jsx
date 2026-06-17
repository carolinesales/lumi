import { useEffect, useMemo, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/lumi/AppShell'
import { useIdioma } from '@/contexts/IdiomaContext'
import ilustracaoVazia from '@/assets/Milestone-4_Streamline_Milano.svg'
import RegistroModal from './RegistroModal'

// ─── Constants ───────────────────────────────────────────────────────────────

const TREATMENTS = {
  Hidratação: {
    icon: 'fa-droplet',
    iconBg: 'bg-[#E3F3FA]',
    iconColor: 'text-[#2F88A3]',
    pillBg: 'bg-[#EAF4F9]',
    pillText: 'text-[#2F88A3]',
    bar: 'bg-[#5B9EBF]',
    hex: '#5B9EBF',
  },
  Nutrição: {
    icon: 'fa-leaf',
    iconBg: 'bg-[#FBF3D6]',
    iconColor: 'text-[#C9A227]',
    pillBg: 'bg-[#FBF3D6]',
    pillText: 'text-[#A8841E]',
    bar: 'bg-[#F3D673]',
    hex: '#C9A227',
  },
  Reconstrução: {
    icon: 'fa-gem',
    iconBg: 'bg-[#E5DEF2]',
    iconColor: 'text-[#6A4E98]',
    pillBg: 'bg-[#E5DEF2]',
    pillText: 'text-[#6A4E98]',
    bar: 'bg-[#8B6FC4]',
    hex: '#8B6FC4',
  },
  Umectação: {
    icon: 'fa-oil-can',
    iconBg: 'bg-[#FBF6E3]',
    iconColor: 'text-[#9A7416]',
    pillBg: 'bg-[#FBF6E3]',
    pillText: 'text-[#9A7416]',
    bar: 'bg-[#C4A033]',
    hex: '#C4A033',
  },
  Detox: {
    icon: 'fa-sparkles',
    iconBg: 'bg-[#F3EFFC]',
    iconColor: 'text-[#7459A6]',
    pillBg: 'bg-[#F3EFFC]',
    pillText: 'text-[#7459A6]',
    bar: 'bg-[#8B6FC4]',
    hex: '#8B6FC4',
  },
  Lavagem: {
    icon: 'fa-pump-soap',
    iconBg: 'bg-[#EEF2F3]',
    iconColor: 'text-[#627176]',
    pillBg: 'bg-[#EEF2F3]',
    pillText: 'text-[#627176]',
    bar: 'bg-[#7A9299]',
    hex: '#7A9299',
  },
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const WEEK_DAYS     = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEK_DAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTreatment(tipo) {
  return TREATMENTS[tipo] ?? TREATMENTS.Hidratação
}

function toDate(value) {
  if (!value) return null
  if (value.toDate) return value.toDate()
  return new Date(value)
}

function isSameDay(a, b) {
  if (!a || !b) return false
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
}

function getWeekDays(date) {
  const d = new Date(date)
  const sunday = new Date(d)
  sunday.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + i)
    return day
  })
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Cronograma() {
  const { user } = useAuth()
  const { t: tr, idioma } = useIdioma()
  const locale = idioma === 'en' ? 'en-US' : 'pt-BR'
  const navigate = useNavigate()

  const [etapas, setEtapas] = useState([])
  const [mesAtual, setMesAtual] = useState(new Date())
  const [semanaAtual, setSemanaAtual] = useState(new Date())
  const [diaAtual, setDiaAtual] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('Mês')
  const [showReg, setShowReg] = useState(false)

  useEffect(() => {
    if (!user?.uid) { setEtapas([]); setLoading(false); return }
    setLoading(true)
    const q = query(collection(db, 'usuarios', user.uid, 'cronogramas'), orderBy('dataInicio', 'desc'), limit(1))
    let unsubEtapas = null
    const unsubCron = onSnapshot(q, snap => {
      if (snap.empty) { setEtapas([]); setLoading(false); return }
      const cronogramaId = snap.docs[0].id
      if (unsubEtapas) unsubEtapas()
      unsubEtapas = onSnapshot(
        query(collection(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas'), orderBy('dataEtapa', 'asc')),
        s => { setEtapas(s.docs.map(d => ({ id: d.id, cronogramaId, ...d.data() }))); setLoading(false) },
        e => { console.error(e); setLoading(false) },
      )
    }, e => { console.error(e); setLoading(false) })
    return () => { unsubCron(); if (unsubEtapas) unsubEtapas() }
  }, [user?.uid])

  const hoje = new Date()
  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()

  const etapasOrdenadas = useMemo(() =>
    [...etapas].sort((a, b) => toDate(a.dataEtapa) - toDate(b.dataEtapa)), [etapas])

  const etapaHoje = useMemo(() =>
    etapasOrdenadas.find(e => isSameDay(toDate(e.dataEtapa), hoje)), [etapasOrdenadas])

  const proximasEtapas = useMemo(() => {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    return etapasOrdenadas
      .filter(e => { const d = toDate(e.dataEtapa); return d && d >= inicio && !e.concluida })
      .slice(0, 4)
  }, [etapasOrdenadas])

  const etapasPorDiaMap = useMemo(() => {
    const map = {}
    etapasOrdenadas.forEach(e => {
      const d = toDate(e.dataEtapa)
      if (!d) return
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [etapasOrdenadas])

  function getEtapasDoDia(date) {
    return etapasPorDiaMap[`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`] ?? []
  }

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias   = new Date(ano, mes + 1, 0).getDate()
  const diasAnterior = new Date(ano, mes, 0).getDate()

  const calendarioMes = useMemo(() => {
    const dias = []
    for (let i = primeiroDia - 1; i >= 0; i--)
      dias.push({ date: new Date(ano, mes - 1, diasAnterior - i), outOfMonth: true })
    for (let d = 1; d <= totalDias; d++)
      dias.push({ date: new Date(ano, mes, d), outOfMonth: false })
    const restante = 7 - (dias.length % 7)
    if (restante < 7)
      for (let d = 1; d <= restante; d++)
        dias.push({ date: new Date(ano, mes + 1, d), outOfMonth: true })
    return dias
  }, [ano, mes, primeiroDia, totalDias, diasAnterior])

  const numLinhas = Math.ceil(calendarioMes.length / 7)

  const concluidas = etapas.filter(e => e.concluida).length
  const total = etapas.length

  function abrirEtapa(etapa) {
    if (!etapa?.cronogramaId || !etapa?.id) return
    navigate(`/app/etapa/${etapa.cronogramaId}/${etapa.id}`)
  }

  function abrirDia(date) {
    setDiaAtual(date)
    setView('Dia')
  }

  function navHoje() {
    const agora = new Date()
    setMesAtual(agora); setSemanaAtual(agora); setDiaAtual(agora)
  }

  function navAnterior() {
    if (view === 'Mês')    setMesAtual(new Date(ano, mes - 1, 1))
    else if (view === 'Semana') setSemanaAtual(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
    else setDiaAtual(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n })
  }

  function navProximo() {
    if (view === 'Mês')    setMesAtual(new Date(ano, mes + 1, 1))
    else if (view === 'Semana') setSemanaAtual(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
    else setDiaAtual(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n })
  }

  function toolbarLabel() {
    if (view === 'Mês') return (
      <span className="font-['Montserrat'] text-base font-semibold text-text">
        {tr('cron_meses')[mes]} <span className="font-normal text-text-tertiary">{ano}</span>
      </span>
    )
    if (view === 'Semana') {
      const days = getWeekDays(semanaAtual)
      const p = days[0], u = days[6]
      const label = p.getMonth() === u.getMonth()
        ? `${p.toLocaleDateString(locale, { day: '2-digit', month: 'long' })} – ${u.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })}`
        : `${p.toLocaleDateString(locale, { day: '2-digit', month: 'short' })} – ${u.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}`
      return <span className="font-['Montserrat'] text-base font-semibold text-text">{label}</span>
    }
    return (
      <span className="font-['Montserrat'] text-base font-semibold capitalize text-text">
        {diaAtual.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </span>
    )
  }

  const dateLabel = hoje.toLocaleDateString(locale, { day: '2-digit', month: 'long' })

  return (
    <AppShell onPrimaryAction={() => navigate('/app/home')}>
      <main className="min-h-screen bg-surface-muted px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="mx-auto max-w-[1320px]">

          {/* ── Header ── */}
          <header className="mb-5 sm:mb-8">

            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text transition hover:bg-surface-subtle"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-['Montserrat'] text-xl font-semibold text-text">
                {tr('cron_minha_rotina')}
              </h1>
            </div>

            <h1 className="hidden font-['Montserrat'] text-2xl font-semibold text-text sm:block">
              {tr('cron_minha_rotina')}
            </h1>
            <p className="mt-1 font-['Nunito_Sans'] text-sm leading-5 text-text-secondary">
              {tr('cron_descricao')}
            </p>
          </header>


          <div className="mb-4 sm:hidden">
            <div className="flex items-center rounded-full bg-surface-subtle p-[3px]">
              {['Mês', 'Semana', 'Dia'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex-1 rounded-full py-2 font-['Nunito_Sans'] text-sm font-semibold transition ${
                    view === v ? 'bg-surface text-text' : 'text-text-tertiary'
                  }`}
                >
                  {v === 'Mês' ? tr('cron_view_mes') : v === 'Semana' ? tr('cron_view_semana') : tr('cron_view_dia')}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <LoadingSkeleton />
          ) : etapas.length === 0 ? (
            <EmptyState onCreate={() => navigate('/questionario')} />
          ) : (
            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_340px] xl:items-stretch">

              {/* ── Calendar ── */}
              <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-surface sm:rounded-3xl">

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">


                  <div className="flex flex-1 items-center sm:hidden">
                    <button onClick={navAnterior} className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface-subtle">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="flex flex-1 justify-center">{toolbarLabel()}</div>
                    <button onClick={navProximo} className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface-subtle">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>


                  <div className="hidden items-center gap-2 sm:flex">
                    <button onClick={navAnterior} className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface-subtle hover:text-text">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button onClick={navProximo} className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition hover:bg-surface-subtle hover:text-text">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    {toolbarLabel()}
                    <button onClick={navHoje} className="rounded-full border border-paper-200 px-3 py-1 font-['Nunito_Sans'] text-xs font-semibold text-text-secondary transition hover:bg-surface-subtle">
                      {tr('cron_hoje')}
                    </button>
                  </div>

                  {/* Pill switcher — desktop */}
                  <div className="hidden items-center rounded-full bg-surface-subtle p-[3px] sm:flex">
                    {['Mês', 'Semana', 'Dia'].map(v => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        className={`rounded-full px-4 py-1.5 font-['Nunito_Sans'] text-sm font-semibold transition ${
                          view === v ? 'bg-surface text-text' : 'text-text-tertiary hover:text-text-secondary'
                        }`}
                      >
                        {v === 'Mês' ? tr('cron_view_mes') : v === 'Semana' ? tr('cron_view_semana') : tr('cron_view_dia')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── VIEW: MÊS ── */}
                {view === 'Mês' && (
                  <div className="flex flex-1 flex-col">

                    <div className="grid grid-cols-7 border-t border-b border-paper-200">
                      {WEEK_DAYS.map(day => (
                        <div key={day} className="py-2.5 text-center font-['Nunito_Sans'] text-xs font-semibold text-text-secondary sm:text-sm">
                          {day}
                        </div>
                      ))}
                    </div>


                    <div
                      className="grid flex-1 grid-cols-7"
                      style={{ gridTemplateRows: `repeat(${numLinhas}, minmax(0, 1fr))` }}
                    >
                      {calendarioMes.map(({ date, outOfMonth }, i) => {
                        const isToday        = isSameDay(date, hoje)
                        const isWeekend      = date.getDay() === 0 || date.getDay() === 6
                        const etapasDia      = getEtapasDoDia(date)
                        const isLastRow      = i >= calendarioMes.length - 7
                        const primeiraEtapa  = etapasDia[0] ?? null
                        const t              = primeiraEtapa ? getTreatment(primeiraEtapa.tipoCuidado) : null
                        const todasConcluidas = etapasDia.length > 0 && etapasDia.every(e => e.concluida)
                        const isLastCol      = (i + 1) % 7 === 0

                        return (
                          <div
                            key={i}
                            onClick={() => abrirDia(date)}
                            className={`
                              group flex cursor-pointer flex-col bg-surface transition hover:bg-surface-subtle
                              ${isLastCol ? '' : 'border-r border-paper-200'}
                              ${isLastRow ? '' : 'border-b border-paper-200'}
                            `}
                          >

                            <div className="flex min-h-[72px] flex-1 flex-col items-center justify-start px-1 pb-2 pt-2.5 sm:hidden">
                              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-['Nunito_Sans'] text-sm font-semibold ${
                                isToday        ? 'bg-ink text-white'
                                : outOfMonth   ? 'text-text-tertiary'
                                : isWeekend    ? 'text-lumi-weekend'
                                :                'text-text'
                              }`}>
                                {date.getDate()}
                              </span>


                              <div className="mt-1.5 flex h-6 w-6 items-center justify-center">
                                {!outOfMonth && todasConcluidas && (
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5E8C6A]">
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                )}
                                {!outOfMonth && !todasConcluidas && primeiraEtapa && (
                                  <span className={`flex h-6 w-6 items-center justify-center rounded-full ${t.iconBg}`}>
                                    <i className={`fa-solid ${t.icon} text-[10px] ${t.iconColor}`} />
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* ── Desktop: número + pills ── */}
                            <div className="hidden min-h-[108px] flex-1 flex-col p-2 sm:flex">
                              {/* Número do dia */}
                              <div className="mb-1.5">
                                <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-['Nunito_Sans'] text-sm font-semibold transition ${
                                  isToday        ? 'bg-ink text-white'
                                  : outOfMonth   ? 'text-text-tertiary'
                                  : isWeekend    ? 'text-lumi-weekend'
                                  :                'text-text group-hover:text-text'
                                }`}>
                                  {date.getDate()}
                                </span>
                              </div>

                              {/* Pills */}
                              <div className="flex flex-1 flex-col gap-0.5">
                                {etapasDia.slice(0, 4).map(etapa => (
                                  <DesktopEventPill
                                    key={etapa.id}
                                    etapa={etapa}
                                    faded={outOfMonth}
                                    onClick={e => { e.stopPropagation(); abrirEtapa(etapa) }}
                                  />
                                ))}
                                {etapasDia.length > 4 && (
                                  <span className="pl-1 font-['Nunito_Sans'] text-[10px] text-text-secondary">
                                    +{etapasDia.length - 4}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ── VIEW: SEMANA ── */}
                {view === 'Semana' && (
                  <WeekView semana={semanaAtual} hoje={hoje} getEtapasDoDia={getEtapasDoDia} onOpen={abrirEtapa} onAbrirDia={abrirDia} />
                )}

                {/* ── VIEW: DIA ── */}
                {view === 'Dia' && (
                  <DayView dia={diaAtual} hoje={hoje} getEtapasDoDia={getEtapasDoDia} onOpen={abrirEtapa} />
                )}
              </div>

              {/* ── Sidebar (só desktop) ── */}
              <aside className="hidden flex-col gap-4 xl:flex">
                <TodayCard etapa={etapaHoje} dateLabel={dateLabel} onOpen={abrirEtapa} onObservacao={() => setShowReg(true)} />
                <UpcomingCard etapas={proximasEtapas} onOpen={abrirEtapa} />
                <ProgressCard concluidas={concluidas} total={total} etapas={etapas} />
              </aside>

              {/* ── Cards mobile (abaixo do calendário) ── */}
              <div className="flex flex-col gap-4 xl:hidden">
                <TodayCard etapa={etapaHoje} dateLabel={dateLabel} onOpen={abrirEtapa} onObservacao={() => setShowReg(true)} />
                <UpcomingCard etapas={proximasEtapas} onOpen={abrirEtapa} />
                <ProgressCard concluidas={concluidas} total={total} etapas={etapas} />
              </div>
            </div>
          )}
        </div>
      </main>
      {showReg && (
        <RegistroModal
          onClose={() => setShowReg(false)}
          onSaved={() => setShowReg(false)}
          onConcluido={() => setShowReg(false)}
        />
      )}
    </AppShell>
  )
}

// ─── Desktop Event Pill ───────────────────────────────────────────────────────

function DesktopEventPill({ etapa, onClick, faded = false }) {
  const t = getTreatment(etapa.tipoCuidado)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderLeft: `2.5px solid ${t.hex}` }}
      className={`flex w-full items-center rounded-[8px] px-2 py-1 text-left transition hover:opacity-70 ${t.pillBg} ${
        faded ? 'opacity-30' : etapa.concluida ? 'opacity-50' : ''
      }`}
    >
      <span className={`truncate font-['Nunito_Sans'] text-[11px] font-medium ${t.pillText} ${etapa.concluida ? 'line-through' : ''}`}>
        {etapa.tipoCuidado}
      </span>
    </button>
  )
}

// ─── Week View ────────────────────────────────────────────────────────────────

function WeekView({ semana, hoje, getEtapasDoDia, onOpen, onAbrirDia }) {
  const { t: tr } = useIdioma()
  const days = getWeekDays(semana)
  return (
    <div className="flex flex-1 flex-col border-t border-paper-200">
      {days.map((date, i) => {
        const isToday   = isSameDay(date, hoje)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const etapasDia = getEtapasDoDia(date)
        return (
          <div key={i} className={`flex flex-1 ${i < days.length - 1 ? 'border-b border-paper-200' : ''} ${isToday ? 'bg-surface-subtle' : 'bg-surface'}`}>
            <button
              onClick={() => onAbrirDia(date)}
              className={`flex w-[80px] shrink-0 flex-col justify-center gap-0.5 border-r border-paper-200 px-3 py-4 text-left transition hover:bg-surface-subtle sm:w-[100px] sm:px-4 ${isToday ? 'bg-surface-muted' : ''}`}
            >
              <span className={`font-['Nunito_Sans'] text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] ${isWeekend ? 'text-lumi-weekend' : 'text-text-tertiary'}`}>
                {WEEK_DAYS[date.getDay()]}
              </span>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-['Montserrat'] text-base font-semibold sm:text-lg ${
                isToday ? 'bg-ink text-white' : isWeekend ? 'text-lumi-weekend' : 'text-text'
              }`}>
                {date.getDate()}
              </span>
            </button>
            <div className="flex min-h-[64px] flex-1 flex-wrap content-center items-center gap-2 px-3 py-3 sm:px-4">
              {etapasDia.length === 0 ? (
                <span className="font-['Nunito_Sans'] text-xs text-text-tertiary">{tr('cron_nenhum_cuidado')}</span>
              ) : (
                etapasDia.map(etapa => (
                  <WeekEventCard key={etapa.id} etapa={etapa} onClick={() => onOpen(etapa)} />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function WeekEventCard({ etapa, onClick }) {
  const { t: tr } = useIdioma()
  const t = getTreatment(etapa.tipoCuidado)
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderLeft: `2.5px solid ${t.hex}` }}
      className={`flex items-center gap-2 rounded-[8px] px-2.5 py-1.5 text-left transition hover:opacity-80 ${t.pillBg} ${etapa.concluida ? 'opacity-50' : ''}`}
    >
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] ${t.iconBg}`}>
        <i className={`fa-solid ${t.icon} text-[9px] ${t.iconColor}`} />
      </div>
      <div className="flex flex-col">
        <span className={`font-['Nunito_Sans'] text-xs font-semibold ${t.pillText} ${etapa.concluida ? 'line-through' : ''}`}>
          {etapa.tipoCuidado}
        </span>
        <span className="font-['Nunito_Sans'] text-[10px] text-text-secondary">
          {etapa.concluida ? tr('cron_concluido') : tr('cron_pendente')}
        </span>
      </div>
    </button>
  )
}

// ─── Day View ─────────────────────────────────────────────────────────────────

function DayView({ dia, hoje, getEtapasDoDia, onOpen }) {
  const { t: tr, idioma } = useIdioma()
  const locale = idioma === 'en' ? 'en-US' : 'pt-BR'
  const isToday   = isSameDay(dia, hoje)
  const etapasDia = getEtapasDoDia(dia)
  return (
    <div className="flex flex-1 flex-col border-t border-paper-200 p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <span className={`flex h-12 w-12 items-center justify-center rounded-full font-['Montserrat'] text-xl font-semibold ${
          isToday ? 'bg-ink text-white' : 'bg-surface-subtle text-text'
        }`}>
          {dia.getDate()}
        </span>
        <div>
          <p className="font-['Montserrat'] text-base font-semibold capitalize text-text">
            {dia.toLocaleDateString(locale, { weekday: 'long' })}
          </p>
          <p className="font-['Nunito_Sans'] text-sm text-text-secondary">
            {dia.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {etapasDia.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-14 text-center">
          <span className="font-['Nunito_Sans'] text-sm font-semibold text-text-secondary">{tr('cron_nenhum_programado')}</span>
          <span className="font-['Nunito_Sans'] text-xs text-text-secondary">{tr('cron_descansar')}</span>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          {etapasDia.map(etapa => {
            const t = getTreatment(etapa.tipoCuidado)
            return (
              <button
                key={etapa.id}
                type="button"
                onClick={() => onOpen(etapa)}
                style={{ borderLeft: `3px solid ${t.hex}` }}
                className={`flex items-center gap-4 rounded-[16px] p-4 text-left transition hover:opacity-80 ${t.pillBg} ${etapa.concluida ? 'opacity-50' : ''}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${t.iconBg}`}>
                  <i className={`fa-solid ${t.icon} text-sm ${t.iconColor}`} />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className={`font-['Nunito_Sans'] text-sm font-semibold ${t.pillText} ${etapa.concluida ? 'line-through' : ''}`}>
                    {etapa.tipoCuidado}
                  </span>
                  <span className="font-['Nunito_Sans'] text-xs text-text-secondary">
                    {etapa.concluida ? tr('cron_concluido') : tr('cron_pendente')}
                  </span>
                </div>
                <span className={`shrink-0 rounded-full px-4 py-1.5 font-['Nunito_Sans'] text-xs font-semibold text-white ${
                  etapa.concluida ? 'bg-[#5E8C6A]' : 'bg-ink'
                }`}>
                  {etapa.concluida ? tr('cron_feito') : tr('cron_iniciar')}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Today Card ───────────────────────────────────────────────────────────────

function TodayCard({ etapa, dateLabel, onOpen, onObservacao }) {
  const { t: tr } = useIdioma()
  if (!etapa) {
    return (
      <div className="flex flex-col gap-6 rounded-[24px] bg-surface p-6">
        <div className="flex flex-col gap-0.5">
          <p className="font-['Montserrat'] text-base font-semibold text-text">{tr('cron_em_foco')}</p>
          <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{dateLabel}</p>
        </div>
        <div className="flex flex-col items-center gap-6 rounded-[20px] p-6">
          <img src={ilustracaoVazia} alt={tr("cron_nenhum_programado")} className="h-[180px] w-[180px] object-contain" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-center font-['Montserrat'] text-sm font-semibold text-text-secondary">{tr('cron_nenhum_programado')}</p>
            <p className="text-center font-['Nunito_Sans'] text-xs leading-5 text-text-secondary">
              {tr('cron_observar_fios')}
            </p>
          </div>
          <button type="button" onClick={onObservacao} className="w-full rounded-[24px] bg-ink py-3 font-['Nunito_Sans'] text-xs font-semibold text-white transition hover:opacity-90">
            {tr('cron_registrar_obs')}
          </button>
        </div>
      </div>
    )
  }

  const t = getTreatment(etapa.tipoCuidado)
  return (
    <div className="flex flex-col gap-3 rounded-[24px] bg-surface p-6">
      <div className="flex flex-col gap-0.5">
        <p className="font-['Montserrat'] text-base font-semibold text-text">{tr('cron_em_foco')}</p>
        <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{dateLabel}</p>
      </div>
      <button type="button" onClick={() => onOpen(etapa)} className="flex w-full items-center gap-3 text-left transition hover:opacity-80">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconBg}`}>
          <i className={`fa-solid ${t.icon} text-sm ${t.iconColor}`} />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="font-['Nunito_Sans'] text-sm font-semibold text-text">{etapa.tipoCuidado}</span>
          <span className="font-['Nunito_Sans'] text-xs text-text-secondary">{etapa.concluida ? tr('cron_concluido') : tr('cron_pendente')}</span>
        </div>
        <span className={`shrink-0 rounded-[24px] px-4 py-1.5 font-['Nunito_Sans'] text-xs font-semibold text-white ${etapa.concluida ? 'bg-[#5E8C6A]' : 'bg-ink'}`}>
          {etapa.concluida ? tr('cron_feito') : tr('cron_iniciar')}
        </span>
      </button>
    </div>
  )
}

// ─── Upcoming Card ────────────────────────────────────────────────────────────

function UpcomingCard({ etapas, onOpen }) {
  const { t: tr, idioma } = useIdioma()
  const locale = idioma === 'en' ? 'en-US' : 'pt-BR'
  return (
    <div className="flex flex-col gap-4 rounded-[24px] bg-surface p-6">
      <div className="flex flex-col gap-0.5">
        <p className="font-['Montserrat'] text-base font-semibold text-text">{tr('cron_proximas_etapas')}</p>
        <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{tr('cron_proximas_sub')}</p>
      </div>
      {etapas.length === 0 ? (
        <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{tr('cron_nenhuma_pendente')}</p>
      ) : (
        <div className="flex flex-col divide-y divide-paper-200">
          {etapas.map(etapa => {
            const data = toDate(etapa.dataEtapa)
            const t    = getTreatment(etapa.tipoCuidado)
            return (
              <button key={etapa.id} type="button" onClick={() => onOpen(etapa)} className="flex items-center gap-3 py-3 text-left transition hover:opacity-70 first:pt-0 last:pb-0">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${t.iconBg}`}>
                  <i className={`fa-solid ${t.icon} text-sm ${t.iconColor}`} />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-['Nunito_Sans'] text-sm font-semibold text-text">{etapa.tipoCuidado}</span>
                  <span className="font-['Nunito_Sans'] text-xs text-text-secondary">
                    {data?.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 text-text-secondary">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Progress Card ────────────────────────────────────────────────────────────

function ProgressCard({ concluidas, total, etapas }) {
  const { t: tr } = useIdioma()
  const resumo = useMemo(() => {
    const map = {}
    etapas.forEach(e => {
      const tipo = e.tipoCuidado || 'Outros'
      if (!map[tipo]) map[tipo] = { total: 0, done: 0 }
      map[tipo].total++
      if (e.concluida) map[tipo].done++
    })
    return Object.entries(map).slice(0, 4)
  }, [etapas])

  return (
    <div className="flex flex-col gap-4 rounded-[24px] bg-surface p-6">
      <div className="flex flex-col gap-0.5">
        <p className="font-['Montserrat'] text-base font-semibold text-text">{tr('cron_progresso')}</p>
        <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{concluidas} {tr('cron_de')} {total} {tr('cron_etapas_concluidas')}</p>
      </div>
      <div className="flex flex-col gap-4">
        {resumo.map(([tipo, item]) => {
          const t   = getTreatment(tipo)
          const pct = item.total ? Math.round((item.done / item.total) * 100) : 0
          return (
            <div key={tipo} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-['Nunito_Sans'] text-sm font-semibold text-text">{tipo}</span>
                <span className="font-['Nunito_Sans'] text-xs text-text-secondary">{item.done}/{item.total}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-subtle">
                <div className={`h-full rounded-full ${t.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate }) {
  const { t: tr } = useIdioma()
  return (
    <div className="mt-6 flex flex-col items-center gap-6 rounded-3xl bg-surface px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white">
        <i className="fa-solid fa-calendar-plus text-lg" />
      </div>
      <div>
        <h2 className="font-['Montserrat'] text-xl font-semibold text-text">{tr('cron_rotina_nao_criada')}</h2>
        <p className="mx-auto mt-2 max-w-md font-['Nunito_Sans'] text-sm leading-6 text-text-secondary">
          {tr('cron_rotina_nao_criada_sub')}
        </p>
      </div>
      <button type="button" onClick={onCreate} className="rounded-full bg-ink px-6 py-3 font-['Nunito_Sans'] text-sm font-semibold text-white transition hover:opacity-90">
        {tr('cron_criar_rotina')}
      </button>
    </div>
  )
}

// ─── Loading  ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="h-[580px] animate-pulse rounded-3xl bg-surface/80" />
      <div className="flex flex-col gap-4">
        <div className="h-[400px] animate-pulse rounded-[24px] bg-surface/80" />
        <div className="h-48 animate-pulse rounded-[24px] bg-surface/80" />
        <div className="h-52 animate-pulse rounded-[24px] bg-surface/80" />
      </div>
    </div>
  )
}
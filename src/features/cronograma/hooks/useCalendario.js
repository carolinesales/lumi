import { useState } from 'react'
import { MONTHS, buildMonthCalendar, getWeekDays } from '../lib/calendar'

export function useCalendario() {
  const [view,        setView]        = useState('Mês')
  const [mesAtual,    setMesAtual]    = useState(new Date())
  const [semanaAtual, setSemanaAtual] = useState(new Date())
  const [diaAtual,    setDiaAtual]    = useState(new Date())

  const ano = mesAtual.getFullYear()
  const mes = mesAtual.getMonth()

  const calendarioMes = buildMonthCalendar(ano, mes)

  function navAnterior() {
    if      (view === 'Mês')    setMesAtual(new Date(ano, mes - 1, 1))
    else if (view === 'Semana') setSemanaAtual(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
    else                        setDiaAtual(d    => { const n = new Date(d); n.setDate(n.getDate() - 1); return n })
  }

  function navProximo() {
    if      (view === 'Mês')    setMesAtual(new Date(ano, mes + 1, 1))
    else if (view === 'Semana') setSemanaAtual(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
    else                        setDiaAtual(d    => { const n = new Date(d); n.setDate(n.getDate() + 1); return n })
  }

  function navHoje() {
    const agora = new Date()
    setMesAtual(agora); setSemanaAtual(agora); setDiaAtual(agora)
  }

  function abrirDia(date) {
    setDiaAtual(date)
    setView('Dia')
  }

  function toolbarLabel() {
    if (view === 'Mês') {
      return `${MONTHS[mes]} ${ano}`
    }
    if (view === 'Semana') {
      const days = getWeekDays(semanaAtual)
      const p = days[0], u = days[6]
      return p.getMonth() === u.getMonth()
        ? `${p.getDate()} – ${u.getDate()} de ${MONTHS[p.getMonth()]} ${p.getFullYear()}`
        : `${p.getDate()} ${MONTHS[p.getMonth()].slice(0, 3)} – ${u.getDate()} ${MONTHS[u.getMonth()].slice(0, 3)} ${u.getFullYear()}`
    }
    return diaAtual.toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
  }

  return {
    view, setView,
    mesAtual, semanaAtual, diaAtual,
    ano, mes,
    calendarioMes,
    navAnterior, navProximo, navHoje, abrirDia,
    toolbarLabel,
  }
}
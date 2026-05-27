// ─── Tratamentos ─────────────────────────────────────────────────────────────
// Ícones importados de src/constants/ritualTipos.js para manter consistência

import { RITUAL_TIPO_ICON } from '@/constants/ritualTipos'

export const TREATMENTS = {
  Hidratação: {
    icon: RITUAL_TIPO_ICON.Hidratação,   // fa-droplet
    iconBg: 'bg-[#E3F3FA]',
    iconColor: 'text-[#2F88A3]',
    pillBg: 'bg-[#EAF4F9]',
    pillText: 'text-[#2F88A3]',
    bar: 'bg-[#5B9EBF]',
    hex: '#5B9EBF',
  },
  Nutrição: {
    icon: RITUAL_TIPO_ICON.Nutrição,     // fa-leaf
    iconBg: 'bg-[#E3F9EF]',
    iconColor: 'text-[#3D7A4A]',
    pillBg: 'bg-[#EDF6EE]',
    pillText: 'text-[#3D7A4A]',
    bar: 'bg-[#5EA06A]',
    hex: '#5EA06A',
  },
  Reconstrução: {
    icon: RITUAL_TIPO_ICON.Reconstrução, // fa-shield-heart
    iconBg: 'bg-[#FAF0EA]',
    iconColor: 'text-[#A95D35]',
    pillBg: 'bg-[#FAF0EA]',
    pillText: 'text-[#A95D35]',
    bar: 'bg-[#C47A52]',
    hex: '#C47A52',
  },
  Umectação: {
    icon: RITUAL_TIPO_ICON.Umectação,    // fa-droplet
    iconBg: 'bg-[#FBF6E3]',
    iconColor: 'text-[#9A7416]',
    pillBg: 'bg-[#FBF6E3]',
    pillText: 'text-[#9A7416]',
    bar: 'bg-[#C4A033]',
    hex: '#C4A033',
  },
  Detox: {
    icon: RITUAL_TIPO_ICON.Detox,        // fa-sparkles
    iconBg: 'bg-[#F3EFFC]',
    iconColor: 'text-[#7459A6]',
    pillBg: 'bg-[#F3EFFC]',
    pillText: 'text-[#7459A6]',
    bar: 'bg-[#8B6FC4]',
    hex: '#8B6FC4',
  },
  Lavagem: {
    icon: RITUAL_TIPO_ICON.Lavagem,      // fa-soap
    iconBg: 'bg-[#EEF2F3]',
    iconColor: 'text-[#627176]',
    pillBg: 'bg-[#EEF2F3]',
    pillText: 'text-[#627176]',
    bar: 'bg-[#7A9299]',
    hex: '#7A9299',
  },
}

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const WEEK_DAYS      = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
export const WEEK_DAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// ─── Helpers de data ─────────────────────────────────────────────────────────

export function getTreatment(tipo) {
  return TREATMENTS[tipo] ?? TREATMENTS.Hidratação
}

export function toDate(value) {
  if (!value) return null
  if (value.toDate) return value.toDate()
  return new Date(value)
}

export function isSameDay(a, b) {
  if (!a || !b) return false
  return (
    a.getDate()     === b.getDate()  &&
    a.getMonth()    === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

/** Retorna os 7 dias da semana (dom→sáb) que contém `date` */
export function getWeekDays(date) {
  const d      = new Date(date)
  const sunday = new Date(d)
  sunday.setDate(d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday)
    day.setDate(sunday.getDate() + i)
    return day
  })
}

/** Gera as células do calendário mensal (inclui dias adjacentes para completar semanas) */
export function buildMonthCalendar(ano, mes) {
  const primeiroDia  = new Date(ano, mes, 1).getDay()
  const totalDias    = new Date(ano, mes + 1, 0).getDate()
  const diasAnterior = new Date(ano, mes, 0).getDate()

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
}
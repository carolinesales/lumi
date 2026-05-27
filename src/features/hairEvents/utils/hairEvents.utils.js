// src/features/hairEvents/utils/hairEvents.utils.js
import { HAIR_EVENTS, HAIR_EVENT_FOLLOW_UPS, HAIR_EVENT_SEVERITY } from '../constants/hairEvents.constants'

export function getHairEvent(id) {
  return HAIR_EVENTS.find(event => event.id === id)
}

export function getHairEventsByIds(ids = []) {
  return ids.map(getHairEvent).filter(Boolean)
}

export function getHairEventFollowUps(ids = []) {
  const events = getHairEventsByIds(ids.includes('nada') ? ['nada'] : ids)
  const followUpIds = new Set()

  events.forEach(event => {
    event.followUp?.forEach(id => followUpIds.add(id))
  })

  return [...followUpIds]
    .map(id => HAIR_EVENT_FOLLOW_UPS[id])
    .filter(Boolean)
}

export function calculateHairEventsDelta(ids = [], contexto = {}) {
  const events = getHairEventsByIds(ids.includes('nada') ? [] : ids)

  const hasActiveFragility = contexto?.fragilidadeAtiva || contexto?.fragilidade?.ativa

  const total = events.reduce((acc, event) => {
    if ((event.id === 'corte' || event.id === 'corte_pontas') && hasActiveFragility) {
      return acc
    }

    return acc + (event.delta ?? 0)
  }, 0)

  return Math.max(-10, Math.min(3, total))
}

export function getHairEventsSeverity(ids = []) {
  const events = getHairEventsByIds(ids)

  if (events.some(event => event.severity === HAIR_EVENT_SEVERITY.critical)) {
    return HAIR_EVENT_SEVERITY.critical
  }

  if (events.some(event => event.severity === HAIR_EVENT_SEVERITY.attention)) {
    return HAIR_EVENT_SEVERITY.attention
  }

  if (events.some(event => event.severity === HAIR_EVENT_SEVERITY.positive)) {
    return HAIR_EVENT_SEVERITY.positive
  }

  return HAIR_EVENT_SEVERITY.neutral
}

export function shouldActivateFragility(ids = []) {
  return getHairEventsByIds(ids).some(event => event.activatesFragility)
}

export function getHairEventsInsight(ids = []) {
  const severity = getHairEventsSeverity(ids)

  if (ids.includes('nada')) {
    return 'Seu plano continua como base. Vamos apenas acompanhar como seus fios estão hoje.'
  }

  if (severity === HAIR_EVENT_SEVERITY.critical) {
    return 'Esse evento pode deixar os fios mais sensíveis. O Lumi vai priorizar recuperação gradual.'
  }

  if (severity === HAIR_EVENT_SEVERITY.attention) {
    return 'Esse evento merece atenção. Pequenos ajustes ajudam a evitar ressecamento, queda ou quebra.'
  }

  if (severity === HAIR_EVENT_SEVERITY.positive) {
    return 'Essa mudança pode ajudar na percepção das pontas, mas a rotina continua sendo importante.'
  }

  return 'Evento registrado. O Lumi usa esse contexto para acompanhar melhor seus fios.'
}

export function toggleHairEvent(ids = [], id) {
  if (id === 'nada') return ['nada']

  const withoutNada = ids.filter(item => item !== 'nada')
  return withoutNada.includes(id)
    ? withoutNada.filter(item => item !== id)
    : [...withoutNada, id]
}

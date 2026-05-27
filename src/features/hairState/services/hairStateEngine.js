import { HAIR_STATES } from '../constants/hairStates.constants'

export function resolveHairState({
  score = 0,
  fragilidade = false,
  eventos = [],
  delta = 0,
}) {
  const hasCriticalEvent =
    eventos.includes('corte_quimico') ||
    eventos.includes('descoloracao')

  const hasAttentionEvent =
    eventos.includes('quimica') ||
    eventos.includes('queda') ||
    eventos.includes('calor')

  if (hasCriticalEvent || fragilidade) {
    return HAIR_STATES.fragilizado
  }

  if (score <= 40) {
    return HAIR_STATES.sobrecarregado
  }

  if (hasAttentionEvent) {
    return HAIR_STATES.sensibilizado
  }

  if (score < 75 || delta > 0) {
    return HAIR_STATES.recuperacao
  }

  return HAIR_STATES.equilibrado
}
export function getHairStateMessage(state) {
  return state?.description || ''
}

export function isHairCritical(state) {
  return [
    'fragilizado',
    'sobrecarregado',
  ].includes(state?.id)
}
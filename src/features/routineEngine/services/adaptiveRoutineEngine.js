// src/features/routineEngine/services/adaptiveRoutineEngine.js
import { ROUTINE_ACTIONS, ROUTINE_FOCUS } from '../constants/routineEngine.constants'

function hasAny(list = [], values = []) {
  return values.some(v => list.includes(v))
}

export function resolveRoutineFocus({
  hairState,
  hairScore,
  eventos = [],
  fragilidade,
}) {
  const score = Number(hairScore ?? 0)
  const stateId = hairState?.id

  if (
    fragilidade?.ativa ||
    stateId === 'fragilizado' ||
    hasAny(eventos, ['corte_quimico'])
  ) {
    return ROUTINE_FOCUS.recuperacao
  }

  if (hasAny(eventos, ['descoloracao', 'quimica', 'coloracao'])) {
    return ROUTINE_FOCUS.posQuimica
  }

  if (hasAny(eventos, ['queda', 'couro'])) {
    return ROUTINE_FOCUS.couro
  }

  if (hasAny(eventos, ['calor', 'piscina_mar']) || score < 60) {
    return ROUTINE_FOCUS.hidratacao
  }

  if (score < 75 || stateId === 'recuperacao') {
    return ROUTINE_FOCUS.nutricao
  }

  return ROUTINE_FOCUS.manutencao
}

export function generateAdaptiveRoutine({
  hairState,
  hairScore,
  eventos = [],
  fragilidade,
  clima,
}) {
  const focus = resolveRoutineFocus({
    hairState,
    hairScore,
    eventos,
    fragilidade,
  })

  const actions = []

  if (focus.id === 'recuperacao') {
    actions.push(
      ROUTINE_ACTIONS.pausaTecnica,
      ROUTINE_ACTIONS.reconstrucaoGradual,
      ROUTINE_ACTIONS.hidratacaoIntensa,
      ROUTINE_ACTIONS.nutricao
    )
  }

  if (focus.id === 'posQuimica') {
    actions.push(
      ROUTINE_ACTIONS.pausaTecnica,
      ROUTINE_ACTIONS.hidratacaoIntensa,
      ROUTINE_ACTIONS.reconstrucaoGradual,
      ROUTINE_ACTIONS.nutricao
    )
  }

  if (focus.id === 'couro') {
    actions.push(
      ROUTINE_ACTIONS.detoxCouro,
      ROUTINE_ACTIONS.hidratacaoLeve,
      ROUTINE_ACTIONS.manutencao
    )
  }

  if (focus.id === 'hidratacao') {
    actions.push(
      ROUTINE_ACTIONS.hidratacaoIntensa,
      ROUTINE_ACTIONS.protecaoTermica,
      ROUTINE_ACTIONS.nutricao
    )
  }

  if (focus.id === 'nutricao') {
    actions.push(
      ROUTINE_ACTIONS.nutricao,
      ROUTINE_ACTIONS.hidratacaoLeve,
      ROUTINE_ACTIONS.manutencao
    )
  }

  if (focus.id === 'manutencao') {
    actions.push(
      ROUTINE_ACTIONS.manutencao,
      ROUTINE_ACTIONS.hidratacaoLeve
    )
  }

  if (clima?.umidade <= 45 && !actions.some(a => a.id === 'hidratacaoIntensa')) {
    actions.unshift(ROUTINE_ACTIONS.hidratacaoIntensa)
  }

  if (hasAny(eventos, ['calor']) && !actions.some(a => a.id === 'protecaoTermica')) {
    actions.unshift(ROUTINE_ACTIONS.protecaoTermica)
  }

  const uniqueActions = []
  const seen = new Set()

  actions.forEach(action => {
    if (!seen.has(action.id)) {
      seen.add(action.id)
      uniqueActions.push(action)
    }
  })

  return {
    focus,
    actions: uniqueActions.slice(0, 4),
    intensity: resolveRoutineIntensity({ hairState, hairScore, fragilidade }),
    warnings: resolveRoutineWarnings({ eventos, fragilidade }),
  }
}

export function resolveRoutineIntensity({
  hairState,
  hairScore,
  fragilidade,
}) {
  const score = Number(hairScore ?? 0)

  if (fragilidade?.ativa || hairState?.id === 'fragilizado') return 'suave'
  if (score < 55) return 'moderada'
  if (score >= 80) return 'leve'
  return 'equilibrada'
}

export function resolveRoutineWarnings({
  eventos = [],
  fragilidade,
}) {
  const warnings = []

  if (fragilidade?.ativa || eventos.includes('corte_quimico')) {
    warnings.push('Evite química e calor até os fios recuperarem estabilidade.')
  }

  if (eventos.includes('descoloracao')) {
    warnings.push('Descoloração recente pede recuperação gradual, sem excesso de reconstrução.')
  }

  if (eventos.includes('queda')) {
    warnings.push('Observe a queda por alguns dias e evite tração forte.')
  }

  if (eventos.includes('calor')) {
    warnings.push('Use proteção térmica antes de qualquer fonte de calor.')
  }

  return warnings
}

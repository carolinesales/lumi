// src/features/hairScore/utils/hairScore.utils.js
import { HAIR_SCORE_STATES, HAIR_SCORE_THRESHOLDS } from '../constants/hairScore.constants'

export function clampScore(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function getHairScoreState(score, fragilidade = null) {
  const value = clampScore(score)

  if (!value) return HAIR_SCORE_STATES.neutral

  if (fragilidade?.ativa || fragilidade?.nivel === 'critica' || fragilidade?.nivel === 'alta') {
    if (value < 70) return HAIR_SCORE_STATES.fragil
  }

  if (value >= HAIR_SCORE_THRESHOLDS.radiante) return HAIR_SCORE_STATES.radiante
  if (value >= HAIR_SCORE_THRESHOLDS.evolucao) return HAIR_SCORE_STATES.evolucao
  if (value >= HAIR_SCORE_THRESHOLDS.construcao) return HAIR_SCORE_STATES.construcao
  return HAIR_SCORE_STATES.cuidado
}

export function getHairScoreDeltaMeta(delta = 0) {
  const value = Number(delta) || 0

  if (value > 0) {
    return {
      tone: 'positive',
      icon: 'fa-arrow-trend-up',
      label: `+${value} hoje`,
      className: 'text-[var(--score-positive)]',
    }
  }

  if (value < 0) {
    return {
      tone: 'negative',
      icon: 'fa-arrow-trend-down',
      label: `${value} hoje`,
      className: 'text-[var(--score-negative)]',
    }
  }

  return {
    tone: 'neutral',
    icon: 'fa-minus',
    label: 'estável hoje',
    className: 'text-[var(--score-muted)]',
  }
}

export function getHairScoreTrend(scoreAtual, scoreAnterior) {
  const atual = clampScore(scoreAtual)
  const anterior = clampScore(scoreAnterior)

  if (atual > anterior) return 'up'
  if (atual < anterior) return 'down'
  return 'stable'
}

export function getHairScoreMessage(score, fragilidade = null) {
  return getHairScoreState(score, fragilidade).message
}

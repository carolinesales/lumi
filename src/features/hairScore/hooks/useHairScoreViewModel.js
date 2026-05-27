// src/features/hairScore/hooks/useHairScoreViewModel.js
import { useMemo } from 'react'
import { clampScore, getHairScoreDeltaMeta, getHairScoreMessage, getHairScoreState, getHairScoreTrend } from '../utils/hairScore.utils'

export default function useHairScoreViewModel({
  perfil,
  hairScore,
}) {
  return useMemo(() => {
    const scoreBase = perfil?.hairScoreBase ?? perfil?.hairScore ?? perfil?.scoreBase ?? 0
    const scoreAjuste = perfil?.hairScoreAjuste ?? 0
    const scoreCalculado = clampScore(scoreBase + scoreAjuste)

    const score = clampScore(perfil?.hairScoreAtual ?? hairScore?.pontuacao ?? scoreCalculado ?? 0)
    const delta = perfil?.hairScoreDelta ?? hairScore?.delta ?? 0
    const anterior = perfil?.hairScoreAnterior ?? hairScore?.anterior ?? score

    const fragilidade = {
      ativa: perfil?.fragilidadeAtiva ?? hairScore?.fragilidade?.ativa ?? false,
      nivel: perfil?.fragilidadeNivel ?? hairScore?.fragilidade?.nivel ?? 'nenhuma',
      motivos: perfil?.fragilidadeMotivos ?? hairScore?.fragilidade?.motivos ?? [],
    }

    const state = getHairScoreState(score, fragilidade)
    const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : getHairScoreTrend(score, anterior)

    return {
      score,
      delta,
      anterior,
      fragilidade,
      state,
      trend,
      deltaMeta: getHairScoreDeltaMeta(delta),
      message: getHairScoreMessage(score, fragilidade),
    }
  }, [perfil, hairScore])
}

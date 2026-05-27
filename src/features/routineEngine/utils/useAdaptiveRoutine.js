// src/features/routineEngine/utils/useAdaptiveRoutine.js
import { useMemo } from 'react'
import { generateAdaptiveRoutine } from '../services/adaptiveRoutineEngine'

export default function useAdaptiveRoutine({
  hairState,
  hairScore,
  eventos,
  fragilidade,
  clima,
}) {
  return useMemo(() => {
    return generateAdaptiveRoutine({
      hairState,
      hairScore,
      eventos,
      fragilidade,
      clima,
    })
  }, [hairState, hairScore, eventos, fragilidade, clima])
}

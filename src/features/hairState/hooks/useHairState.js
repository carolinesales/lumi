import { useMemo } from 'react'
import { resolveHairState } from '../services/hairStateEngine'

export default function useHairState({
  score,
  delta,
  eventos,
  fragilidade,
}) {
  return useMemo(() => {
    return resolveHairState({
      score,
      delta,
      eventos,
      fragilidade,
    })
  }, [
    score,
    delta,
    eventos,
    fragilidade,
  ])
}
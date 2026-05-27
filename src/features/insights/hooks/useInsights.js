import { useMemo } from 'react'
import { generateInsights } from '../services/insightEngine'

export default function useInsights(data) {
  return useMemo(() => {
    return generateInsights(data)
  }, [data])
}
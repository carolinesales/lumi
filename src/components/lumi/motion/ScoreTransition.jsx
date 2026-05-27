// src/components/lumi/motion/ScoreTransition.jsx
import { useEffect, useState } from 'react'

export default function ScoreTransition({
  value,
  trend = 'stable',
  className = '',
}) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)

    const timer = setTimeout(() => {
      setAnimate(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [value])

  const animation =
    trend === 'up'
      ? 'lumi-score-pulse 520ms var(--ease-lumi)'
      : trend === 'down'
        ? 'lumi-score-drop 520ms var(--ease-lumi)'
        : undefined

  return (
    <div
      className={className}
      style={{
        animation: animate ? animation : undefined,
      }}
    >
      {value}
    </div>
  )
}

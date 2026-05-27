// src/components/lumi/motion/FloatGlow.jsx

export default function FloatGlow({
  className = '',
}) {
  return (
    <div
      aria-hidden
      className={[
        'pointer-events-none absolute rounded-full blur-3xl',
        className,
      ].join(' ')}
      style={{
        animation: 'lumi-glow-float 5s ease-in-out infinite',
      }}
    />
  )
}

// src/components/lumi/motion/LiquidSurface.jsx

export default function LiquidSurface({
  children,
  className = '',
}) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-[28px] border border-white/60 bg-white/70 backdrop-blur-2xl',
        className,
      ].join(' ')}
      style={{
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,.55), transparent 42%)',
        }}
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

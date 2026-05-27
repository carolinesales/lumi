// src/components/lumi/motion/FadeUp.jsx

export default function FadeUp({
  children,
  delay = 0,
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        animation: `lumi-fade-up 420ms var(--ease-lumi) both`,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

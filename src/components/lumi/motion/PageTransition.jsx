// src/components/lumi/motion/PageTransition.jsx

export default function PageTransition({
  children,
}) {
  return (
    <div
      style={{
        animation: 'lumi-fade-up 520ms var(--ease-lumi)',
      }}
    >
      {children}
    </div>
  )
}

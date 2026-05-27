import { Card } from '@/components/ui/card'

export default function LumiCard({
  children,
  className = '',
  hover = false,
  ...props
}) {
  return (
    <section
      className={[
        'lumi-card-premium',
        hover ? 'lumi-surface-hover' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </section>
  )
}


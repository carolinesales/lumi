import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input({ className, error, disabled, ...props }, ref) {
  return (
    <input
      ref={ref}
      disabled={disabled}
      className={cn(
        'w-full rounded-[8px] border bg-surface px-4 py-3.5',
        'font-nunito text-base text-text outline-none transition',
        'placeholder:text-text-tertiary',
        disabled
          ? 'cursor-not-allowed border-paper-200 bg-surface-subtle text-text-tertiary'
          : error
          ? 'border-state-negative focus:border-state-negative'
          : 'border-paper-200 hover:border-text-tertiary focus:border-ink',
        className,
      )}
      {...props}
    />
  )
})

export default Input

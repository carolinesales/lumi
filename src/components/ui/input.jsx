import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(function Input({ className, error, disabled, ...props }, ref) {
  return (
    <input
      ref={ref}
      disabled={disabled}
      className={cn(
        'w-full rounded-[8px] border bg-white px-4 py-3.5',
        'font-nunito text-base text-lumi-black outline-none transition',
        'placeholder:text-lumi-muted',
        disabled
          ? 'cursor-not-allowed border-lumi-border bg-lumi-input text-lumi-gray'
          : error
          ? 'border-[#dc3232] focus:border-[#dc3232]'
          : 'border-lumi-border hover:border-lumi-gray focus:border-lumi-black',
        className,
      )}
      {...props}
    />
  )
})

export default Input

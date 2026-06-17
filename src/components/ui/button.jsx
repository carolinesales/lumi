import * as React from 'react'
import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '@/lib/utils'


const buttonVariants = cva(
  
  [
    'inline-flex items-center justify-center gap-2',
    'rounded-full font-nunito text-sm font-semibold whitespace-nowrap',
    'transition-all duration-150',
    'outline-none select-none',
    'focus-visible:ring-2 focus-visible:ring-lumi-black focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // ── Primário ───────────────────────────────────────
        default: [
          'bg-ink text-white dark:bg-white dark:text-ink',
          'hover:bg-[#272522]',
          'active:scale-[.98]',
        ],

        // ── Secundário ───────────────────────────────
        secondary: [
          'bg-lumi-input text-lumi-black',
          'hover:bg-[#E5E5E5]',
          'active:scale-[.98]',
        ],

        // ── Ghost ────────────────────────────────────────────
        ghost: [
          'bg-transparent text-lumi-black',
          'hover:bg-lumi-input',
          'active:scale-[.98]',
        ],

        // ── Outline ───────────────────────────────
        outline: [
          'border border-paper-200 bg-surface text-text',
          'hover:bg-surface-subtle',
          'active:scale-[.98]',
        ],

        // ── Destructive ───────────────────────────────
        destructive: [
          'bg-state-negative-soft text-state-negative',
          'hover:opacity-90',
          'active:scale-[.98]',
        ],

        // ── Link ───────────────────────────────
        link: [
          'bg-transparent text-text underline-offset-4',
          'hover:underline',
        ],
      },

      size: {
        default: 'h-11 px-5',    // 44px 
        sm:      'h-9  px-4',    // 36px
        lg:      'h-[52px] px-6 text-base', // 52px 
        icon:    'h-9  w-9  p-0',
        'icon-sm': 'h-8 w-8 p-0',
      },
    },

    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
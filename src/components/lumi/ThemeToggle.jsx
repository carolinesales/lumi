// src/components/lumi/ThemeToggle.jsx
import { useTheme } from '@/hooks/useTheme'
import { cn }       from '@/lib/utils'

export default function ThemeToggle({ variant = 'icon', className }) {
  const { tema, alternar, isDark } = useTheme()

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={alternar}
        aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-nunito text-sm',
          'text-lumi-gray transition hover:bg-lumi-input',
          className,
        )}
      >
        <i
          className={cn('fa-solid text-base', isDark ? 'fa-sun' : 'fa-moon')}
          aria-hidden="true"
        />
        {isDark ? 'Modo claro' : 'Modo escuro'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-full transition',
        'text-lumi-gray hover:bg-lumi-input hover:text-lumi-black',
        className,
      )}
    >
      <i
        className={cn('fa-solid text-base', isDark ? 'fa-sun' : 'fa-moon')}
        aria-hidden="true"
      />
    </button>
  )
}

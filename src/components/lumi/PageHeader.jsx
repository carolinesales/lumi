// src/components/lumi/PageHeader.jsx
import { Link }   from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function PageHeader({
  eyebrow,
  title,
  description,
  backTo    = '/app/home',
  backLabel = 'Início',
  actionLabel,
  actionIcon = 'fa-xmark',
  onAction,
  children,
}) {
  return (
    <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-3 flex items-center gap-2 font-['Nunito_Sans'] text-xs text-text-tertiary">
            <Link to={backTo} className="font-semibold text-text-tertiary transition hover:text-text">
              {backLabel}
            </Link>
            <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
            <span>{eyebrow}</span>
          </div>
        )}

        <h1 className="font-['Montserrat'] text-xl font-semibold leading-[40px] text-text sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 max-w-xl font-['Nunito_Sans'] text-sm leading-5 text-text-secondary">
            {description}
          </p>
        )}
      </div>

      {(actionLabel || children) && (
        <div className="flex items-center gap-2">
          {children}
          {actionLabel && (
            <Button variant="outline" size="sm" onClick={onAction}>
              <i className={`fa-solid ${actionIcon} text-xs`} aria-hidden="true" />
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </header>
  )
}
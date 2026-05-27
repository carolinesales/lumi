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
          <div className="mb-3 flex items-center gap-2 font-nunito text-xs text-lumi-gray">
            <Link to={backTo} className="font-semibold text-lumi-gray transition hover:text-lumi-black">
              {backLabel}
            </Link>
            <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
            <span>{eyebrow}</span>
          </div>
        )}

        <h1 className="font-['Montserrat'] text-[34px] font-normal leading-none tracking-[-0.07em] text-lumi-black">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-xl font-nunito text-sm leading-7 text-lumi-secondary">
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
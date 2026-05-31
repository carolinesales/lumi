/**
 * src/pages/perfil/base.jsx
 * Primitivos de layout para as páginas de perfil.
 * Usa Button do shadcn e Tailwind puro — zero inline styles.
 */
import { useNavigate }     from 'react-router-dom'
import { useIdioma }       from '@/contexts/IdiomaContext'
import { Button }          from '@/components/ui/button'
import Input               from '@/components/ui/input'
import { cn }              from '@/lib/utils'

// ─── PageLayout ───────────────────────────────────────────────────────────────

export function PageLayout({
  titulo,
  children,
  onSalvar,
  salvando,
  sucesso,
  erro,
  modificado = false,
}) {
  const navigate = useNavigate()
  const { t }    = useIdioma()
  const podeS    = modificado && !salvando

  return (
    <div className="min-h-screen bg-lumi-bg pb-28 lg:pb-12">

      {/* ── Topbar mobile ── */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-lumi-border bg-white px-5 pb-3.5 pt-12 lg:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate('/app/perfil')}
          aria-label="Voltar"
        >
          <i className="fa-solid fa-chevron-left text-sm" aria-hidden="true" />
        </Button>
        <h1 className="flex-1 font-['Montserrat'] text-base font-semibold text-lumi-black">
          {titulo}
        </h1>
        {onSalvar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={podeS ? onSalvar : undefined}
            disabled={!podeS}
          >
            {salvando ? t('salvando') : t('salvar')}
          </Button>
        )}
      </header>

      {/* ── Body ── */}
      <div className="mx-auto max-w-[680px] px-5 py-4 lg:px-12 lg:py-10">

        {/* ── Topbar desktop ── */}
        <div className="mb-6 hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => navigate('/app/perfil')}
              aria-label="Voltar"
            >
              <i className="fa-solid fa-chevron-left text-sm" aria-hidden="true" />
            </Button>
            <h2 className="font-['Montserrat'] text-xl font-semibold text-lumi-black">
              {titulo}
            </h2>
          </div>
          {onSalvar && (
            <Button
              onClick={podeS ? onSalvar : undefined}
              disabled={!podeS}
            >
              {salvando ? t('salvando') : t('salvar')}
            </Button>
          )}
        </div>

        {/* ── Feedback sucesso ── */}
        {sucesso && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
            <i className="fa-solid fa-check-circle text-sm text-green-500" aria-hidden="true" />
            <p className="font-nunito text-sm font-semibold text-green-700">{t('salvo')}</p>
          </div>
        )}

        {/* ── Feedback erro ── */}
        {erro && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-[#FCEBEB] px-4 py-3">
            <i className="fa-solid fa-circle-exclamation text-sm text-[#dc3232]" aria-hidden="true" />
            <p className="font-nunito text-sm text-[#dc3232]">{erro}</p>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className }) {
  return (
    <div className={cn('mb-3 rounded-2xl border border-lumi-border bg-white p-5', className)}>
      {children}
    </div>
  )
}

// ─── SectionLabel / SectionHint ──────────────────────────────────────────────

export function SL({ children }) {
  return (
    <p className="mb-1 font-nunito text-[11px] font-semibold uppercase tracking-[.08em] text-lumi-gray">
      {children}
    </p>
  )
}

export function SH({ children }) {
  return (
    <p className="mb-3.5 font-nunito text-xs leading-relaxed text-lumi-muted">
      {children}
    </p>
  )
}

// ─── FieldInput ───────────────────────────────────────────────────────────────

export function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-nunito text-[11px] font-semibold uppercase tracking-[.06em] text-lumi-gray">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="py-3.5 text-sm"
      />
      {hint && (
        <p className="font-nunito text-[11px] leading-relaxed text-lumi-muted">{hint}</p>
      )}
    </div>
  )
}

// ─── ChipGroup ────────────────────────────────────────────────────────────────

export function ChipGroup({ options, value, onChange, multi = false, max }) {
  function toggle(opt) {
    if (!multi) { onChange(opt); return }
    if (value.includes(opt)) { onChange(value.filter(v => v !== opt)); return }
    if (max && value.length >= max) return
    onChange([...value, opt])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const sel = multi ? value.includes(opt) : value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              'rounded-full border px-4 py-2 font-nunito text-sm transition',
              sel
                ? 'border-lumi-black bg-lumi-black font-semibold text-white'
                : 'border-lumi-border bg-white text-lumi-gray hover:border-lumi-gray',
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center gap-4 border-b border-lumi-border py-4 last:border-b-0">
      <div className="flex-1">
        <p className="font-nunito text-sm font-semibold text-lumi-black">{label}</p>
        {desc && (
          <p className="mt-0.5 font-nunito text-xs text-lumi-muted">{desc}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border-none transition-colors duration-200',
          value ? 'bg-lumi-black' : 'bg-lumi-input',
        )}
      >
        <span
          className={cn(
            'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all duration-200',
            value ? 'left-[22px]' : 'left-[3px]',
          )}
        />
      </button>
    </div>
  )
}
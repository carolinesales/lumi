import Input from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const PAISES = [
  { flag: '🇧🇷', ddi: '+55' }, { flag: '🇺🇸', ddi: '+1'   },
  { flag: '🇵🇹', ddi: '+351'}, { flag: '🇦🇷', ddi: '+54'  },
  { flag: '🇨🇱', ddi: '+56' }, { flag: '🇨🇴', ddi: '+57'  },
  { flag: '🇲🇽', ddi: '+52' }, { flag: '🇬🇧', ddi: '+44'  },
  { flag: '🇪🇸', ddi: '+34' }, { flag: '🇫🇷', ddi: '+33'  },
  { flag: '🇩🇪', ddi: '+49' }, { flag: '🇮🇹', ddi: '+39'  },
  { flag: '🇯🇵', ddi: '+81' }, { flag: '🇨🇳', ddi: '+86'  },
  { flag: '🇮🇳', ddi: '+91' },
]

export function formatarCelular(v) {
  const n = String(v).replace(/\D/g, '').slice(0, 11)
  if (!n.length)     return ''
  if (n.length <= 2) return `(${n}`
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

export default function PhoneField({ label, ddi, setDdi, celular, setCelular, placeholder }) {
  const paisAtual = PAISES.find(p => p.ddi === ddi) ?? PAISES[0]

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="font-['Nunito_Sans'] text-xs font-semibold text-text-secondary">{label}</label>}
      <div className="flex gap-2">
        <div className="relative flex h-[50px] w-[110px] shrink-0 items-center gap-2 rounded-[8px] border border-paper-200 bg-surface px-3">
          <span className="text-base">{paisAtual.flag}</span>
          <span className="flex-1 font-['Nunito_Sans'] text-sm text-text">{ddi}</span>
          <i className="fa-solid fa-chevron-down text-[10px] text-text-tertiary" aria-hidden="true" />
          <select
            value={ddi}
            onChange={e => setDdi(e.target.value)}
            aria-label="Codigo do pais"
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {PAISES.map(p => (
              <option key={p.ddi} value={p.ddi}>{p.flag} {p.ddi}</option>
            ))}
          </select>
        </div>
        <Input
          type="tel"
          inputMode="numeric"
          value={celular}
          onChange={e => setCelular(formatarCelular(e.target.value))}
          placeholder={placeholder}
          className={cn('flex-1 py-3 text-sm')}
        />
      </div>
    </div>
  )
}

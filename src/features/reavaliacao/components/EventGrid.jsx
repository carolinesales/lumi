// src/features/reavaliacao/components/EventGrid.jsx
import { EVENTOS_CAPILARES } from '@/lib/reavaliacaoService'
import { toggleEvento } from '../constants/reavaliacao.constants'

export default function EventGrid({ eventos, onChange }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {EVENTOS_CAPILARES.map(evento => {
        const selected = eventos.includes(evento.id)

        return (
          <button
            key={evento.id}
            type="button"
            className={[
              'flex min-h-[116px] flex-col justify-between rounded-[22px] border p-4 text-left transition-all hover:-translate-y-0.5',
              selected
                ? 'border-ink bg-ink text-white'
                : 'border-paper-200 bg-surface text-text',
            ].join(' ')}
            onClick={() => onChange(prev => toggleEvento(prev, evento.id))}
          >
            <i className={`fa-solid ${evento.icon} text-lg`} />
            <span className="max-w-[140px] font-['Montserrat'] text-[13px] font-semibold leading-tight">{evento.label}</span>
          </button>
        )
      })}
    </div>
  )
}

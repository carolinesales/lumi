// src/features/hairEvents/components/HairEventGrid.jsx
import { HAIR_EVENTS } from '../constants/hairEvents.constants'
import { toggleHairEvent } from '../utils/hairEvents.utils'

export default function HairEventGrid({
  value = [],
  onChange,
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
      {HAIR_EVENTS.map(event => {
        const selected = value.includes(event.id)

        return (
          <button
            key={event.id}
            type="button"
            className={[
              'flex min-h-[116px] flex-col justify-between rounded-[22px] border p-4 text-left transition-all hover:-translate-y-0.5',
              selected
                ? 'border-[#181714] bg-[#181714] text-white'
                : 'border-[#EFECE6] bg-white text-[#181714]',
            ].join(' ')}
            onClick={() => onChange(prev => toggleHairEvent(prev, event.id))}
          >
            <i className={`fa-solid ${event.icon} text-lg`} />
            <span className="max-w-[140px] text-[13px] font-black leading-tight">
              {event.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

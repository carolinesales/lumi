// src/features/hairEvents/components/HairEventInsight.jsx
import { getHairEventsInsight, getHairEventsSeverity } from '../utils/hairEvents.utils'

export default function HairEventInsight({
  events = [],
}) {
  if (!events.length) return null

  const severity = getHairEventsSeverity(events)
  const insight = getHairEventsInsight(events)

  const icon =
    severity === 'critical'
      ? 'fa-triangle-exclamation'
      : severity === 'attention'
        ? 'fa-circle-exclamation'
        : severity === 'positive'
          ? 'fa-leaf'
          : 'fa-circle-info'

  return (
    <div className="mt-4 rounded-[20px] border border-[#EFECE6] bg-[#F8F6F2] p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#181714] text-white">
          <i className={`fa-solid ${icon} text-xs`} />
        </div>

        <p className="m-0 text-sm leading-6 text-[#77736C]">
          {insight}
        </p>
      </div>
    </div>
  )
}

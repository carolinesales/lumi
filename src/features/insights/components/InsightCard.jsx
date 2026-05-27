export default function InsightCard({
  insight,
}) {
  if (!insight) return null

  return (
    <div className="rounded-[24px] border border-[#EFECE6] bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,.03)]">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#181714] text-white">
          <i className={`fa-solid ${insight.icon}`} />
        </div>

        <div>
          <strong className="block text-[14px] font-black text-[#181714]">
            {insight.title}
          </strong>

          <p className="mt-2 text-sm leading-7 text-[#77736C]">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  )
}
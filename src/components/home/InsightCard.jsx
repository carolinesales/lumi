import LumiCard from '@/components/lumi/LumiCard'

export default function InsightCard({ clima, text }) {
  return (
    <LumiCard className="p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-[#F3F3F2] text-[#232323]">
          <i className="fa-solid fa-cloud-sun" />
        </div>

        <div>
          <div className="mb-1 text-[10px] font-black uppercase tracking-[.1em] text-[#2E2E2E]">
            {clima ? `${clima.cidade} · ${clima.temperatura}°C` : 'Insight Lumi'}
          </div>
          <p className="m-0 text-xs leading-6 text-[#777]">
            {text}
          </p>
        </div>
      </div>
    </LumiCard>
  )
}

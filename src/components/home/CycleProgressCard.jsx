import LumiCard from '@/components/lumi/LumiCard'
import { Progress } from '@/components/ui/progress'

export default function CycleProgressCard({ pct, concluidas, total }) {
  return (
    <LumiCard className="p-5">
      <span className="mb-3 block text-[10px] font-black uppercase tracking-[.18em] text-[#9A958E]">
        Ciclo atual
      </span>

      <div className="font-['Montserrat'] text-[36px] font-light leading-none tracking-[-0.05em] text-[#181714]">
        {pct}
        <span className="text-sm text-[#8C8C8C]">%</span>
      </div>

      <p className="mt-2 text-xs text-[#777]">
        {concluidas} de {total} rituais finalizados
      </p>

      <Progress value={pct} className="mt-4 h-1 bg-[#ECECEC]" />
    </LumiCard>
  )
}

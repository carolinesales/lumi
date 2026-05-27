// src/features/home/components/NextRitualsCard.jsx
import LumiCard from '@/components/lumi/LumiCard'
import { RITUAL_TIPO_ICON } from '@/constants/ritualTipos'

export default function NextRitualsCard({ etapas = [], onOpen }) {
  if (!etapas.length) {
    return (
      <LumiCard className="p-4">
        <span className="mb-1 block text-[9px] font-black uppercase tracking-[.18em] text-[#9A958E]">
          Próximo ritual
        </span>

        <h3 className="text-[14px] font-black text-[#181714]">
          Tudo em dia
        </h3>

        <p className="mt-1 text-[12px] leading-5 text-[#77736C]">
          Quando houver um novo cuidado, ele aparece aqui.
        </p>
      </LumiCard>
    )
  }

  const principal = etapas[0]
  const icon = RITUAL_TIPO_ICON[principal.tipoCuidado] ?? 'fa-leaf'

  return (
    <LumiCard className="p-4">
      <span className="mb-1 block text-[9px] font-black uppercase tracking-[.18em] text-[#9A958E]">
        Próximo ritual
      </span>

      <button
        type="button"
        onClick={() => onOpen(principal)}
        className="group flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-black text-[#181714]">
            {principal.tipoCuidado}
          </h3>

          <p className="mt-1 text-[12px] leading-5 text-[#77736C]">
            Continue a rotina no próximo cuidado.
          </p>
        </div>

        <div className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#F8F6F2] text-[#5F5B55] transition-colors group-hover:bg-[#181714] group-hover:text-white">
          <i className={`fa-solid ${icon}`} />
        </div>
      </button>
    </LumiCard>
  )
}
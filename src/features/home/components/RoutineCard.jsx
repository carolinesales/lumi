import { Button } from '@/components/ui/button'

export default function RoutineCard({ etapaAtual, concluidas, total, tipoDesc, onOpen, onNovoDiagnostico }) {
  const hasEtapa = !!etapaAtual

  return (
    <button
      type="button"
      onClick={() => (hasEtapa ? onOpen(etapaAtual) : onNovoDiagnostico())}
      className="group w-full rounded-[26px] border border-white/90 bg-white/90 p-6 text-left shadow-[var(--lumi-shadow-soft)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#9A958E]">
          Foco de hoje
        </span>

        <span className="rounded-full border border-[#ECE8E1] bg-[#F5F3EF] px-3 py-1.5 text-[11px] font-extrabold text-[#5F5B55]">
          {Math.max(1, concluidas + 1)}/{Math.max(1, total)}
        </span>
      </div>

      <h3 className="mb-3 font-['Montserrat'] text-[34px] font-normal leading-none tracking-[-0.07em] text-[#181714]">
        {etapaAtual?.tipoCuidado ?? 'Novo diagnóstico'}
      </h3>

      <p className="mb-5 max-w-xl text-sm leading-7 text-[#77736C]">
        {hasEtapa ? tipoDesc?.[etapaAtual.tipoCuidado] ?? '' : 'Atualize seu perfil para gerar uma rotina mais precisa para o momento atual dos fios.'}
      </p>

      <div className="mb-5 flex flex-wrap gap-4 text-xs font-semibold text-[#817B73]">
        <span className="inline-flex items-center gap-2">
          <i className="fa-regular fa-clock" />
          20 min
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="fa-solid fa-arrow-trend-up" />
          +8 Hair Score
        </span>
      </div>

      <Button
        type="button"
        className="h-12 w-full rounded-full bg-[#181714] px-5 font-black text-white hover:bg-[#181714]/90 sm:w-[220px]"
      >
        {hasEtapa ? 'Iniciar ritual' : 'Novo diagnóstico'}
        <i className="fa-solid fa-arrow-right ml-auto text-xs sm:ml-3" />
      </Button>
    </button>
  )
}

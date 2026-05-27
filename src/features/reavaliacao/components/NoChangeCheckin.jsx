// src/features/reavaliacao/components/NoChangeCheckin.jsx
import { SEM_MUDANCA_OPCOES } from '../constants/reavaliacao.constants'

export default function NoChangeCheckin({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-[#EFECE6] bg-[#F8F6F2] p-6 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-[#181714] text-white">
          <i className="fa-solid fa-leaf" />
        </div>
        <strong className="block text-[15px] font-black text-[#181714]">Seu plano continua como base</strong>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#77736C]">
          Como nada importante mudou, vamos apenas registrar como seus fios estão hoje.
        </p>
      </div>

      <div className="grid gap-2.5 md:grid-cols-2">
        {SEM_MUDANCA_OPCOES.map(opcao => (
          <button
            key={opcao.id}
            type="button"
            className={[
              'min-h-[104px] rounded-[20px] border p-4 text-left transition-all hover:-translate-y-0.5',
              value === opcao.id
                ? 'border-[#181714] bg-[#181714] text-white'
                : 'border-[#EFECE6] bg-white text-[#181714]',
            ].join(' ')}
            onClick={() => onChange(opcao.id)}
          >
            <strong className="block text-[13px] font-black leading-tight">{opcao.label}</strong>
            <span className={['mt-2 block text-[11px] leading-snug', value === opcao.id ? 'text-white/60' : 'text-[#817B73]'].join(' ')}>
              {opcao.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

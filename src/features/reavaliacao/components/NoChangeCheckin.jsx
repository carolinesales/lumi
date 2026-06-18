// src/features/reavaliacao/components/NoChangeCheckin.jsx
import { SEM_MUDANCA_OPCOES } from '../constants/reavaliacao.constants'

export default function NoChangeCheckin({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-paper-200 bg-surface-subtle p-6 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-ink text-white">
          <i className="fa-solid fa-leaf" />
        </div>
        <strong className="block font-['Montserrat'] text-[15px] font-semibold text-text">Seu plano continua como base</strong>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
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
                ? 'border-ink bg-ink text-white'
                : 'border-paper-200 bg-surface text-text',
            ].join(' ')}
            onClick={() => onChange(opcao.id)}
          >
            <strong className="block font-['Montserrat'] text-[13px] font-semibold leading-tight">{opcao.label}</strong>
            <span className={['mt-2 block text-[11px] leading-snug', value === opcao.id ? 'text-white/60' : 'text-text-secondary'].join(' ')}>
              {opcao.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

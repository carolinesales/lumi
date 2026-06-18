// src/features/reavaliacao/components/QuestionList.jsx

export default function QuestionList({ perguntas, respostas, onChange }) {
  if (perguntas.length === 0) {
    return (
      <div className="rounded-[22px] border border-paper-200 bg-surface-subtle p-8 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-ink text-white">
          <i className="fa-solid fa-check" />
        </div>
        <strong className="block font-['Montserrat'] text-[15px] font-semibold text-text">Nenhuma pergunta extra necessária</strong>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">
          Vamos usar seu diagnóstico atual como base e seguir para a atualização do estado dos fios.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {perguntas.map(pergunta => (
        <div key={pergunta.id} className="rounded-[20px] border border-paper-200 bg-surface-subtle p-4">
          <p className="mb-3 font-['Montserrat'] text-[13px] font-semibold text-text">{pergunta.label}</p>

          <div className="flex flex-wrap gap-2">
            {pergunta.opcoes.map(opcao => (
              <button
                type="button"
                key={opcao}
                className={[
                  'min-h-10 rounded-full border px-4 text-[13px] font-extrabold',
                  respostas[pergunta.id] === opcao
                    ? 'border-ink bg-ink text-white'
                    : 'border-paper-200 bg-surface text-text-secondary',
                ].join(' ')}
                onClick={() => onChange(prev => ({ ...prev, [pergunta.id]: opcao }))}
              >
                {opcao}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

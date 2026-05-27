// src/features/reavaliacao/components/QuestionList.jsx

export default function QuestionList({ perguntas, respostas, onChange }) {
  if (perguntas.length === 0) {
    return (
      <div className="rounded-[22px] border border-[#EFECE6] bg-[#F8F6F2] p-8 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-full bg-[#181714] text-white">
          <i className="fa-solid fa-check" />
        </div>
        <strong className="block text-[15px] font-black text-[#181714]">Nenhuma pergunta extra necessária</strong>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#77736C]">
          Vamos usar seu diagnóstico atual como base e seguir para a atualização do estado dos fios.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {perguntas.map(pergunta => (
        <div key={pergunta.id} className="rounded-[20px] border border-[#EFECE6] bg-[#F8F6F2] p-4">
          <p className="mb-3 text-[13px] font-black text-[#181714]">{pergunta.label}</p>

          <div className="flex flex-wrap gap-2">
            {pergunta.opcoes.map(opcao => (
              <button
                type="button"
                key={opcao}
                className={[
                  'min-h-10 rounded-full border px-4 text-[13px] font-extrabold',
                  respostas[pergunta.id] === opcao
                    ? 'border-[#181714] bg-[#181714] text-white'
                    : 'border-[#EFECE6] bg-white text-[#6F6A63]',
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

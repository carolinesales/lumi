// src/features/reavaliacao/components/ReavaliacaoBody.jsx
import EventGrid from './EventGrid'
import NoChangeCheckin from './NoChangeCheckin'
import QuestionList from './QuestionList'

export default function ReavaliacaoBody({
  step,
  semMudancas,
  eventos,
  setEventos,
  estadoSemMudanca,
  setEstadoSemMudanca,
  perguntas,
  respostas,
  setRespostas,
}) {
  if (step === 1) {
    return (
      <>
        <span className="mb-3 block text-[10px] font-black uppercase tracking-[.18em] text-[#9A958E]">
          O que mudou?
        </span>

        <h2 className="mb-2 font-['Montserrat'] text-[22px] font-medium tracking-[-0.05em] text-[#181714]">
          O que mudou nos seus fios?
        </h2>

        <p className="mb-5 max-w-xl text-sm leading-7 text-[#77736C]">
          Marque apenas o que aconteceu desde a última leitura. Se nada mudou, faremos só um check-in rápido.
        </p>

        <EventGrid eventos={eventos} onChange={setEventos} />
      </>
    )
  }

  return (
    <>
      <span className="mb-3 block text-[10px] font-black uppercase tracking-[.18em] text-[#9A958E]">
        {semMudancas ? 'Check-in rápido' : step === 2 ? 'Detalhes da mudança' : 'Estado atual'}
      </span>

      <h2 className="mb-2 font-['Montserrat'] text-[22px] font-medium tracking-[-0.05em] text-[#181714]">
        {semMudancas ? 'Como seus fios estão hoje?' : step === 2 ? 'Vamos entender o contexto' : 'Como seus fios estão hoje?'}
      </h2>

      <p className="mb-5 max-w-xl text-sm leading-7 text-[#77736C]">
        {semMudancas
          ? 'Como nada importante mudou, o Lumi só registra o momento atual e preserva sua rotina como base.'
          : step === 2
            ? 'Perguntas rápidas aparecem apenas quando ajudam a entender melhor o impacto nos fios.'
            : 'Essa leitura ajuda o Lumi a ajustar o Hair Score e a rotina com mais coerência.'}
      </p>

      {semMudancas ? (
        <NoChangeCheckin value={estadoSemMudanca} onChange={setEstadoSemMudanca} />
      ) : (
        <QuestionList perguntas={perguntas} respostas={respostas} onChange={setRespostas} />
      )}
    </>
  )
}

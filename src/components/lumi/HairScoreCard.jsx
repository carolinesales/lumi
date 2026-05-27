import LumiCard from './LumiCard'

function getPaleta(score) {
  if (!score || score === 0) {
    return { from: '#E3DED6', to: '#CFC7BD', label: 'Aguardando diagnóstico' }
  }

  if (score >= 80) {
    return { from: '#E1D6C1', to: '#C6B28A', label: 'Radiante' }
  }

  if (score >= 60) {
    return { from: '#DDE3D6', to: '#C2CDB9', label: 'Em evolução' }
  }

  if (score >= 40) {
    return { from: '#E0DCE5', to: '#CBC3D3', label: 'Em construção' }
  }

  return { from: '#DDE2EA', to: '#C5CEDC', label: 'Precisa de cuidado' }
}

export default function HairScoreCard({
  score = 0,
  delta = 0,
  label,
  message,
  focus,
  progress,
  streak,
  className = '',
}) {
  const paleta = getPaleta(score)

  return (
    <LumiCard
      className={[
        'relative overflow-hidden p-6 transition-all duration-500',
        className,
      ].join(' ')}
      style={{
        background: `linear-gradient(145deg, ${paleta.from}, ${paleta.to})`,
      }}
    >
      <div className="relative z-10">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[.18em] text-[rgba(24,23,20,.48)]">
          Hair Score
        </span>

        <div className="flex items-end gap-1 font-['Montserrat'] text-[72px] font-light leading-none tracking-[-0.08em] text-[#181714]">
          {score}
          <span className="pb-1 text-xl tracking-[-0.04em] text-[rgba(24,23,20,.48)]">/100</span>
        </div>

        <div className="mt-3 font-['Montserrat'] text-base font-medium tracking-[-0.03em] text-[rgba(24,23,20,.6)]">
          {label || paleta.label}
        </div>

        {delta !== 0 && (
          <div className={[
            'mt-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/70 bg-white/40 px-3 text-xs font-black',
            delta > 0 ? 'text-[#2E6A45]' : 'text-[#8C3D3D]',
          ].join(' ')}>
            <i className={`fa-solid ${delta > 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`} />
            {delta > 0 ? `+${delta}` : delta} hoje
          </div>
        )}

        {message && (
          <p className="mt-3 max-w-xl text-sm leading-7 text-[rgba(24,23,20,.5)]">
            {message}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {focus && <Pill>Foco: {focus}</Pill>}
          {typeof progress === 'number' && <Pill>{progress}% do ciclo</Pill>}
          {streak > 0 && <Pill>{streak} dias</Pill>}
        </div>
      </div>
    </LumiCard>
  )
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-[#ECE8E1] bg-white px-3 py-1.5 text-[11px] font-bold text-[rgba(24,23,20,.58)]">
      {children}
    </span>
  )
}

// src/features/home/components/TodayHeader.jsx
import { useMemo } from 'react'

function formatHoje() {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
  })
    .format(new Date())
    .replace('.', '')
    .replace(/^\w/, letra => letra.toUpperCase())
}

export default function TodayHeader({
  nome,
  foto,
  onProfile,
}) {
  const primeiroNome = nome?.split(' ')?.[0] || 'Caroline'
  const iniciais = nome
    ?.split(' ')
    ?.filter(Boolean)
    ?.slice(0, 2)
    ?.map(parte => parte[0])
    ?.join('')
    ?.toUpperCase() || 'L'

  // Recalcula a data uma vez por mount. Se o app ficar aberto a noite toda,
  // um reload natural do usuário vai atualizar — sem necessidade de timer.
  const dataFormatada = useMemo(() => formatHoje(), [])

  return (
    <header className="mb-4 flex items-center justify-between gap-4 xl:mb-5">
      <div>
        <p className="text-[12px] font-medium text-[#77736C]">
          Olá, {primeiroNome}
        </p>

        <h1 className="mt-1 font-['Montserrat'] text-[20px] font-medium leading-none tracking-[-0.055em] text-[#181714] xl:text-[26px]">
          {dataFormatada}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-[#EFECE6] bg-white/80 text-[#77736C] transition-all hover:-translate-y-0.5 hover:bg-white"
          aria-label="Notificações"
        >
          <i className="fa-regular fa-bell text-sm" />
        </button>

        <button
          type="button"
          onClick={onProfile}
          className="grid size-10 place-items-center overflow-hidden rounded-full bg-[#F0ECE5] text-[12px] font-black text-[#181714] transition-all hover:-translate-y-0.5"
          aria-label="Abrir perfil"
        >
          {foto ? (
            <img
              src={foto}
              alt={nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{iniciais}</span>
          )}
        </button>
      </div>
    </header>
  )
}
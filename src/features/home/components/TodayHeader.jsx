// src/features/home/components/TodayHeader.jsx
import { useMemo } from 'react'
import { useIdioma } from '@/contexts/IdiomaContext'

function formatHoje(locale) {
  return new Intl.DateTimeFormat(locale, {
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
  const { t, idioma } = useIdioma()
  const locale = idioma === 'en' ? 'en-US' : 'pt-BR'

  const primeiroNome = nome?.split(' ')?.[0] || 'Caroline'
  const iniciais = nome
    ?.split(' ')
    ?.filter(Boolean)
    ?.slice(0, 2)
    ?.map(parte => parte[0])
    ?.join('')
    ?.toUpperCase() || 'L'

  const dataFormatada = useMemo(() => formatHoje(locale), [locale])

  return (
    <header className="mb-4 flex items-center justify-between gap-4 xl:mb-5">
      <div>
        <p className="text-[12px] font-medium text-text-secondary">
          {t('home_ola')}, {primeiroNome}
        </p>

        <h1 className="mt-1 font-['Montserrat'] text-[20px] font-medium leading-none tracking-[-0.055em] text-text xl:text-[26px]">
          {dataFormatada}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-paper-200 bg-surface/80 text-text-secondary transition-all hover:-translate-y-0.5 hover:bg-surface"
          aria-label={t('home_notificacoes')}
        >
          <i className="fa-regular fa-bell text-sm" />
        </button>

        <button
          type="button"
          onClick={onProfile}
          className="grid size-10 place-items-center overflow-hidden rounded-full bg-surface-muted text-[12px] font-black text-text transition-all hover:-translate-y-0.5"
          aria-label={t('home_abrir_perfil')}
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

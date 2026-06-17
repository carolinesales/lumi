import { useNavigate } from 'react-router-dom'
import { cn }           from '@/lib/utils'

const DESTAQUES = [
  { icon: 'fa-magnifying-glass', text: 'Diagnóstico capilar personalizado' },
  { icon: 'fa-calendar-days',    text: 'Cronograma de cuidados semanal'    },
  { icon: 'fa-chart-line',       text: 'Acompanhamento do Hair Score'      },
]

export default function BoasVindas({ nome = '', onComecar, onPular }) {
  const navigate = useNavigate()
  const iniciar  = onComecar ?? (() => navigate('/questionario'))
  const pular    = onPular   ?? (() => navigate('/app/home'))

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="flex w-full max-w-[400px] flex-col items-center gap-8 text-center">

        {/* Check de sucesso */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-black"
          style={{ animation: 'lumi-pop-in .4s cubic-bezier(.22,1,.36,1) both' }}
        >
          <i className="fa-solid fa-check text-[32px] text-white" aria-hidden="true" />
        </div>

        {/* Saudação */}
        <div className="flex flex-col gap-2">
          <h2 className="font-['Montserrat'] text-2xl font-medium tracking-tight text-lumi-black">
            Olá, {nome}! 👋
          </h2>
          <p className="font-nunito text-base leading-relaxed text-lumi-gray">
            Seu e-mail foi confirmado. Agora vamos conhecer seus fios e montar sua rotina personalizada.
          </p>
        </div>

        {/* Destaques do app */}
        <div className="w-full rounded-2xl border border-[#E8E8E8] bg-white p-5 text-left">
          {DESTAQUES.map((item, i, arr) => (
            <div key={item.icon} className={cn(
              'flex items-center gap-3 py-2.5 first:pt-0 last:pb-0',
              i < arr.length - 1 && 'border-b border-[#F0F0F0]',
            )}>
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-lumi-bg">
                <i className={cn('fa-solid text-sm text-lumi-black', item.icon)} aria-hidden="true" />
              </div>
              <span className="font-nunito text-sm text-lumi-black">{item.text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={iniciar}
            className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-black px-6 py-3.5 font-nunito text-sm text-white transition hover:opacity-90"
          >
            Começar diagnóstico
            <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={pular}
            className="flex w-full items-center justify-center rounded-[24px] border border-[#E0E0E0] bg-white px-6 py-3.5 font-nunito text-sm text-lumi-black transition hover:bg-lumi-bg"
          >
            Fazer depois
          </button>
        </div>
      </div>
    </div>
  )
}
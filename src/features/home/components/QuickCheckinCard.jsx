// src/features/home/components/QuickCheckinCard.jsx
import { Button } from '@/components/ui/button'
import ilustracaoDiario from '@/assets/Diario.png'

export default function QuickCheckinCard({ regHoje, onOpen }) {
  const done = !!regHoje

  return (
    <div className="flex items-center gap-2 overflow-hidden rounded-[24px] bg-surface p-6">

      {/* Ilustração */}
      <img
        src={ilustracaoDiario}
        alt=""
        aria-hidden="true"
        className="size-[132px] shrink-0 object-contain"
      />

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="font-['Montserrat'] text-base font-semibold leading-5 text-text">
            Diário Lumi
          </h3>
          <p className="font-nunito text-sm leading-5 text-text-secondary">
            {done
              ? 'Seu dia já foi registrado. O Lumi vai usar essas informações para acompanhar padrões e evolução dos seus fios.'
              : 'Um resumo dos cuidados, hábitos e sensações do seu dia.'}
          </p>
        </div>

        <Button
          onClick={onOpen}
          size="default"
          className="w-full"
          aria-label={done ? 'Abrir registro do dia' : 'Registrar meu dia'}
        >
          {done ? 'Abrir registro' : 'Registrar'}
        </Button>
      </div>
    </div>
  )
}
// src/features/home/components/QuickCheckinCard.jsx
import { Button } from '@/components/ui/button'
import { cn }     from '@/lib/utils'

export default function QuickCheckinCard({ regHoje, onOpen }) {
  const done = !!regHoje

  return (
    <div className="flex flex-col gap-5 rounded-[24px] border border-lumi-border bg-white p-6">

      {/* Título */}
      <div className="flex flex-col gap-2">
        <h3 className="font-['Montserrat'] text-base font-semibold text-lumi-black">
          Diário Lumi
        </h3>
        <p className="font-nunito text-sm leading-6 text-lumi-secondary">
          {done
            ? 'Seu dia já foi registrado. O Lumi vai usar essas informações para acompanhar padrões e evolução dos seus fios.'
            : 'Um resumo dos cuidados, hábitos e sensações do seu dia.'}
        </p>
      </div>

      {/* CTA */}
      <Button
        onClick={onOpen}
        size="lg"
        className="w-full justify-between"
        aria-label={done ? 'Abrir registro do dia' : 'Registrar meu dia'}
      >
        <span>{done ? 'Abrir registro' : 'Registrar'}</span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7H12" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M7.5 2.5L12 7L7.5 11.5" stroke="#1A1A1A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </Button>
    </div>
  )
}
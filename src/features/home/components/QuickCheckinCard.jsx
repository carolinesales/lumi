// src/features/home/components/QuickCheckinCard.jsx
import { Button } from '@/components/ui/button'
import ilustracaoDiario from '@/assets/Diario.png'
import { useIdioma } from '@/contexts/IdiomaContext'

export default function QuickCheckinCard({ regHoje, onOpen }) {
  const { t } = useIdioma()
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
            {t('qc_titulo')}
          </h3>
          <p className="font-nunito text-sm leading-5 text-text-secondary">
            {done
              ? t('qc_desc_feito')
              : t('qc_desc_pendente')}
          </p>
        </div>

        <Button
          onClick={onOpen}
          size="default"
          className="w-full"
          aria-label={done ? t('qc_aria_abrir') : t('qc_aria_registrar')}
        >
          {done ? t('qc_btn_abrir') : t('qc_btn_registrar')}
        </Button>
      </div>
    </div>
  )
}
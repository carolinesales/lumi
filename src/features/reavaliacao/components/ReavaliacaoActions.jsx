// src/features/reavaliacao/components/ReavaliacaoActions.jsx
import { Button } from '@/components/ui/button'

export default function ReavaliacaoActions({
  step,
  totalSteps,
  stepValido,
  salvando,
  semMudancas,
  onBack,
  onNext,
  onFinish,
}) {
  const isLast = step >= totalSteps

  return (
    <div className="mt-6 flex justify-end gap-2.5">
      {step > 1 && (
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
      )}

      {!isLast ? (
        <Button onClick={onNext} disabled={!stepValido}>
          Continuar
        </Button>
      ) : (
        <Button onClick={onFinish} disabled={salvando || !stepValido}>
          {salvando
            ? 'Atualizando...'
            : semMudancas
            ? 'Salvar check-in'
            : 'Atualizar diagnóstico'}
        </Button>
      )}
    </div>
  )
}
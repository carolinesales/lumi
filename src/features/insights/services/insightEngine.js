import { INSIGHT_TEMPLATES } from '../constants/insightTemplates.constants'

export function generateInsights({
  hairState,
  hairScore,
  delta,
  eventos = [],
  timeline = [],
}) {
  const insights = []

  const add = key => {
    const item = INSIGHT_TEMPLATES[key]
    if (item && !insights.find(i => i.id === item.id)) {
      insights.push(item)
    }
  }

  if (hairState?.id === 'fragilizado') {
    add('fragilidade_ativa')
  }

  if (eventos.includes('calor')) {
    add('calor_excessivo')
  }

  if (eventos.includes('queda')) {
    add('queda_recente')
  }

  if (eventos.includes('piscina_mar')) {
    add('praia_piscina')
  }

  if (delta <= -4) {
    add('score_caindo')
  }

  if (delta >= 3) {
    add('score_subindo')
  }

  if (
    hairState?.id === 'recuperacao' &&
    delta > 0
  ) {
    add('recuperacao_estavel')
  }

  return insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
}
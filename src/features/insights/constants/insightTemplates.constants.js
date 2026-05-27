export const INSIGHT_TEMPLATES = {
  calor_excessivo: {
    id: 'calor_excessivo',
    priority: 8,
    tone: 'attention',
    icon: 'fa-temperature-high',
    title: 'Os fios podem estar mais sensíveis ao calor',
    description:
      'O uso frequente de calor pode aumentar ressecamento, frizz e perda de brilho. Vamos focar em proteção térmica e hidratação gradual.',
  },

  recuperacao_estavel: {
    id: 'recuperacao_estavel',
    priority: 6,
    tone: 'positive',
    icon: 'fa-arrow-trend-up',
    title: 'Sua recuperação está evoluindo bem',
    description:
      'Os últimos registros mostram sinais consistentes de recuperação e estabilidade dos fios.',
  },

  fragilidade_ativa: {
    id: 'fragilidade_ativa',
    priority: 10,
    tone: 'critical',
    icon: 'fa-triangle-exclamation',
    title: 'Os fios precisam de recuperação gradual',
    description:
      'O Lumi identificou sinais de fragilidade recente. Vamos reduzir agressões e focar em recuperação progressiva.',
  },

  queda_recente: {
    id: 'queda_recente',
    priority: 9,
    tone: 'attention',
    icon: 'fa-arrow-trend-down',
    title: 'Vale acompanhar a queda com atenção',
    description:
      'Mudanças recentes podem influenciar a queda dos fios. Pequenos registros ajudam o Lumi a entender melhor o comportamento do cabelo.',
  },

  praia_piscina: {
    id: 'praia_piscina',
    priority: 5,
    tone: 'attention',
    icon: 'fa-water',
    title: 'Cloro, sal e sol podem ressecar os fios',
    description:
      'Depois de piscina ou mar, priorize hidratação e limpeza equilibrada para evitar rigidez e perda de brilho.',
  },

  score_caindo: {
    id: 'score_caindo',
    priority: 8,
    tone: 'attention',
    icon: 'fa-chart-line',
    title: 'Seu Hair Score apresentou oscilação recente',
    description:
      'Eventos recentes podem ter impactado a estabilidade dos fios. Vamos reforçar cuidados suaves nos próximos dias.',
  },

  score_subindo: {
    id: 'score_subindo',
    priority: 6,
    tone: 'positive',
    icon: 'fa-sparkles',
    title: 'Os fios estão respondendo aos cuidados',
    description:
      'A consistência da rotina começou a refletir na evolução do Hair Score.',
  },
}
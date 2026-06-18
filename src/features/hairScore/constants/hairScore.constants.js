// src/features/hairScore/constants/hairScore.constants.js

export const HAIR_SCORE_STATES = {
  neutral: {
    id: 'neutral',
    label: 'Aguardando diagnóstico',
    from: 'var(--score-neutral-from)',
    to: 'var(--score-neutral-to)',
    message: 'Seu diagnóstico está sendo calculado.',
  },
  radiante: {
    id: 'radiante',
    label: 'Radiante',
    from: 'var(--score-radiante-from)',
    to: 'var(--score-radiante-to)',
    message: 'Seus fios estão radiantes e cheios de vida.',
  },
  evolucao: {
    id: 'evolucao',
    label: 'Em evolução',
    from: 'var(--score-evolucao-from)',
    to: 'var(--score-evolucao-to)',
    message: 'Sua rotina está começando a transformar seus fios.',
  },
  construcao: {
    id: 'construcao',
    label: 'Em construção',
    from: 'var(--score-construcao-from)',
    to: 'var(--score-construcao-to)',
    message: 'Cada ritual conta — seus fios estão respondendo.',
  },
  cuidado: {
    id: 'cuidado',
    label: 'Precisa de cuidado',
    from: 'var(--score-cuidado-from)',
    to: 'var(--score-cuidado-to)',
    message: 'Sua jornada de cuidado começa agora.',
  },
  fragil: {
    id: 'fragil',
    label: 'Fragilizado',
    from: 'var(--score-fragil-from)',
    to: 'var(--score-fragil-to)',
    message: 'Seus fios precisam de recuperação gradual e cuidado constante.',
  },
}

export const HAIR_SCORE_THRESHOLDS = {
  radiante: 85,
  evolucao: 70,
  construcao: 55,
  cuidado: 40,
}

export const HAIR_SCORE_DELTA_LABELS = {
  positive: 'evoluiu hoje',
  negative: 'oscilou hoje',
  neutral: 'estável hoje',
}

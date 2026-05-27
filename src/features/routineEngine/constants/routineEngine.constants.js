// src/features/routineEngine/constants/routineEngine.constants.js

export const ROUTINE_FOCUS = {
  recuperacao: {
    id: 'recuperacao',
    label: 'Recuperação gradual',
    description: 'Foco em reconstrução suave, hidratação e redução de agressões.',
    icon: 'fa-shield-heart',
  },
  posQuimica: {
    id: 'posQuimica',
    label: 'Pós-química',
    description: 'Rotina para estabilizar a fibra depois de química ou descoloração.',
    icon: 'fa-flask',
  },
  hidratacao: {
    id: 'hidratacao',
    label: 'Reposição de água',
    description: 'Foco em maciez, maleabilidade e redução de aspereza.',
    icon: 'fa-droplet',
  },
  nutricao: {
    id: 'nutricao',
    label: 'Controle de frizz',
    description: 'Reposição lipídica para reduzir frizz e perda de água.',
    icon: 'fa-leaf',
  },
  couro: {
    id: 'couro',
    label: 'Equilíbrio do couro',
    description: 'Atenção à oleosidade, caspa, sensibilidade ou queda.',
    icon: 'fa-circle-exclamation',
  },
  manutencao: {
    id: 'manutencao',
    label: 'Manutenção',
    description: 'Rotina leve para preservar brilho e equilíbrio.',
    icon: 'fa-sparkles',
  },
}

export const ROUTINE_ACTIONS = {
  hidratacaoLeve: {
    id: 'hidratacaoLeve',
    tipo: 'Hidratação',
    title: 'Hidratação leve',
    description: 'Reposição de água sem pesar os fios.',
    duration: 20,
    score: 2,
  },
  hidratacaoIntensa: {
    id: 'hidratacaoIntensa',
    tipo: 'Hidratação',
    title: 'Hidratação reparadora',
    description: 'Foco em maciez, elasticidade e toque mais saudável.',
    duration: 25,
    score: 2,
  },
  nutricao: {
    id: 'nutricao',
    tipo: 'Nutrição',
    title: 'Nutrição equilibrante',
    description: 'Ajuda a reduzir frizz, aspereza e perda de água.',
    duration: 25,
    score: 2,
  },
  reconstrucaoGradual: {
    id: 'reconstrucaoGradual',
    tipo: 'Reconstrução',
    title: 'Reconstrução gradual',
    description: 'Fortalece os fios sem sobrecarregar a fibra sensibilizada.',
    duration: 20,
    score: 2,
  },
  pausaTecnica: {
    id: 'pausaTecnica',
    tipo: 'Pausa Técnica',
    title: 'Pausa de agressões',
    description: 'Evite química, calor excessivo e tração enquanto os fios recuperam estabilidade.',
    duration: 5,
    score: 0,
  },
  protecaoTermica: {
    id: 'protecaoTermica',
    tipo: 'Proteção',
    title: 'Proteção térmica',
    description: 'Proteja os fios antes de usar secador, chapinha ou modelador.',
    duration: 5,
    score: 1,
  },
  detoxCouro: {
    id: 'detoxCouro',
    tipo: 'Detox',
    title: 'Equilíbrio do couro cabeludo',
    description: 'Limpeza equilibrada para reduzir resíduos sem sensibilizar.',
    duration: 15,
    score: 1,
  },
  manutencao: {
    id: 'manutencao',
    tipo: 'Manutenção',
    title: 'Ritual de manutenção',
    description: 'Cuidado leve para manter brilho, toque e rotina em dia.',
    duration: 15,
    score: 1,
  },
}
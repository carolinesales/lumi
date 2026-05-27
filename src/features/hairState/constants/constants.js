export const HAIR_STATES = {
  equilibrado: {
    id: 'equilibrado',
    label: 'Equilibrado',
    description: 'Os fios estão estáveis e respondendo bem à rotina.',
    tone: 'positive',
    color: {
      bg: '#EEF6F0',
      text: '#2E6A45',
      border: '#D6EBDD',
    },
  },

  recuperacao: {
    id: 'recuperacao',
    label: 'Em recuperação',
    description: 'Os fios estão reagindo aos cuidados, mas ainda precisam de consistência.',
    tone: 'warning',
    color: {
      bg: '#F7F3EB',
      text: '#8A6B3F',
      border: '#E9DFC9',
    },
  },

  sensibilizado: {
    id: 'sensibilizado',
    label: 'Sensibilizado',
    description: 'Os fios passaram por eventos recentes que podem afetar a estrutura.',
    tone: 'attention',
    color: {
      bg: '#F6F1EC',
      text: '#7A5A3A',
      border: '#E6D7C6',
    },
  },

  fragilizado: {
    id: 'fragilizado',
    label: 'Fragilizado',
    description: 'Os fios precisam de recuperação gradual e redução de agressões.',
    tone: 'critical',
    color: {
      bg: '#F7ECEB',
      text: '#8C3D3D',
      border: '#EACFCD',
    },
  },

  sobrecarregado: {
    id: 'sobrecarregado',
    label: 'Sobrecarregado',
    description: 'A fibra demonstra sinais de excesso de química, calor ou desgaste.',
    tone: 'critical',
    color: {
      bg: '#F5ECEA',
      text: '#7B3636',
      border: '#E6CCCC',
    },
  },
}
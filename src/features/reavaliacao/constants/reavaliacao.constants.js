// src/features/reavaliacao/constants/reavaliacao.constants.js

export const PERGUNTAS_ESTADO = [
  { id: 'ressecamento', label: 'Como está o ressecamento?', opcoes: ['Baixo', 'Moderado', 'Alto'] },
  { id: 'frizz', label: 'Como está o frizz?', opcoes: ['Baixo', 'Moderado', 'Alto'] },
  { id: 'quebra', label: 'Teve quebra nos fios?', opcoes: ['Baixa', 'Moderada', 'Alta'] },
  { id: 'brilho', label: 'Como está o brilho?', opcoes: ['Alto', 'Médio', 'Baixo'] },
  { id: 'elasticidade', label: 'O fio molhado volta ao normal ao esticar?', opcoes: ['Sim, totalmente', 'Parcialmente', 'Não volta'] },
]

export const PERGUNTAS_EVENTO = {
  corte: [
    { id: 'comprimento', label: 'Qual o comprimento agora?', opcoes: ['Curto', 'Médio', 'Longo', 'Muito longo'] },
  ],
  corte_pontas: [
    { id: 'comprimento', label: 'Qual o comprimento agora?', opcoes: ['Curto', 'Médio', 'Longo', 'Muito longo'] },
  ],
  corte_quimico: [
    { id: 'quebra', label: 'Como está a quebra?', opcoes: ['Moderada', 'Alta'] },
    { id: 'elasticidade', label: 'O fio molhado volta ao normal ao esticar?', opcoes: ['Parcialmente', 'Não volta'] },
  ],
  quimica: [
    { id: 'quimica', label: 'Qual procedimento você fez?', opcoes: ['Progressiva', 'Coloração', 'Descoloração'] },
  ],
  coloracao: [
    { id: 'quimica', label: 'Qual foi a mudança?', opcoes: ['Coloração', 'Descoloração'] },
  ],
  descoloracao: [
    { id: 'quimica', label: 'Você descoloriu os fios?', opcoes: ['Descoloração'] },
    { id: 'elasticidade', label: 'Como ficou a elasticidade?', opcoes: ['Sim, totalmente', 'Parcialmente', 'Não volta'] },
  ],
  queda: [
    { id: 'queda', label: 'Como está a queda?', opcoes: ['Baixa', 'Moderada', 'Alta'] },
  ],
  couro: [
    { id: 'oleosidade', label: 'Como está a oleosidade?', opcoes: ['Baixa', 'Normal', 'Alta'] },
    { id: 'caspa', label: 'Teve caspa?', opcoes: ['Não', 'Leve', 'Frequente'] },
  ],
}

export const SEM_MUDANCA_OPCOES = [
  { id: 'melhor', label: 'Mais saudáveis', desc: 'Percebo brilho, maciez ou menos frizz.' },
  { id: 'estavel', label: 'Sem grandes mudanças', desc: 'Meus fios estão parecidos com antes.' },
  { id: 'ressecados', label: 'Um pouco ressecados', desc: 'Senti aspereza, frizz ou falta de brilho.' },
  { id: 'frageis', label: 'Mais frágeis', desc: 'Notei quebra, queda ou sensibilidade.' },
]

export function getStepInfo({ semMudancas }) {
  if (semMudancas) {
    return [
      { n: 1, title: 'Mudanças recentes', desc: 'Você confirmou que nada importante mudou.' },
      { n: 2, title: 'Check-in rápido', desc: 'O Lumi registra como seus fios estão hoje.' },
    ]
  }

  return [
    { n: 1, title: 'Mudanças recentes', desc: 'O que aconteceu desde a última análise?' },
    { n: 2, title: 'Nova leitura', desc: 'O Lumi interpreta o estado atual dos seus fios.' },
    { n: 3, title: 'Rotina atualizada', desc: 'Seu plano evolui junto com o seu cabelo.' },
  ]
}

export function toggleEvento(lista, id) {
  if (id === 'nada') return ['nada']
  const semNada = lista.filter(item => item !== 'nada')
  return semNada.includes(id) ? semNada.filter(item => item !== id) : [...semNada, id]
}

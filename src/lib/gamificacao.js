export const NIVEIS = [
  { nivel: 1, nome: 'Em descoberta',      xpMin: 0,    xpMax: 100,  icon: 'fa-seedling'  },
  { nivel: 2, nome: 'Construindo rotina', xpMin: 100,  xpMax: 300,  icon: 'fa-leaf'      },
  { nivel: 3, nome: 'Em rotina',          xpMin: 300,  xpMax: 600,  icon: 'fa-star'      },
  { nivel: 4, nome: 'Fios equilibrados',  xpMin: 600,  xpMax: 1000, icon: 'fa-sun'       },
  { nivel: 5, nome: 'Essência Lumi',      xpMin: 1000, xpMax: 9999, icon: 'fa-crown'     },
]

export function getNivel(xp) {
  return [...NIVEIS].reverse().find(n => xp >= n.xpMin) ?? NIVEIS[0]
}

export function getProgressoNivel(xp) {
  const nivel = getNivel(xp)
  if (nivel.nivel === 5) return 100
  const range = nivel.xpMax - nivel.xpMin
  const prog  = xp - nivel.xpMin
  return Math.min(Math.round((prog / range) * 100), 100)
}

export const CONQUISTAS = [
  { id: 'inicio_jornada',  nome: 'Início da Jornada',  desc: 'Completou o diagnóstico e gerou seu primeiro cronograma', icon: 'fa-seedling',  cor: { bg: '#EAF3DE', icon: '#3B6D11', text: '#27500A' }, xp: 20  },
  { id: 'primeiro_ritual', nome: 'Primeiro Ritual',     desc: 'Concluiu a primeira etapa do seu cronograma capilar',    icon: 'fa-droplet',   cor: { bg: '#E6F1FB', icon: '#185FA5', text: '#0C447C' }, xp: 15  },
  { id: 'ciclo_completo',  nome: 'Ciclo Completo',      desc: 'Finalizou todas as etapas do primeiro ciclo de cuidados', icon: 'fa-trophy',   cor: { bg: '#EEEDFE', icon: '#534AB7', text: '#3C3489' }, xp: 100 },
  { id: 'ritmo_continuo',  nome: 'Ritmo Contínuo',      desc: '14 dias seguidos de registros na Jornada Lumi',          icon: 'fa-fire',      cor: { bg: '#FAEEDA', icon: '#854F0B', text: '#633806' }, xp: 50  },
  { id: 'ritual_em_dia',   nome: 'Ritual em Dia',       desc: 'Registrou um cuidado capilar por 7 dias seguidos',       icon: 'fa-heart',     cor: { bg: '#FBEAF0', icon: '#993556', text: '#72243E' }, xp: 40  },
  { id: 'fios_equilibrio', nome: 'Fios em Equilíbrio',  desc: 'Atingiu Hair Score acima de 75',                         icon: 'fa-star',      cor: { bg: '#E1F5EE', icon: '#0F6E56', text: '#085041' }, xp: 75  },
  { id: 'nova_fase',       nome: 'Nova Fase',            desc: 'Fez um segundo diagnóstico para releitura do perfil',    icon: 'fa-rotate',    cor: { bg: '#FCEBEB', icon: '#A32D2D', text: '#791F1F' }, xp: 30  },
  { id: 'essencia_lumi',   nome: 'Essência Lumi',        desc: 'Acumulou 500 XP — você é a Lumi em sua forma mais plena', icon: 'fa-crown',   cor: { bg: '#F1EFE8', icon: '#5F5E5A', text: '#444441' }, xp: 0   },
]

export const XP_ACOES = {
  registro_diario:  5,
  ritual_concluido: 20,
  humor_otimo:      3,
  lavou_cabelo:     5,
  hidratou:         8,
  reconstruiu:      10,
  bebeu_agua:       2,
  dormiu_bem:       3,
}

export function calcularAjusteScore(registro) {
  let ajuste = 0
  if (registro.humor === 'otimo')    ajuste += 1
  if (registro.humor === 'bom')      ajuste += 0.5
  if (registro.humor === 'ruim')     ajuste -= 0.5
  if (registro.humor === 'pessimo')  ajuste -= 1
  if (registro.sono === 'otimo')     ajuste += 0.5
  if (registro.sono === 'ruim')      ajuste -= 0.5
  if (registro.agua >= 8)            ajuste += 0.5
  if (registro.agua <= 3)            ajuste -= 0.5
  if (registro.estresse === 'alto')  ajuste -= 1
  if (registro.estresse === 'baixo') ajuste += 0.5
  if (registro.hidratou)             ajuste += 1
  if (registro.reconstruiu)          ajuste += 1.5
  if (registro.lavouCabelo)          ajuste += 0.5
  return Math.round(ajuste * 10) / 10
}

export function getMensagemScore(pontuacao) {
  if (!pontuacao) return 'Seu diagnóstico está sendo calculado.'
  if (pontuacao >= 85) return 'Seus fios estão radiantes e cheios de vida.'
  if (pontuacao >= 75) return 'Seus fios estão caminhando para o equilíbrio.'
  if (pontuacao >= 60) return 'Sua rotina está começando a transformar seus fios.'
  if (pontuacao >= 40) return 'Cada ritual conta — seus fios estão respondendo.'
  return 'Sua jornada de cuidado começa agora.'
}

export function verificarConquistas({ desbloqueadas, streak, etapasConcluidas, hairScore, totalDiagnosticos, xp, cuidado7Dias }) {
  const novas = []
  const check = (id, cond) => { if (cond && !desbloqueadas.includes(id)) novas.push(id) }
  check('inicio_jornada',  totalDiagnosticos >= 1)
  check('primeiro_ritual', etapasConcluidas  >= 1)
  check('ciclo_completo',  etapasConcluidas  >= 4)
  check('ritmo_continuo',  streak            >= 14)
  check('ritual_em_dia',   cuidado7Dias      >= 7)
  check('fios_equilibrio', hairScore         >= 75)
  check('nova_fase',       totalDiagnosticos >= 2)
  check('essencia_lumi',   xp                >= 500)
  return novas
}
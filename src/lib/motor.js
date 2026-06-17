
// utilitarios
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function normalizarTexto(valor = '') {
  return String(valor).trim().toLowerCase()
}

function incluiEvento(respostas, evento) {
  const eventos = respostas?.meta?.eventos ?? respostas?.eventos ?? []
  return eventos.includes(evento)
}

function temProcedimentoCritico(respostas) {
  const tipoQuimica = respostas?.quimica?.tipo
  const estado = respostas?.estado ?? {}

  return (
    tipoQuimica === 'Descoloração' ||
    incluiEvento(respostas, 'descoloracao') ||
    incluiEvento(respostas, 'corte_quimico') ||
    estado.quebra === 'Alta' ||
    estado.elasticidade === 'Não volta'
  )
}

// fragilidade ativa: dano severo recente que ainda não se recuperou, causando maior risco de quebra e sensibilidade
export function avaliarFragilidade(respostas) {
  const estado = respostas?.estado ?? {}
  const quimica = respostas?.quimica ?? {}
  const eventos = respostas?.meta?.eventos ?? respostas?.eventos ?? []

  const motivos = []

  if (eventos.includes('corte_quimico')) motivos.push('corte_quimico')
  if (eventos.includes('descoloracao')) motivos.push('descoloracao')
  if (quimica.tipo === 'Descoloração') motivos.push('descoloracao')
  if (estado.quebra === 'Alta') motivos.push('quebra_alta')
  if (estado.elasticidade === 'Não volta') motivos.push('elasticidade_comprometida')
  if (estado.ressecamento === 'Alto' && estado.frizz === 'Alto') motivos.push('ressecamento_intenso')

  let nivel = 'nenhuma'
  if (motivos.includes('corte_quimico') || motivos.includes('elasticidade_comprometida')) {
    nivel = 'critica'
  } else if (motivos.length >= 2 || motivos.includes('descoloracao') || motivos.includes('quebra_alta')) {
    nivel = 'alta'
  } else if (motivos.length === 1) {
    nivel = 'moderada'
  }

  return {
    ativa: nivel !== 'nenhuma',
    nivel,
    motivos,
    bloqueiaBoostCorte: nivel === 'critica' || nivel === 'alta',
    recuperacaoLenta: nivel === 'critica' || nivel === 'alta',
  }
}

// ── EIXO 1: ESTRUTURA CAPILAR (peso 40%) ─────────────────────────
function calcularEixoEstrutura(respostas) {
  let score = 100
  const { estado = {}, quimica = {} } = respostas

  if (quimica.tipo === 'Descoloração') score -= 25
  if (quimica.tipo === 'Progressiva') score -= 10
  if (quimica.tipo === 'Coloração') score -= 6

  if (incluiEvento(respostas, 'corte_quimico')) score -= 28
  if (incluiEvento(respostas, 'descoloracao')) score -= 18
  if (incluiEvento(respostas, 'quimica')) score -= 10
  if (incluiEvento(respostas, 'coloracao')) score -= 6
  if (incluiEvento(respostas, 'calor')) score -= 4

  if (estado.elasticidade === 'Não volta') score -= 20
  if (estado.elasticidade === 'Parcialmente') score -= 8

  if (estado.quebra === 'Alta') score -= 22
  if (estado.quebra === 'Moderada') score -= 10

  return clamp(score)
}

// ── EIXO 2: CONDIÇÃO ATUAL DO FIO (peso 35%) ─────────────────────
function calcularEixoCondicao(respostas) {
  let score = 100
  const { estado = {} } = respostas

  if (estado.ressecamento === 'Alto') score -= 14
  if (estado.ressecamento === 'Moderado') score -= 7

  if (estado.frizz === 'Alto') score -= 9
  if (estado.frizz === 'Moderado') score -= 4

  if (estado.brilho === 'Baixo') score -= 7
  if (estado.brilho === 'Médio') score -= 2

  if (incluiEvento(respostas, 'piscina_mar')) score -= 3
  if (incluiEvento(respostas, 'produto_novo')) score -= 1

  return clamp(score)
}

// ── EIXO 3: SAÚDE DO COURO CABELUDO (peso 15%) ───────────────────
function calcularEixoCouro(respostas) {
  let score = 100
  const { couro = {} } = respostas

  if (couro.queda === 'Alta') score -= 22
  if (couro.queda === 'Moderada') score -= 10

  if (couro.caspa === 'Frequente') score -= 8
  if (couro.caspa === 'Leve') score -= 3

  if (couro.oleosidade === 'Alta') score -= 5

  if (incluiEvento(respostas, 'queda')) score -= 8
  if (incluiEvento(respostas, 'couro')) score -= 6

  return clamp(score)
}

// ── EIXO 4: HÁBITOS DE VIDA (peso 10%) ───────────────────────────
function calcularEixoHabitos(respostas) {
  let score = 100
  const { vida = {} } = respostas

  if (vida.estresse === 'Alto') score -= 5
  if (vida.estresse === 'Moderado') score -= 3

  if (vida.sono === 'Ruim') score -= 4
  if (vida.sono === 'Média') score -= 2

  if (vida.alimentacao === 'Desregulada') score -= 4
  if (vida.alimentacao === 'Intermediária') score -= 2

  return clamp(score)
}

// ── HAIR SCORE FINAL ──────────────────────────────────────────────
export function calcularHairScoreDetalhado(respostas) {
  const estrutura = calcularEixoEstrutura(respostas)
  const condicao = calcularEixoCondicao(respostas)
  const couro = calcularEixoCouro(respostas)
  const habitos = calcularEixoHabitos(respostas)
  const fragilidade = avaliarFragilidade(respostas)

  let score = estrutura * 0.4 + condicao * 0.35 + couro * 0.15 + habitos * 0.1

  // O corte normal pode melhorar percepção das pontas, mas não cura dano estrutural.
  if (incluiEvento(respostas, 'corte') && !fragilidade.bloqueiaBoostCorte) {
    score += 1
  }

  // Quando há fragilidade ativa, existe um teto temporário.
  // Isso evita "score saudável" logo após dano severo.
  if (fragilidade.nivel === 'critica') score = Math.min(score, 55)
  if (fragilidade.nivel === 'alta') score = Math.min(score, 68)

  return {
    pontuacao: clamp(score),
    eixos: {
      estrutura,
      condicao,
      couro,
      habitos,
    },
    fragilidade,
  }
}

export function calcularHairScore(respostas) {
  return calcularHairScoreDetalhado(respostas).pontuacao
}

// ── CLASSIFICAÇÃO ─────────────────────────────────────────────────
export function classificarScore(pontuacao, fragilidade = null) {
  if (fragilidade?.nivel === 'critica') {
    return { label: 'Fragilizado', cor: '#8C3D3D', estado: 'fragilidade_critica' }
  }

  if (fragilidade?.nivel === 'alta') {
    return { label: 'Em recuperação', cor: '#8A6B3F', estado: 'fragilidade_alta' }
  }

  if (pontuacao >= 85) return { label: 'Radiante', cor: '#BFA878', estado: 'radiante' }
  if (pontuacao >= 70) return { label: 'Equilibrado', cor: '#8EA37F', estado: 'equilibrado' }
  if (pontuacao >= 55) return { label: 'Em evolução', cor: '#AFA5BF', estado: 'evolucao' }
  if (pontuacao >= 40) return { label: 'Sensível', cor: '#A7866A', estado: 'sensivel' }
  return { label: 'Fragilizado', cor: '#8C3D3D', estado: 'fragilizado' }
}

// ── DIAGNÓSTICO ───────────────────────────────────────────────────
export function gerarDiagnostico(respostas) {
  const { estado = {}, couro = {}, quimica = {} } = respostas
  const fragilidade = avaliarFragilidade(respostas)
  const partes = []
  const tratamentos = []

  let nivelDano = 'baixo'

  if (fragilidade.nivel === 'critica') {
    nivelDano = 'crítico'
  } else if (fragilidade.nivel === 'alta') {
    nivelDano = 'alto'
  } else if (quimica.tipo !== 'Não' || estado.quebra === 'Moderada' || estado.elasticidade === 'Parcialmente') {
    nivelDano = 'moderado'
  }

  if (estado.quebra === 'Alta' || estado.elasticidade === 'Não volta' || quimica.tipo === 'Descoloração' || incluiEvento(respostas, 'corte_quimico')) {
    tratamentos.push('reconstrução')
  }

  if (estado.ressecamento === 'Alto' || fragilidade.ativa) {
    tratamentos.push('hidratação')
  }

  if (estado.frizz === 'Alto' || estado.brilho === 'Baixo' || estado.ressecamento === 'Moderado') {
    tratamentos.push('nutrição')
  }

  if (couro.oleosidade === 'Alta' || couro.caspa === 'Frequente') {
    tratamentos.push('detox')
  }

  if (tratamentos.length === 0) tratamentos.push('manutenção')

  const tratamentosUnicos = [...new Set(tratamentos)]

  let saudeCouro = 'equilibrado'
  if (couro.queda === 'Alta' || incluiEvento(respostas, 'queda') || (couro.oleosidade === 'Alta' && couro.caspa !== 'Não')) {
    saudeCouro = 'atenção necessária'
  } else if (couro.caspa !== 'Não' || couro.oleosidade === 'Alta') {
    saudeCouro = 'leve atenção'
  }

  const riscoQueda = couro.queda === 'Alta' || incluiEvento(respostas, 'queda') ? 'alto' : couro.queda === 'Moderada' ? 'moderado' : 'baixo'

  if (fragilidade.nivel === 'critica') {
    partes.push('O cabelo apresenta fragilidade crítica e precisa de recuperação gradual.')
  } else {
    partes.push(`O cabelo apresenta dano estrutural ${nivelDano}.`)
  }

  if (incluiEvento(respostas, 'corte')) {
    partes.push('O corte pode melhorar as pontas, mas não substitui a recuperação da fibra capilar.')
  }

  if (incluiEvento(respostas, 'corte_quimico')) {
    partes.push('Há indícios de corte químico, portanto o foco deve ser reconstrução, hidratação e pausa em procedimentos agressivos.')
  }

  if (tratamentosUnicos[0] !== 'manutenção') {
    partes.push(`Há necessidade principal de ${tratamentosUnicos.join(' e ')}.`)
  } else {
    partes.push('O cabelo está em bom estado, com necessidade de manutenção regular.')
  }

  if (saudeCouro !== 'equilibrado') {
    partes.push(`O couro cabeludo requer ${saudeCouro}.`)
  }

  return {
    nivelDano,
    resultadoPrincipal: partes.join(' '),
    riscoQueda,
    tratamentos: tratamentosUnicos,
    saudeCouro,
    fragilidade,
  }
}

// ── RECOMENDAÇÕES ─────────────────────────────────────────────────
export function gerarRecomendacoes(diagnostico, respostas) {
  const { tratamentos, fragilidade } = diagnostico
  const { couro = {} } = respostas
  const recomendacoes = []

  if (fragilidade?.ativa) {
    recomendacoes.push({
      tipo: 'Pausa Técnica',
      descricao: 'Evite química, calor excessivo e tração enquanto os fios estiverem fragilizados.',
      prioridade: fragilidade.nivel === 'critica' ? 'Crítica' : 'Alta',
    })
  }

  if (tratamentos.includes('reconstrução')) {
    recomendacoes.push({
      tipo: 'Reconstrução',
      descricao: 'Use proteínas e ativos reconstrutores para reforçar a estrutura fragilizada dos fios.',
      prioridade: fragilidade?.ativa ? 'Crítica' : 'Alta',
    })
  }

  if (tratamentos.includes('hidratação')) {
    recomendacoes.push({
      tipo: 'Hidratação',
      descricao: 'Reforce a reposição hídrica para recuperar maleabilidade, toque e elasticidade.',
      prioridade: tratamentos.includes('reconstrução') ? 'Alta' : 'Média',
    })
  }

  if (tratamentos.includes('nutrição')) {
    recomendacoes.push({
      tipo: 'Nutrição',
      descricao: 'Reponha lipídios para reduzir frizz, aspereza e perda de água dos fios.',
      prioridade: 'Média',
    })
  }

  if (tratamentos.includes('detox') || couro.oleosidade === 'Alta') {
    recomendacoes.push({
      tipo: 'Detox',
      descricao: 'Faça limpeza equilibrada para reduzir acúmulo de resíduos sem sensibilizar o couro.',
      prioridade: 'Média',
    })
  }

  if (tratamentos.includes('manutenção')) {
    recomendacoes.push({
      tipo: 'Manutenção',
      descricao: 'Mantenha uma rotina leve para preservar brilho, maciez e equilíbrio dos fios.',
      prioridade: 'Baixa',
    })
  }

  return recomendacoes
}

// ── CRONOGRAMA ────────────────────────────────────────────────────
export function gerarCronograma(diagnostico, respostas) {
  const { nivelDano, tratamentos, fragilidade } = diagnostico
  const { couro = {} } = respostas
  const semanas = []

  const frequenciaLavagem =
    couro.oleosidade === 'Alta' ? '3 vezes por semana' :
    couro.oleosidade === 'Normal' ? '2 vezes por semana' :
    '1 vez por semana'

  function proximaData(diaSemana, semanaOffset = 0) {
    const dias = {
      'Segunda-feira': 1,
      'Terça-feira': 2,
      'Quarta-feira': 3,
      'Quinta-feira': 4,
      'Sexta-feira': 5,
      'Sábado': 6,
      'Domingo': 0,
    }

    const hoje = new Date()
    const diaAlvo = dias[diaSemana] ?? 1
    const diaAtual = hoje.getDay()
    let diff = diaAlvo - diaAtual
    if (diff <= 0) diff += 7

    const data = new Date(hoje)
    data.setDate(hoje.getDate() + diff + semanaOffset * 7)
    data.setHours(8, 0, 0, 0)
    return data
  }

  if (fragilidade?.nivel === 'critica') {
    semanas.push({ semana: 1, etapas: [
      { dia: 'Segunda-feira', tipo: 'Reconstrução', data: proximaData('Segunda-feira', 0) },
      { dia: 'Quinta-feira', tipo: 'Hidratação', data: proximaData('Quinta-feira', 0) },
    ]})
    semanas.push({ semana: 2, etapas: [
      { dia: 'Terça-feira', tipo: 'Hidratação', data: proximaData('Terça-feira', 1) },
      { dia: 'Sexta-feira', tipo: 'Nutrição', data: proximaData('Sexta-feira', 1) },
    ]})
    semanas.push({ semana: 3, etapas: [
      { dia: 'Segunda-feira', tipo: 'Reconstrução', data: proximaData('Segunda-feira', 2) },
      { dia: 'Quinta-feira', tipo: 'Hidratação', data: proximaData('Quinta-feira', 2) },
    ]})
    semanas.push({ semana: 4, etapas: [
      { dia: 'Terça-feira', tipo: 'Nutrição', data: proximaData('Terça-feira', 3) },
      { dia: 'Sábado', tipo: 'Hidratação', data: proximaData('Sábado', 3) },
    ]})
  } else if (nivelDano === 'alto' || nivelDano === 'crítico') {
    semanas.push({ semana: 1, etapas: [
      { dia: 'Segunda-feira', tipo: 'Reconstrução', data: proximaData('Segunda-feira', 0) },
      { dia: 'Quinta-feira', tipo: 'Hidratação', data: proximaData('Quinta-feira', 0) },
    ]})
    semanas.push({ semana: 2, etapas: [
      { dia: 'Terça-feira', tipo: 'Nutrição', data: proximaData('Terça-feira', 1) },
      { dia: 'Sexta-feira', tipo: 'Hidratação', data: proximaData('Sexta-feira', 1) },
    ]})
    semanas.push({ semana: 3, etapas: [
      { dia: 'Segunda-feira', tipo: 'Reconstrução', data: proximaData('Segunda-feira', 2) },
      { dia: 'Quinta-feira', tipo: 'Nutrição', data: proximaData('Quinta-feira', 2) },
    ]})
    semanas.push({ semana: 4, etapas: [
      { dia: 'Quarta-feira', tipo: 'Hidratação', data: proximaData('Quarta-feira', 3) },
      { dia: 'Sábado', tipo: 'Nutrição', data: proximaData('Sábado', 3) },
    ]})
  } else if (nivelDano === 'moderado') {
    semanas.push({ semana: 1, etapas: [
      { dia: 'Segunda-feira', tipo: tratamentos[0] || 'Hidratação', data: proximaData('Segunda-feira', 0) },
      { dia: 'Quinta-feira', tipo: tratamentos[1] || 'Nutrição', data: proximaData('Quinta-feira', 0) },
    ]})
    semanas.push({ semana: 2, etapas: [
      { dia: 'Terça-feira', tipo: 'Hidratação', data: proximaData('Terça-feira', 1) },
      { dia: 'Sexta-feira', tipo: 'Nutrição', data: proximaData('Sexta-feira', 1) },
    ]})
  } else {
    semanas.push({ semana: 1, etapas: [{ dia: 'Quarta-feira', tipo: 'Hidratação', data: proximaData('Quarta-feira', 0) }] })
    semanas.push({ semana: 2, etapas: [{ dia: 'Quarta-feira', tipo: 'Nutrição', data: proximaData('Quarta-feira', 1) }] })
  }

  return { semanas, frequenciaLavagem }
}

// ── EVENTOS DIÁRIOS: IMPACTO INCREMENTAL ─────────────────────────
export function calcularDeltaEventoCapilar(evento, contexto = {}) {
  const fragilidadeAtiva = contexto.fragilidadeAtiva || contexto.fragilidade?.ativa

  const mapa = {
    corte: fragilidadeAtiva ? 0 : 1,
    corte_pontas: fragilidadeAtiva ? 0 : 1,
    corte_quimico: -8,
    quimica: -4,
    coloracao: -2,
    descoloracao: -5,
    calor: -1,
    piscina_mar: -1,
    produto_novo: 0,
    queda: -3,
    couro: -2,
    nada: 0,
  }

  return mapa[evento] ?? 0
}

export function calcularDeltaEventosCapilares(eventos = [], contexto = {}) {
  const lista = eventos.includes('nada') ? [] : eventos
  const total = lista.reduce((acc, evento) => acc + calcularDeltaEventoCapilar(evento, contexto), 0)
  return Math.max(-10, Math.min(3, total))
}
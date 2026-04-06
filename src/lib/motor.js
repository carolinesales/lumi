// src/lib/motor.js
// Motor de Recomendação Lumi — Modelo por Eixos Ponderados
// Hair Score = (Estrutura × 40%) + (Condição × 35%) + (Couro × 15%) + (Hábitos × 10%)

// ── EIXO 1: ESTRUTURA CAPILAR (peso 40%) ─────────────────────────
function calcularEixoEstrutura(respostas) {
  let score = 100
  const { estado, quimica } = respostas

  if (quimica.tipo === 'Descoloração')          score -= 25
  if (quimica.tipo === 'Progressiva')            score -= 8
  if (quimica.tipo === 'Coloração')              score -= 5

  if (estado.elasticidade === 'Não volta')       score -= 15
  if (estado.elasticidade === 'Parcialmente')    score -= 7

  if (estado.quebra === 'Alta')                  score -= 18
  if (estado.quebra === 'Moderada')              score -= 8

  return Math.max(0, Math.min(100, score))
}

// ── EIXO 2: CONDIÇÃO ATUAL DO FIO (peso 35%) ─────────────────────
function calcularEixoCondicao(respostas) {
  let score = 100
  const { estado } = respostas

  if (estado.ressecamento === 'Alto')            score -= 12
  if (estado.ressecamento === 'Moderado')        score -= 6

  if (estado.frizz === 'Alto')                   score -= 8
  if (estado.frizz === 'Moderado')               score -= 4

  if (estado.brilho === 'Baixo')                 score -= 6
  if (estado.brilho === 'Médio')                 score -= 2

  return Math.max(0, Math.min(100, score))
}

// ── EIXO 3: SAÚDE DO COURO CABELUDO (peso 15%) ───────────────────
function calcularEixoCouro(respostas) {
  let score = 100
  const { couro } = respostas

  if (couro.queda === 'Alta')                    score -= 20
  if (couro.queda === 'Moderada')                score -= 10

  if (couro.caspa === 'Frequente')               score -= 8
  if (couro.caspa === 'Leve')                    score -= 3

  if (couro.oleosidade === 'Alta')               score -= 5

  return Math.max(0, Math.min(100, score))
}

// ── EIXO 4: HÁBITOS DE VIDA (peso 10%) ───────────────────────────
function calcularEixoHabitos(respostas) {
  let score = 100
  const { vida } = respostas

  if (vida.estresse === 'Alto')                  score -= 5
  if (vida.estresse === 'Moderado')              score -= 3

  if (vida.sono === 'Ruim')                      score -= 4
  if (vida.sono === 'Média')                     score -= 2

  if (vida.alimentacao === 'Desregulada')        score -= 4
  if (vida.alimentacao === 'Intermediária')      score -= 2

  return Math.max(0, Math.min(100, score))
}

// ── HAIR SCORE FINAL (média ponderada) ───────────────────────────
export function calcularHairScore(respostas) {
  const estrutura = calcularEixoEstrutura(respostas)
  const condicao  = calcularEixoCondicao(respostas)
  const couro     = calcularEixoCouro(respostas)
  const habitos   = calcularEixoHabitos(respostas)

  const score = (
    estrutura * 0.40 +
    condicao  * 0.35 +
    couro     * 0.15 +
    habitos   * 0.10
  )

  return Math.round(Math.max(0, Math.min(100, score)))
}

// ── CLASSIFICAÇÃO ─────────────────────────────────────────────────
export function classificarScore(pontuacao) {
  if (pontuacao >= 80) return { label: 'Saudável',          cor: '#4CAF50' }
  if (pontuacao >= 60) return { label: 'Moderado',          cor: '#b07830' }
  if (pontuacao >= 40) return { label: 'Danificado',        cor: '#E65100' }
  return                      { label: 'Muito danificado',  cor: '#dc3232' }
}

// ── DIAGNÓSTICO ───────────────────────────────────────────────────
export function gerarDiagnostico(respostas) {
  const { estrutura, estado, couro, quimica } = respostas
  const partes     = []
  const tratamentos = []

  // Nível de dano estrutural
  let nivelDano = 'baixo'
  if (quimica.tipo === 'Descoloração' || estado.quebra === 'Alta' || estado.elasticidade === 'Não volta') {
    nivelDano = 'alto'
  } else if (quimica.tipo !== 'Não' || estado.quebra === 'Moderada' || estado.elasticidade === 'Parcialmente') {
    nivelDano = 'moderado'
  }

  // Tratamentos necessários
  if (estado.ressecamento === 'Alto')                                         tratamentos.push('hidratação')
  if (estado.frizz === 'Alto' || estado.brilho === 'Baixo')                  tratamentos.push('nutrição')
  if (estado.quebra === 'Alta' || estado.elasticidade === 'Não volta')        tratamentos.push('reconstrução')
  if (quimica.tipo === 'Descoloração')                                        tratamentos.push('reconstrução')
  if (tratamentos.length === 0)                                               tratamentos.push('manutenção')

  // Remover duplicatas
  const tratamentosUnicos = [...new Set(tratamentos)]

  // Saúde do couro
  let saudeCouro = 'equilibrado'
  if (couro.queda === 'Alta' || (couro.oleosidade === 'Alta' && couro.caspa !== 'Não')) {
    saudeCouro = 'atenção necessária'
  } else if (couro.caspa !== 'Não' || couro.oleosidade === 'Alta') {
    saudeCouro = 'leve atenção'
  }

  const riscoQueda = couro.queda === 'Alta' ? 'alto' : couro.queda === 'Moderada' ? 'moderado' : 'baixo'

  // Texto do diagnóstico
  partes.push(`O cabelo apresenta dano estrutural ${nivelDano}.`)
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
  }
}

// ── RECOMENDAÇÕES ─────────────────────────────────────────────────
export function gerarRecomendacoes(diagnostico, respostas) {
  const { tratamentos } = diagnostico
  const { couro, vida } = respostas
  const recomendacoes = []

  if (tratamentos.includes('reconstrução')) {
    recomendacoes.push({
      tipo: 'Reconstrução',
      descricao: 'Utilize proteínas e queratina para restaurar a estrutura danificada dos fios.',
      prioridade: 'Alta',
    })
  }
  if (tratamentos.includes('hidratação')) {
    recomendacoes.push({
      tipo: 'Hidratação',
      descricao: 'Reforce a reposição hídrica dos fios com máscaras e leave-ins hidratantes.',
      prioridade: tratamentos.includes('reconstrução') ? 'Alta' : 'Alta',
    })
  }
  if (tratamentos.includes('nutrição')) {
    recomendacoes.push({
      tipo: 'Nutrição',
      descricao: 'Aplique óleos e cremes nutritivos para controlar o frizz e melhorar o brilho.',
      prioridade: 'Média',
    })
  }
  if (couro.oleosidade === 'Alta') {
    recomendacoes.push({
      tipo: 'Detox',
      descricao: 'Faça detox capilar para remover resíduos e regular a oleosidade do couro.',
      prioridade: 'Média',
    })
  }
  if (tratamentos.includes('manutenção')) {
    recomendacoes.push({
      tipo: 'Manutenção',
      descricao: 'Mantenha a rotina com hidratação leve quinzenal para preservar a saúde dos fios.',
      prioridade: 'Baixa',
    })
  }

  return recomendacoes
}

// ── CRONOGRAMA ────────────────────────────────────────────────────
export function gerarCronograma(diagnostico, respostas) {
  const { nivelDano, tratamentos } = diagnostico
  const { couro } = respostas
  const semanas = []

  const frequenciaLavagem =
    couro.oleosidade === 'Alta'   ? '3 vezes por semana' :
    couro.oleosidade === 'Normal' ? '2 vezes por semana' :
                                    '1 vez por semana'

  // Função para calcular próxima data a partir de um dia da semana
  function proximaData(diaSemana, semanaOffset = 0) {
    const dias = { 'Segunda-feira': 1, 'Terça-feira': 2, 'Quarta-feira': 3, 'Quinta-feira': 4, 'Sexta-feira': 5, 'Sábado': 6, 'Domingo': 0 }
    const hoje = new Date()
    const diaAlvo = dias[diaSemana] ?? 1
    const diaAtual = hoje.getDay()
    let diff = diaAlvo - diaAtual
    if (diff <= 0) diff += 7
    const data = new Date(hoje)
    data.setDate(hoje.getDate() + diff + (semanaOffset * 7))
    data.setHours(8, 0, 0, 0)
    return data
  }

  if (nivelDano === 'alto') {
    semanas.push({ semana: 1, etapas: [
      { dia: 'Segunda-feira', tipo: 'Reconstrução', data: proximaData('Segunda-feira', 0) },
      { dia: 'Quinta-feira',  tipo: 'Hidratação',   data: proximaData('Quinta-feira',  0) },
    ]})
    semanas.push({ semana: 2, etapas: [
      { dia: 'Terça-feira', tipo: 'Nutrição',    data: proximaData('Terça-feira', 1) },
      { dia: 'Sexta-feira', tipo: 'Hidratação',  data: proximaData('Sexta-feira', 1) },
    ]})
    semanas.push({ semana: 3, etapas: [
      { dia: 'Segunda-feira', tipo: 'Reconstrução', data: proximaData('Segunda-feira', 2) },
      { dia: 'Quinta-feira',  tipo: 'Nutrição',     data: proximaData('Quinta-feira',  2) },
    ]})
    semanas.push({ semana: 4, etapas: [
      { dia: 'Quarta-feira', tipo: 'Hidratação', data: proximaData('Quarta-feira', 3) },
      { dia: 'Sábado',       tipo: 'Nutrição',   data: proximaData('Sábado',       3) },
    ]})
  } else if (nivelDano === 'moderado') {
    semanas.push({ semana: 1, etapas: [
      { dia: 'Segunda-feira', tipo: tratamentos[0] || 'Hidratação', data: proximaData('Segunda-feira', 0) },
      { dia: 'Quinta-feira',  tipo: tratamentos[1] || 'Nutrição',   data: proximaData('Quinta-feira',  0) },
    ]})
    semanas.push({ semana: 2, etapas: [
      { dia: 'Terça-feira', tipo: 'Hidratação', data: proximaData('Terça-feira', 1) },
      { dia: 'Sexta-feira', tipo: 'Nutrição',   data: proximaData('Sexta-feira', 1) },
    ]})
  } else {
    semanas.push({ semana: 1, etapas: [{ dia: 'Quarta-feira', tipo: 'Hidratação', data: proximaData('Quarta-feira', 0) }] })
    semanas.push({ semana: 2, etapas: [{ dia: 'Quarta-feira', tipo: 'Nutrição',   data: proximaData('Quarta-feira', 1) }] })
  }

  return { semanas, frequenciaLavagem }
}

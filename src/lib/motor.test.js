// src/lib/motor.test.js
import { describe, it, expect } from 'vitest'
import {
  avaliarFragilidade,
  calcularHairScore,
  calcularHairScoreDetalhado,
  classificarScore,
  gerarDiagnostico,
  gerarRecomendacoes,
  gerarCronograma,
  calcularDeltaEventoCapilar,
  calcularDeltaEventosCapilares,
} from './motor'

// testes

const saudavel = {
  estrutura: { tipoCurvatura: 'Cacheado', espessuraTextura: 'Médio', densidadeCapilar: 'Média', comprimento: 'Médio' },
  estado:    { ressecamento: 'Baixo', frizz: 'Baixo', quebra: 'Baixa', brilho: 'Alto', elasticidade: 'Sim, totalmente' },
  couro:     { oleosidade: 'Normal', caspa: 'Não', queda: 'Baixa' },
  quimica:   { tipo: 'Não' },
  vida:      { estresse: 'Baixo', sono: 'Boa', alimentacao: 'Equilibrada' },
}

const danificado = {
  estado:  { ressecamento: 'Alto', frizz: 'Alto', quebra: 'Alta', brilho: 'Baixo', elasticidade: 'Não volta' },
  couro:   { oleosidade: 'Alta', caspa: 'Frequente', queda: 'Alta' },
  quimica: { tipo: 'Descoloração' },
  vida:    { estresse: 'Alto', sono: 'Ruim', alimentacao: 'Desregulada' },
}

const descolorado = {
  estado:  { ressecamento: 'Alto', frizz: 'Moderado', quebra: 'Alta', brilho: 'Baixo', elasticidade: 'Não volta' },
  couro:   { oleosidade: 'Normal', caspa: 'Não', queda: 'Baixa' },
  quimica: { tipo: 'Descoloração' },
  vida:    { estresse: 'Baixo', sono: 'Boa', alimentacao: 'Equilibrada' },
}

const moderado = {
  estado:  { ressecamento: 'Moderado', frizz: 'Moderado', quebra: 'Moderada', brilho: 'Médio', elasticidade: 'Parcialmente' },
  couro:   { oleosidade: 'Normal', caspa: 'Leve', queda: 'Moderada' },
  quimica: { tipo: 'Coloração' },
  vida:    { estresse: 'Moderado', sono: 'Média', alimentacao: 'Intermediária' },
}

// avalicação de fragilidade

describe('avaliarFragilidade', () => {
  it('retorna ativa=false para cabelo saudável', () => {
    const r = avaliarFragilidade(saudavel)
    expect(r.ativa).toBe(false)
    expect(r.nivel).toBe('nenhuma')
    expect(r.motivos).toHaveLength(0)
  })

  it('retorna nivel=critica para elasticidade comprometida', () => {
    const r = avaliarFragilidade({ estado: { elasticidade: 'Não volta' } })
    expect(r.ativa).toBe(true)
    expect(r.nivel).toBe('critica')
    expect(r.bloqueiaBoostCorte).toBe(true)
    expect(r.recuperacaoLenta).toBe(true)
  })

  it('retorna nivel=critica para evento corte_quimico', () => {
    const r = avaliarFragilidade({ eventos: ['corte_quimico'] })
    expect(r.nivel).toBe('critica')
    expect(r.motivos).toContain('corte_quimico')
  })

  it('retorna nivel=alta para descoloração no histórico químico', () => {
    const r = avaliarFragilidade({ quimica: { tipo: 'Descoloração' } })
    expect(r.nivel).toBe('alta')
    expect(r.motivos).toContain('descoloracao')
  })

  it('retorna nivel=alta para quebra alta', () => {
    const r = avaliarFragilidade({ estado: { quebra: 'Alta' } })
    expect(r.nivel).toBe('alta')
    expect(r.motivos).toContain('quebra_alta')
  })

  it('retorna nivel=moderada para ressecamento+frizz alto (sem outros motivos)', () => {
    const r = avaliarFragilidade({ estado: { ressecamento: 'Alto', frizz: 'Alto' } })
    expect(r.nivel).toBe('moderada')
    expect(r.motivos).toContain('ressecamento_intenso')
  })

  it('retorna nivel=alta quando há 2+ motivos combinados', () => {
    const r = avaliarFragilidade({
      estado:  { ressecamento: 'Alto', frizz: 'Alto', quebra: 'Alta' },
      quimica: { tipo: 'Descoloração' },
    })
    expect(r.nivel).toBe('alta')
    expect(r.motivos.length).toBeGreaterThanOrEqual(2)
  })
})

// calcula o lumi score (0-100) a partir das respostas do diagnóstico

describe('calcularHairScore', () => {
  it('retorna valor entre 0 e 100', () => {
    const s1 = calcularHairScore(saudavel)
    const s2 = calcularHairScore(danificado)
    expect(s1).toBeGreaterThanOrEqual(0)
    expect(s1).toBeLessThanOrEqual(100)
    expect(s2).toBeGreaterThanOrEqual(0)
    expect(s2).toBeLessThanOrEqual(100)
  })

  it('cabelo saudável tem score maior que cabelo danificado', () => {
    expect(calcularHairScore(saudavel)).toBeGreaterThan(calcularHairScore(danificado))
  })

  it('cabelo saudável tem score alto (>= 80)', () => {
    expect(calcularHairScore(saudavel)).toBeGreaterThanOrEqual(80)
  })

  it('cabelo muito danificado tem score baixo (<= 55)', () => {
    expect(calcularHairScore(danificado)).toBeLessThanOrEqual(55)
  })

  it('descoloração aplica teto de 55 por fragilidade crítica', () => {
    expect(calcularHairScore(descolorado)).toBeLessThanOrEqual(55)
  })

  it('retorna número inteiro', () => {
    const score = calcularHairScore(saudavel)
    expect(Number.isInteger(score)).toBe(true)
  })

  it('respostas vazias não geram erro e retornam número válido', () => {
    const score = calcularHairScore({})
    expect(typeof score).toBe('number')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

// calcula o lumi score detalhado, com pontuação geral e eixos específicos de estrutura,
// condição, couro e hábitos, além de avaliação de fragilidade ativa

describe('calcularHairScoreDetalhado', () => {
  it('retorna estrutura com pontuacao e 4 eixos', () => {
    const r = calcularHairScoreDetalhado(saudavel)
    expect(r).toHaveProperty('pontuacao')
    expect(r).toHaveProperty('eixos.estrutura')
    expect(r).toHaveProperty('eixos.condicao')
    expect(r).toHaveProperty('eixos.couro')
    expect(r).toHaveProperty('eixos.habitos')
    expect(r).toHaveProperty('fragilidade')
  })

  it('todos os eixos estão entre 0 e 100', () => {
    const { eixos } = calcularHairScoreDetalhado(danificado)
    Object.values(eixos).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    })
  })

  it('eixo estrutura é penalizado mais severamente com descoloração', () => {
    const { eixos: e1 } = calcularHairScoreDetalhado(saudavel)
    const { eixos: e2 } = calcularHairScoreDetalhado(descolorado)
    expect(e1.estrutura).toBeGreaterThan(e2.estrutura)
  })

  it('evento corte sem fragilidade adiciona 1 ponto ao score', () => {
    const base  = calcularHairScoreDetalhado(saudavel).pontuacao
    const comCorte = calcularHairScoreDetalhado({ ...saudavel, eventos: ['corte'] }).pontuacao
    expect(comCorte).toBe(Math.min(100, base + 1))
  })

  it('evento corte com fragilidade crítica NÃO adiciona ponto', () => {
    const resp = { ...descolorado, eventos: ['corte'] }
    const semCorte = calcularHairScoreDetalhado(descolorado).pontuacao
    const comCorte = calcularHairScoreDetalhado(resp).pontuacao
    expect(comCorte).toBe(semCorte)
  })
})

// classifica o score em categorias qualitativas, considerando também a 
// fragilidade ativa para rebaixar a classificação quando necessário

describe('classificarScore', () => {
  it('score >= 85 retorna Radiante', () => {
    const r = classificarScore(90)
    expect(r.label).toBe('Radiante')
    expect(r.estado).toBe('radiante')
  })

  it('score >= 70 e < 85 retorna Equilibrado', () => {
    const r = classificarScore(75)
    expect(r.label).toBe('Equilibrado')
  })

  it('score >= 55 e < 70 retorna Em evolução', () => {
    expect(classificarScore(60).label).toBe('Em evolução')
  })

  it('score >= 40 e < 55 retorna Sensível', () => {
    expect(classificarScore(45).label).toBe('Sensível')
  })

  it('score < 40 retorna Fragilizado', () => {
    expect(classificarScore(30).label).toBe('Fragilizado')
  })

  it('fragilidade crítica sobrescreve score alto', () => {
    const r = classificarScore(90, { nivel: 'critica' })
    expect(r.label).toBe('Fragilizado')
    expect(r.estado).toBe('fragilidade_critica')
  })

  it('fragilidade alta sobrescreve score alto', () => {
    const r = classificarScore(80, { nivel: 'alta' })
    expect(r.label).toBe('Em recuperação')
    expect(r.estado).toBe('fragilidade_alta')
  })

  it('sem fragilidade respeita a pontuação normalmente', () => {
    expect(classificarScore(85, null).label).toBe('Radiante')
  })

  it('retorna cor em todos os casos', () => {
    [10, 45, 60, 75, 90].forEach(pts => {
      const r = classificarScore(pts)
      expect(r.cor).toBeTruthy()
      expect(r.cor).toMatch(/^#/)
    })
  })
})

// gera diagnóstico capilar detalhado a partir das respostas do usuário, 
// incluindo avaliação de fragilidade ativa, nível de dano, risco de queda e tratamentos recomendados

describe('gerarDiagnostico', () => {
  it('retorna estrutura completa', () => {
    const d = gerarDiagnostico(saudavel)
    expect(d).toHaveProperty('nivelDano')
    expect(d).toHaveProperty('resultadoPrincipal')
    expect(d).toHaveProperty('riscoQueda')
    expect(d).toHaveProperty('tratamentos')
    expect(d).toHaveProperty('saudeCouro')
    expect(d).toHaveProperty('fragilidade')
  })

  it('cabelo saudável retorna tratamento manutenção', () => {
    const d = gerarDiagnostico(saudavel)
    expect(d.tratamentos).toContain('manutenção')
  })

  it('descoloração gera tratamento reconstrução', () => {
    const d = gerarDiagnostico(descolorado)
    expect(d.tratamentos).toContain('reconstrução')
  })

  it('ressecamento alto gera tratamento hidratação', () => {
    const d = gerarDiagnostico({ estado: { ressecamento: 'Alto' } })
    expect(d.tratamentos).toContain('hidratação')
  })

  it('frizz alto gera tratamento nutrição', () => {
    const d = gerarDiagnostico({ estado: { frizz: 'Alto' } })
    expect(d.tratamentos).toContain('nutrição')
  })

  it('oleosidade alta gera tratamento detox', () => {
    const d = gerarDiagnostico({ couro: { oleosidade: 'Alta' } })
    expect(d.tratamentos).toContain('detox')
  })

  it('nível de dano é crítico para fragilidade crítica', () => {
    const d = gerarDiagnostico(descolorado)
    expect(d.nivelDano).toBe('crítico')
  })

  it('risco de queda alto quando queda=Alta', () => {
    const d = gerarDiagnostico({ couro: { queda: 'Alta' } })
    expect(d.riscoQueda).toBe('alto')
  })

  it('tratamentos são únicos (sem repetição)', () => {
    const d = gerarDiagnostico(danificado)
    const unicos = [...new Set(d.tratamentos)]
    expect(d.tratamentos).toEqual(unicos)
  })

  it('resultadoPrincipal é string não vazia', () => {
    const d = gerarDiagnostico(moderado)
    expect(typeof d.resultadoPrincipal).toBe('string')
    expect(d.resultadoPrincipal.length).toBeGreaterThan(10)
  })
})

// gera cronograma semanal e mensal personalizado a partir do diagnóstico, 
// considerando os tratamentos recomendados, frequência ideal de lavagem e evitando 
// sobrecarga em casos de fragilidade ativa

describe('gerarRecomendacoes', () => {
  it('retorna array de recomendações', () => {
    const d = gerarDiagnostico(moderado)
    const r = gerarRecomendacoes(d, moderado)
    expect(Array.isArray(r)).toBe(true)
    expect(r.length).toBeGreaterThan(0)
  })

  it('cada recomendação tem tipo, descrição e prioridade', () => {
    const d = gerarDiagnostico(moderado)
    const r = gerarRecomendacoes(d, moderado)
    r.forEach(rec => {
      expect(rec).toHaveProperty('tipo')
      expect(rec).toHaveProperty('descricao')
      expect(rec).toHaveProperty('prioridade')
    })
  })

  it('fragilidade ativa gera recomendação de Pausa Técnica', () => {
    const d = gerarDiagnostico(descolorado)
    const r = gerarRecomendacoes(d, descolorado)
    expect(r.some(rec => rec.tipo === 'Pausa Técnica')).toBe(true)
  })

  it('fragilidade crítica gera prioridade Crítica', () => {
    const d = gerarDiagnostico(descolorado)
    const r = gerarRecomendacoes(d, descolorado)
    const critica = r.find(rec => rec.tipo === 'Pausa Técnica')
    expect(critica?.prioridade).toBe('Crítica')
  })

  it('cabelo saudável gera recomendação de Manutenção', () => {
    const d = gerarDiagnostico(saudavel)
    const r = gerarRecomendacoes(d, saudavel)
    expect(r.some(rec => rec.tipo === 'Manutenção')).toBe(true)
  })

  it('recomendação de reconstrução tem prioridade Alta ou Crítica', () => {
    const d = gerarDiagnostico(descolorado)
    const r = gerarRecomendacoes(d, descolorado)
    const reconst = r.find(rec => rec.tipo === 'Reconstrução')
    expect(['Alta', 'Crítica']).toContain(reconst?.prioridade)
  })
})

// gera cronograma semanal e mensal personalizado a partir do diagnóstico, 
// considerando os tratamentos recomendados, frequência ideal de lavagem e evitando 
// sobrecarga em casos de fragilidade ativa

describe('gerarCronograma', () => {
  it('retorna semanas e frequenciaLavagem', () => {
    const d = gerarDiagnostico(saudavel)
    const c = gerarCronograma(d, saudavel)
    expect(c).toHaveProperty('semanas')
    expect(c).toHaveProperty('frequenciaLavagem')
    expect(Array.isArray(c.semanas)).toBe(true)
  })

  it('cada etapa tem dia, tipo e data', () => {
    const d = gerarDiagnostico(moderado)
    const c = gerarCronograma(d, moderado)
    c.semanas.forEach(sem => {
      sem.etapas.forEach(etapa => {
        expect(etapa).toHaveProperty('dia')
        expect(etapa).toHaveProperty('tipo')
        expect(etapa).toHaveProperty('data')
        expect(etapa.data).toBeInstanceOf(Date)
      })
    })
  })

  it('oleosidade alta gera frequência de 3x por semana', () => {
    const d = gerarDiagnostico({ couro: { oleosidade: 'Alta' } })
    const c = gerarCronograma(d, { couro: { oleosidade: 'Alta' } })
    expect(c.frequenciaLavagem).toBe('3 vezes por semana')
  })

  it('oleosidade normal gera frequência de 2x por semana', () => {
    const d = gerarDiagnostico(saudavel)
    const c = gerarCronograma(d, saudavel)
    expect(c.frequenciaLavagem).toBe('2 vezes por semana')
  })

  it('cabelo danificado gera 4 semanas de cronograma', () => {
    const d = gerarDiagnostico(danificado)
    const c = gerarCronograma(d, danificado)
    expect(c.semanas.length).toBe(4)
  })

  it('datas das etapas são no futuro', () => {
    const agora = new Date()
    const d = gerarDiagnostico(moderado)
    const c = gerarCronograma(d, moderado)
    c.semanas.forEach(sem => {
      sem.etapas.forEach(etapa => {
        expect(etapa.data.getTime()).toBeGreaterThan(agora.getTime())
      })
    })
  })
})

// calcula o impacto de um evento capilar no score, 
// considerando a fragilidade ativa para moderação dos efeitos positivos e negativos

describe('calcularDeltaEventoCapilar', () => {
  it('corte sem fragilidade retorna +1', () => {
    expect(calcularDeltaEventoCapilar('corte', {})).toBe(1)
  })

  it('corte com fragilidade ativa retorna 0', () => {
    expect(calcularDeltaEventoCapilar('corte', { fragilidadeAtiva: true })).toBe(0)
  })

  it('corte_quimico retorna -8', () => {
    expect(calcularDeltaEventoCapilar('corte_quimico')).toBe(-8)
  })

  it('descoloracao retorna -5', () => {
    expect(calcularDeltaEventoCapilar('descoloracao')).toBe(-5)
  })

  it('coloracao retorna -2', () => {
    expect(calcularDeltaEventoCapilar('coloracao')).toBe(-2)
  })

  it('calor retorna -1', () => {
    expect(calcularDeltaEventoCapilar('calor')).toBe(-1)
  })

  it('nada retorna 0', () => {
    expect(calcularDeltaEventoCapilar('nada')).toBe(0)
  })

  it('evento desconhecido retorna 0', () => {
    expect(calcularDeltaEventoCapilar('evento_inexistente')).toBe(0)
  })
})

// calcula o impacto combinado de múltiplos eventos capilares no score,

describe('calcularDeltaEventosCapilares', () => {
  it('lista com nada retorna 0', () => {
    expect(calcularDeltaEventosCapilares(['nada'])).toBe(0)
  })

  it('lista vazia retorna 0', () => {
    expect(calcularDeltaEventosCapilares([])).toBe(0)
  })

  it('múltiplos eventos negativos são somados', () => {
    const delta = calcularDeltaEventosCapilares(['calor', 'coloracao'])
    expect(delta).toBe(-3)
  })

  it('resultado nunca é menor que -10', () => {
    const delta = calcularDeltaEventosCapilares([
      'corte_quimico', 'descoloracao', 'queda', 'couro', 'calor',
    ])
    expect(delta).toBeGreaterThanOrEqual(-10)
  })

  it('resultado nunca é maior que 3', () => {
    const delta = calcularDeltaEventosCapilares(['corte', 'corte_pontas'])
    expect(delta).toBeLessThanOrEqual(3)
  })

  it('nada na lista ignora outros eventos', () => {
    expect(calcularDeltaEventosCapilares(['nada', 'calor', 'coloracao'])).toBe(0)
  })
})

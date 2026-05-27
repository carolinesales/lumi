// src/lib/reavaliacaoService.js
import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import { calcularDeltaEventosCapilares } from './motor'

export const EVENTOS_CAPILARES = [
  { id: 'corte', label: 'Cortei o cabelo', icon: 'fa-scissors' },
  { id: 'corte_pontas', label: 'Cortei pontas danificadas', icon: 'fa-scissors' },
  { id: 'corte_quimico', label: 'Tive corte químico', icon: 'fa-triangle-exclamation' },
  { id: 'quimica', label: 'Fiz química', icon: 'fa-flask' },
  { id: 'coloracao', label: 'Mudei a cor', icon: 'fa-palette' },
  { id: 'descoloracao', label: 'Descolori os fios', icon: 'fa-wand-magic-sparkles' },
  { id: 'calor', label: 'Usei muito calor', icon: 'fa-temperature-high' },
  { id: 'piscina_mar', label: 'Piscina ou mar', icon: 'fa-water' },
  { id: 'produto_novo', label: 'Usei produto novo', icon: 'fa-bottle-droplet' },
  { id: 'queda', label: 'Notei mais queda', icon: 'fa-arrow-trend-down' },
  { id: 'couro', label: 'Couro cabeludo mudou', icon: 'fa-circle-exclamation' },
  { id: 'nada', label: 'Nada diferente', icon: 'fa-minus' },
]

export function getEventoById(id) {
  return EVENTOS_CAPILARES.find(e => e.id === id)
}

export function calcularDeltaEventos(eventos = [], contexto = {}) {
  return calcularDeltaEventosCapilares(eventos, contexto)
}

export function montarRespostasReavaliacao({ base = {}, respostas = {}, eventos = [] }) {
  const mudouEstrutura = eventos.some(e => ['corte', 'corte_pontas', 'corte_quimico', 'quimica', 'coloracao', 'descoloracao'].includes(e))
  const mudouCouro = eventos.some(e => ['queda', 'couro'].includes(e))

  return {
    estrutura: {
      tipoCurvatura: base?.estrutura?.tipoCurvatura ?? base?.tipoCurvatura ?? respostas.tipoCurvatura ?? '',
      espessuraTextura: base?.estrutura?.espessuraTextura ?? base?.espessuraTextura ?? respostas.espessuraTextura ?? '',
      densidadeCapilar: base?.estrutura?.densidadeCapilar ?? base?.densidadeCapilar ?? respostas.densidadeCapilar ?? '',
      comprimento: respostas.comprimento ?? base?.estrutura?.comprimento ?? base?.comprimento ?? '',
    },
    estado: {
      ressecamento: respostas.ressecamento ?? base?.estado?.ressecamento ?? '',
      frizz: respostas.frizz ?? base?.estado?.frizz ?? '',
      quebra: eventos.includes('corte_quimico') ? 'Alta' : (respostas.quebra ?? base?.estado?.quebra ?? ''),
      brilho: respostas.brilho ?? base?.estado?.brilho ?? '',
      elasticidade: eventos.includes('corte_quimico') ? 'Não volta' : (respostas.elasticidade ?? base?.estado?.elasticidade ?? ''),
    },
    couro: {
      oleosidade: respostas.oleosidade ?? base?.couro?.oleosidade ?? '',
      caspa: respostas.caspa ?? base?.couro?.caspa ?? '',
      queda: respostas.queda ?? base?.couro?.queda ?? '',
    },
    quimica: {
      tipo: eventos.includes('descoloracao') ? 'Descoloração' : (respostas.quimica ?? base?.quimica?.tipo ?? 'Não'),
      mudouEstrutura,
    },
    vida: {
      estresse: respostas.estresse ?? base?.vida?.estresse ?? '',
      sono: respostas.sono ?? base?.vida?.sono ?? '',
      atividadeFisica: respostas.atividadeFisica ?? base?.vida?.atividadeFisica ?? '',
      alimentacao: respostas.alimentacao ?? base?.vida?.alimentacao ?? '',
    },
    meta: {
      eventos,
      mudouEstrutura,
      mudouCouro,
      tipo: 'reavaliacao',
    },
  }
}

export async function salvarEventoCapilar({ uid, dataId, eventos = [], detalhes = {}, origem = 'registro_diario', contexto = {} }) {
  const id = dataId || new Date().toISOString().split('T')[0]
  const deltaEventos = calcularDeltaEventos(eventos, contexto)

  await setDoc(
    doc(db, 'usuarios', uid, 'eventos_capilares', id),
    {
      data: id,
      eventos,
      detalhes,
      origem,
      deltaHairScore: deltaEventos,
      fragilidadeAtiva: eventos.includes('corte_quimico') || eventos.includes('descoloracao') || contexto.fragilidadeAtiva || false,
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  )

  return deltaEventos
}

export async function salvarReavaliacaoInteligente({ uid, eventos, respostas, resultado }) {
  const ref = await addDoc(collection(db, 'usuarios', uid, 'reavaliacoes'), {
    eventos,
    respostas,
    resultado,
    criadoEm: serverTimestamp(),
  })

  await setDoc(
    doc(db, 'usuarios', uid),
    {
      ultimaReavaliacaoId: ref.id,
      ultimaReavaliacaoEm: serverTimestamp(),
      totalDiagnosticos: (resultado?.totalDiagnosticos ?? 1),
      fragilidadeAtiva: resultado?.fragilidade?.ativa ?? false,
      fragilidadeNivel: resultado?.fragilidade?.nivel ?? 'nenhuma',
      fragilidadeMotivos: resultado?.fragilidade?.motivos ?? [],
    },
    { merge: true }
  )

  return ref.id
}

export async function aplicarImpactoEventosDoDia({ uid, dataId, eventos, detalhes, origem, contexto = {} }) {
  const userSnap = await getDoc(doc(db, 'usuarios', uid))
  const userData = userSnap.data() ?? {}

  const ctx = {
    ...contexto,
    fragilidadeAtiva: contexto.fragilidadeAtiva ?? userData.fragilidadeAtiva ?? false,
    fragilidade: {
      ativa: userData.fragilidadeAtiva ?? false,
      nivel: userData.fragilidadeNivel ?? 'nenhuma',
      motivos: userData.fragilidadeMotivos ?? [],
    },
  }

  const deltaEventos = await salvarEventoCapilar({ uid, dataId, eventos, detalhes, origem, contexto: ctx })

  if (deltaEventos === 0) {
    return { delta: 0, scoreAtual: null, scoreAnterior: null }
  }

  return aplicarDeltaHairScore({
    uid,
    delta: deltaEventos,
    origem: origem || 'evento_capilar',
    dataId: `${dataId || new Date().toISOString().split('T')[0]}_eventos`,
    extra: {
      eventos,
      detalhes,
      fragilidadeAtiva: ctx.fragilidadeAtiva,
    },
  })
}

export async function buscarBaseUsuario(uid) {
  const [perfilSnap, habitoSnap] = await Promise.all([
    getDoc(doc(db, 'usuarios', uid, 'perfil_capilar', 'atual')),
    getDoc(doc(db, 'usuarios', uid, 'habito_vida', 'atual')),
  ])

  return {
    estrutura: perfilSnap.exists() ? perfilSnap.data() : {},
    vida: habitoSnap.exists() ? habitoSnap.data() : {},
  }
}
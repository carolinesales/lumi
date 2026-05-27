import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function clampScore(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

export async function resolverScoreAtual({ uid, userData = null }) {
  const data = userData ?? (await getDoc(doc(db, 'usuarios', uid))).data() ?? {}
  if (typeof data.hairScoreAtual === 'number') return clampScore(data.hairScoreAtual)
  const basePossivel = data.hairScoreBase ?? data.hairScore ?? data.scoreBase
  if (typeof basePossivel === 'number') return clampScore(basePossivel + (data.hairScoreAjuste ?? 0))
  const scoresSnap = await getDocs(query(collection(db, 'usuarios', uid, 'hair_scores'), orderBy('dataRegistro', 'desc'), limit(1)))
  if (!scoresSnap.empty) return clampScore(scoresSnap.docs[0].data()?.pontuacao)
  return 0
}

export function getScoreAtualFromUser(userData = {}) {
  if (typeof userData.hairScoreAtual === 'number') return clampScore(userData.hairScoreAtual)
  const base = userData.hairScoreBase ?? userData.hairScore ?? userData.scoreBase
  if (typeof base === 'number') return clampScore(base + (userData.hairScoreAjuste ?? 0))
  return 0
}

export function calcularDeltaRitual(tipoCuidado, contexto = {}) {
  const fragilidadeAtiva = contexto.fragilidadeAtiva || contexto.fragilidade?.ativa
  const base = { Hidratação: 2, Nutrição: 2, Reconstrução: 3, Detox: 1, Umectação: 2, Lavagem: 1 }
  let delta = base[tipoCuidado] ?? 1
  if (fragilidadeAtiva) {
    if (tipoCuidado === 'Reconstrução') delta = 2
    else if (tipoCuidado === 'Hidratação') delta = 1
    else if (tipoCuidado === 'Nutrição') delta = 1
    else delta = 0
  }
  return delta
}

export async function salvarHistoricoHairScore({ uid, scoreAtual, scoreAnterior, delta, origem, dataId, extra = {} }) {
  const id = dataId || new Date().toISOString().split('T')[0]
  await setDoc(doc(db, 'usuarios', uid, 'hair_scores', id), { pontuacao: clampScore(scoreAtual), anterior: clampScore(scoreAnterior), delta: Number(delta) || 0, origem, dataRegistro: new Date(), ...extra }, { merge: true })
}

export async function aplicarDeltaHairScore({ uid, delta, origem, dataId, extra = {} }) {
  const userRef = doc(db, 'usuarios', uid)
  const snap = await getDoc(userRef)
  const userData = snap.data() ?? {}
  const scoreAnterior = await resolverScoreAtual({ uid, userData })
  const scoreAtual = clampScore(scoreAnterior + (Number(delta) || 0))
  const scoreDelta = scoreAtual - scoreAnterior
  const baseParaPersistir = typeof userData.hairScoreBase === 'number' ? userData.hairScoreBase : scoreAnterior
  const updates = { hairScoreBase: baseParaPersistir, hairScoreAtual: scoreAtual, hairScoreAnterior: scoreAnterior, hairScoreDelta: scoreDelta, hairScoreAjuste: scoreAtual - baseParaPersistir, hairScoreAtualizadoEm: new Date() }
  if (extra.fragilidadeAtiva !== undefined) updates.fragilidadeAtiva = extra.fragilidadeAtiva
  if (extra.fragilidadeNivel) updates.fragilidadeNivel = extra.fragilidadeNivel
  if (extra.fragilidadeMotivos) updates.fragilidadeMotivos = extra.fragilidadeMotivos
  await updateDoc(userRef, updates)
  await salvarHistoricoHairScore({ uid, scoreAtual, scoreAnterior, delta: scoreDelta, origem, dataId, extra })
  return { scoreAnterior, scoreAtual, delta: scoreDelta }
}

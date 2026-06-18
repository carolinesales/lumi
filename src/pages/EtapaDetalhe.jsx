import { useEffect, useMemo, useRef, useState } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'

import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useIdioma } from '../contexts/IdiomaContext'
import { XP_ACOES, CONQUISTAS, verificarConquistas } from '../lib/gamificacao'
import { aplicarDeltaHairScore, calcularDeltaRitual } from '@/features/hairScore/services/hairScore'
import { Button } from '@/components/ui/button'
import AppShell from '@/components/lumi/AppShell'
import { cn } from '@/lib/utils'

const _TRAT_KEY = {
  'Hidratação': 'trat_hidratacao', 'Nutrição': 'trat_nutricao',
  'Reconstrução': 'trat_reconstrucao', 'Umectação': 'trat_umectacao',
  'Detox': 'trat_detox', 'Lavagem': 'trat_lavagem',
}
function labelTipo(tipo, t) {
  const k = _TRAT_KEY[tipo]
  if (!k || !t) return tipo
  const v = t(k)
  return (!v || v === k) ? tipo : v
}


// ─── Dados por tipo de cuidado ──────────────────────────────────────────────

const TREATMENTS = {
  Hidratação:   { icon: 'fa-droplet',        iconBg: 'bg-treatment-hydration-soft',      iconColor: 'text-treatment-hydration',      hex: '#5B9EBF', min: 15, score: 8 },
  Nutrição:     { icon: 'fa-leaf',           iconBg: 'bg-treatment-nutrition-soft',      iconColor: 'text-treatment-nutrition-deep', hex: '#C9A227', min: 20, score: 8 },
  Reconstrução: { icon: 'fa-shield-heart',   iconBg: 'bg-treatment-reconstruction-soft', iconColor: 'text-treatment-reconstruction', hex: '#8B6FC4', min: 10, score: 10 },
  Detox:        { icon: 'fa-sparkles',       iconBg: 'bg-treatment-reconstruction-soft', iconColor: 'text-treatment-reconstruction', hex: '#8B6FC4', min: 5,  score: 6 },
  Umectação:    { icon: 'fa-bottle-droplet', iconBg: 'bg-treatment-nutrition-soft',      iconColor: 'text-treatment-nutrition-deep', hex: '#C4A033', min: 30, score: 7 },
  Lavagem:      { icon: 'fa-pump-soap',      iconBg: 'bg-surface-subtle',                iconColor: 'text-text-secondary',           hex: '#7A9299', min: 5,  score: 5 },
}

function getTreatment(tipo) {
  return TREATMENTS[tipo] ?? TREATMENTS.Hidratação
}

const TIPO_DESC = {
  pt: {
    Hidratação:   { longa: 'A hidratação repõe água e ajuda a recuperar maciez, brilho e maleabilidade dos fios. É indicada quando o cabelo está opaco, áspero ou com sensação de ressecamento.', complemento: 'Esse cuidado costuma deixar os fios mais leves, macios e com aparência mais saudável.' },
    Nutrição:     { longa: 'A nutrição ajuda a repor lipídios e devolver maciez, brilho e alinhamento aos fios. É indicada quando o cabelo está com frizz, pontas ressecadas, toque áspero ou aparência opaca.', complemento: 'Esse cuidado costuma deixar os fios mais maleáveis, protegidos e com sensação de cabelo mais saudável.' },
    Reconstrução: { longa: 'A reconstrução restaura força e estrutura dos fios, especialmente após química, quebra ou perda de massa. É indicada para fios frágeis, elásticos ou quebradiços.', complemento: 'Esse cuidado ajuda a devolver resistência aos fios. Use com equilíbrio: proteína em excesso pode deixá-los rígidos.' },
    Detox:        { longa: 'O detox capilar limpa resíduos acumulados e ajuda o couro cabeludo a respirar melhor. Indicado para sensação de raiz pesada, acúmulo de produto ou oleosidade.', complemento: 'Esse cuidado costuma deixar a raiz mais leve e o couro cabeludo com sensação de limpeza.' },
    Umectação:    { longa: 'A umectação sela nutrientes e melhora o toque dos fios ressecados. Indicada para pontas secas, frizz e fios sem maleabilidade.', complemento: 'Esse cuidado costuma deixar os fios mais macios e nutridos. Use pouca quantidade para não pesar.' },
    Lavagem:      { longa: 'A lavagem correta remove impurezas sem agredir a fibra capilar, mantendo o couro cabeludo limpo e os fios leves.', complemento: 'Uma boa lavagem prepara os fios para os próximos cuidados da sua rotina.' },
  },
  en: {
    Hidratação:   { longa: 'Hydration restores water and improves softness, shine and manageability. Best for dull, rough or dry-feeling hair.', complemento: 'This care tends to leave strands lighter, softer and looking healthier.' },
    Nutrição:     { longa: 'Nutrition helps replenish lipids and restore softness, shine and alignment. Best when hair has frizz, dry ends, a rough feel or a dull look.', complemento: 'This care tends to leave strands more manageable, protected and feeling healthier.' },
    Reconstrução: { longa: 'Reconstruction restores strength and structure, especially after chemical processes or breakage. Best for fragile or brittle hair.', complemento: 'It helps bring resistance back to the hair. Use with balance: too much protein can make strands stiff.' },
    Detox:        { longa: 'Scalp detox removes buildup and helps the scalp breathe. Best for heavy roots, product buildup or oiliness.', complemento: 'This care tends to leave the roots lighter and the scalp feeling clean.' },
    Umectação:    { longa: 'Umectation seals nutrients and improves dry hair texture. Best for dry ends, frizz and stiff strands.', complemento: 'This care tends to leave strands softer and nourished. Use a small amount so it does not weigh down.' },
    Lavagem:      { longa: 'Proper cleansing removes impurities without harming the hair fiber, keeping the scalp clean and strands light.', complemento: 'A good wash prepares your hair for the next steps of your routine.' },
  },
}

const MATERIAIS = {
  Hidratação:   [{ ptt: 'Shampoo', en: 'Shampoo', icon: 'fa-pump-soap' }, { ptt: 'Máscara de hidratação', en: 'Hydration mask', icon: 'fa-jar' }, { ptt: 'Pente', en: 'Comb', icon: 'fa-shower' }, { ptt: 'Touca térmica', en: 'Thermal cap', icon: 'fa-temperature-half' }],
  Nutrição:     [{ ptt: 'Shampoo', en: 'Shampoo', icon: 'fa-pump-soap' }, { ptt: 'Condicionador', en: 'Conditioner', icon: 'fa-bottle-droplet' }, { ptt: 'Máscara de nutrição', en: 'Nutrition mask', icon: 'fa-jar' }, { ptt: 'Pente', en: 'Comb', icon: 'fa-shower' }, { ptt: 'Touca térmica', en: 'Thermal cap', icon: 'fa-temperature-half' }],
  Reconstrução: [{ ptt: 'Shampoo', en: 'Shampoo', icon: 'fa-pump-soap' }, { ptt: 'Máscara de reconstrução', en: 'Reconstruction mask', icon: 'fa-jar' }, { ptt: 'Pente', en: 'Comb', icon: 'fa-shower' }, { ptt: 'Touca térmica', en: 'Thermal cap', icon: 'fa-temperature-half' }],
  Detox:        [{ ptt: 'Shampoo antirresíduos', en: 'Clarifying shampoo', icon: 'fa-pump-soap' }, { ptt: 'Pente', en: 'Comb', icon: 'fa-shower' }],
  Umectação:    [{ ptt: 'Óleo vegetal', en: 'Vegetable oil', icon: 'fa-bottle-droplet' }, { ptt: 'Pente', en: 'Comb', icon: 'fa-shower' }, { ptt: 'Touca térmica', en: 'Thermal cap', icon: 'fa-temperature-half' }, { ptt: 'Shampoo', en: 'Shampoo', icon: 'fa-pump-soap' }],
  Lavagem:      [{ ptt: 'Shampoo', en: 'Shampoo', icon: 'fa-pump-soap' }, { ptt: 'Condicionador', en: 'Conditioner', icon: 'fa-bottle-droplet' }, { ptt: 'Toalha', en: 'Towel', icon: 'fa-temperature-half' }],
}

const RITUAL_STEPS = {
  pt: {
    Hidratação: [
      { titulo: 'Preparar',  texto: 'Lave os fios com suavidade para receber melhor a máscara.' },
      { titulo: 'Retirar excesso de água', texto: 'Pressione com a toalha, sem esfregar.' },
      { titulo: 'Aplicar',   texto: 'Distribua a máscara pelo comprimento e pontas.' },
      { titulo: 'Pausar',    texto: 'Deixe o produto agir pelo tempo indicado.' },
      { titulo: 'Finalizar', texto: 'Enxágue e finalize observando toque, brilho e leveza.' },
    ],
    Nutrição: [
      { titulo: 'Preparar',  texto: 'Separe os fios em mechas para facilitar a aplicação.' },
      { titulo: 'Aplicar',   texto: 'Aplique no comprimento, priorizando áreas ásperas.' },
      { titulo: 'Massagear', texto: 'Espalhe com suavidade, sem friccionar demais.' },
      { titulo: 'Pausar',    texto: 'Aguarde o tempo indicado pelo produto.' },
      { titulo: 'Finalizar', texto: 'Enxágue e finalize evitando calor excessivo.' },
    ],
    Reconstrução: [
      { titulo: 'Preparar',   texto: 'Comece com os fios limpos.' },
      { titulo: 'Aplicar',    texto: 'Aplique apenas no comprimento e pontas.' },
      { titulo: 'Distribuir', texto: 'Espalhe sem exagerar na quantidade.' },
      { titulo: 'Pausar',     texto: 'Respeite o tempo indicado na embalagem.' },
      { titulo: 'Finalizar',  texto: 'Enxágue e observe se os fios ficaram mais firmes.' },
    ],
    Detox: [
      { titulo: 'Preparar',  texto: 'Molhe bem o couro cabeludo.' },
      { titulo: 'Aplicar',   texto: 'Aplique o produto na raiz.' },
      { titulo: 'Massagear', texto: 'Massageie com as pontas dos dedos.' },
      { titulo: 'Pausar',    texto: 'Aguarde o produto agir, se ele pedir pausa.' },
      { titulo: 'Finalizar', texto: 'Enxágue completamente e finalize com leveza.' },
    ],
    Umectação: [
      { titulo: 'Aplicar',    texto: 'Aplique óleo no comprimento e pontas.' },
      { titulo: 'Distribuir', texto: 'Espalhe com cuidado para não pesar.' },
      { titulo: 'Pausar',     texto: 'Deixe agir pelo tempo que fizer sentido para você.' },
      { titulo: 'Remover',    texto: 'Remova com uma lavagem suave.' },
      { titulo: 'Observar',   texto: 'Perceba o toque final dos fios.' },
    ],
    Lavagem: [
      { titulo: 'Molhar',    texto: 'Molhe bem os fios antes do shampoo.' },
      { titulo: 'Aplicar',   texto: 'Aplique shampoo apenas na raiz.' },
      { titulo: 'Massagear', texto: 'Massageie com as polpas dos dedos.' },
      { titulo: 'Enxaguar',  texto: 'Enxágue completamente.' },
      { titulo: 'Finalizar', texto: 'Use condicionador ou máscara leve se necessário.' },
    ],
  },
  en: {
    Hidratação: [
      { titulo: 'Prepare',             texto: 'Gently wash your hair so it absorbs the mask better.' },
      { titulo: 'Remove excess water', texto: 'Press with a towel, without rubbing.' },
      { titulo: 'Apply',               texto: 'Spread the mask along the length and ends.' },
      { titulo: 'Wait',                texto: 'Let the product act for the recommended time.' },
      { titulo: 'Finish',              texto: 'Rinse and finish, noticing touch, shine and lightness.' },
    ],
    Nutrição: [
      { titulo: 'Prepare', texto: 'Separate hair into sections to ease application.' },
      { titulo: 'Apply',   texto: 'Apply along the length, prioritizing rough areas.' },
      { titulo: 'Massage', texto: 'Spread gently, without rubbing too much.' },
      { titulo: 'Wait',    texto: 'Wait for the time recommended by the product.' },
      { titulo: 'Finish',  texto: 'Rinse and finish, avoiding excessive heat.' },
    ],
    Reconstrução: [
      { titulo: 'Prepare',    texto: 'Start with clean hair.' },
      { titulo: 'Apply',      texto: 'Apply only on the length and ends.' },
      { titulo: 'Distribute', texto: 'Spread without overdoing the amount.' },
      { titulo: 'Wait',       texto: 'Respect the time indicated on the package.' },
      { titulo: 'Finish',     texto: 'Rinse and check if strands feel firmer.' },
    ],
    Detox: [
      { titulo: 'Prepare', texto: 'Wet your scalp well.' },
      { titulo: 'Apply',   texto: 'Apply the product to the roots.' },
      { titulo: 'Massage', texto: 'Massage with your fingertips.' },
      { titulo: 'Wait',    texto: 'Let the product act, if it requires a pause.' },
      { titulo: 'Finish',  texto: 'Rinse thoroughly and finish gently.' },
    ],
    Umectação: [
      { titulo: 'Apply',      texto: 'Apply oil along the length and ends.' },
      { titulo: 'Distribute', texto: 'Spread carefully so it does not weigh down.' },
      { titulo: 'Wait',       texto: 'Let it act for as long as makes sense for you.' },
      { titulo: 'Remove',     texto: 'Remove with a gentle wash.' },
      { titulo: 'Observe',    texto: 'Notice the final touch of your hair.' },
    ],
    Lavagem: [
      { titulo: 'Wet',     texto: 'Wet your hair well before shampoo.' },
      { titulo: 'Apply',   texto: 'Apply shampoo only to the roots.' },
      { titulo: 'Massage', texto: 'Massage with your fingertips.' },
      { titulo: 'Rinse',   texto: 'Rinse thoroughly.' },
      { titulo: 'Finish',  texto: 'Use conditioner or a light mask if needed.' },
    ],
  },
}

const PASSO_ESPERA = { Hidratação: 3, Nutrição: 3, Reconstrução: 3, Detox: 3, Umectação: 2, Lavagem: null }

const SENSACOES = [
  { id: 'macio',        labelPt: 'Mais macio',      labelEn: 'Softer',        icon: 'fa-feather' },
  { id: 'leve',         labelPt: 'Mais leve',       labelEn: 'Lighter',       icon: 'fa-wind' },
  { id: 'brilho',       labelPt: 'Com mais brilho', labelEn: 'Shinier',       icon: 'fa-sparkles' },
  { id: 'frizz',        labelPt: 'Menos frizz',     labelEn: 'Less frizz',    icon: 'fa-grip-lines' },
  { id: 'ressecado',    labelPt: 'Ainda ressecado', labelEn: 'Still dry',     icon: 'fa-droplet-slash' },
  { id: 'semDiferenca', labelPt: 'Sem diferença',   labelEn: 'No difference', icon: 'fa-minus' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function dataHoje() { return new Date().toISOString().split('T')[0] }
function formatSigned(v) { const n = Number(v ?? 0); return n > 0 ? `+${n}` : `${n}` }
function formatTimer(s) {
  const min = Math.floor(s / 60), sec = s % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); d.setHours(0, 0, 0, 0); return d }

// ─── Página ─────────────────────────────────────────────────────────────────

export default function EtapaDetalhe() {
  const { cronogramaId, etapaId } = useParams()
  const { user } = useAuth()
  const { t, idioma } = useIdioma()
  const navigate = useNavigate()
  const tr = (key, fallback) => {
    const v = t(key)
    return (!v || v === key) ? fallback : v
  }

  const [etapa, setEtapa] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stepsDone, setStepsDone] = useState([])
  const [iniciado, setIniciado] = useState(false)
  const [reagendarAberto, setReagendarAberto] = useState(false)
  const [confirmarPular, setConfirmarPular] = useState(false)

  // timer
  const [tempoEscolhido, setTempoEscolhido] = useState(10)
  const [timerSeg, setTimerSeg] = useState(10 * 60)
  const [timerRodando, setTimerRodando] = useState(false)
  const [timerConcluido, setTimerConcluido] = useState(false)
  const [timerAberto, setTimerAberto] = useState(false)
  const timerRef = useRef(null)

  // avaliação
  const [sensacoes, setSensacoes] = useState([])
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    if (!user || !cronogramaId || !etapaId) return
    const uid = user.uid
    Promise.all([
      getDoc(doc(db, 'usuarios', uid, 'cronogramas', cronogramaId, 'etapas', etapaId)),
      getDoc(doc(db, 'usuarios', uid)),
    ]).then(([snap, userSnap]) => {
      if (!snap.exists()) return
      const data = { id: snap.id, ...snap.data() }
      const usuario = userSnap.data() ?? {}
      setEtapa(data)
      setStepsDone(data.passosConcluidos ?? [])
      setSensacoes(data.sensacoes ?? [])
      if ((data.passosConcluidos ?? []).length > 0) setIniciado(true)
      const th = getTreatment(data.tipoCuidado)
      const tempoSalvo = usuario?.[`timerPausa_${data.tipoCuidado}`] ?? th.min
      setTempoEscolhido(tempoSalvo)
      setTimerSeg(tempoSalvo * 60)
    })
  }, [user, cronogramaId, etapaId])

  useEffect(() => {
    if (!timerRodando) return
    timerRef.current = setInterval(() => {
      setTimerSeg(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setTimerRodando(false)
          setTimerConcluido(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timerRodando])

  useEffect(() => {
    if (!timerRodando && !timerConcluido) setTimerSeg(tempoEscolhido * 60)
  }, [tempoEscolhido, timerRodando, timerConcluido])

  const descLang    = TIPO_DESC[idioma] ?? TIPO_DESC.pt
  const desc        = etapa ? descLang[etapa.tipoCuidado] ?? { longa: '', complemento: '' } : { longa: '', complemento: '' }
  const stepsLang   = RITUAL_STEPS[idioma] ?? RITUAL_STEPS.pt
  const ritualSteps = useMemo(() => (etapa ? stepsLang[etapa.tipoCuidado] ?? stepsLang.Hidratação : []), [etapa, idioma]) // eslint-disable-line
  const passoEspera = etapa ? PASSO_ESPERA[etapa.tipoCuidado] ?? null : null
  const theme       = etapa ? getTreatment(etapa.tipoCuidado) : getTreatment('Hidratação')
  const materiais   = etapa ? MATERIAIS[etapa.tipoCuidado] ?? [] : []
  const timerPct    = Math.min(100, Math.round(((tempoEscolhido * 60 - timerSeg) / (tempoEscolhido * 60)) * 100))

  function toggleStep(index) {
    setStepsDone(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
  }
  function toggleSensacao(id) {
    setSensacoes(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  function iniciarTimer() {
    if (user && etapa) {
      updateDoc(doc(db, 'usuarios', user.uid), { [`timerPausa_${etapa.tipoCuidado}`]: tempoEscolhido })
    }
    setTimerSeg(tempoEscolhido * 60)
    setTimerConcluido(false)
    setTimerRodando(true)
  }
  function finalizarTimer() {
    clearInterval(timerRef.current)
    setTimerRodando(false)
    if (passoEspera !== null && !stepsDone.includes(passoEspera)) {
      setStepsDone(prev => [...prev, passoEspera])
    }
    setTimerAberto(false)
  }

  async function reagendar(opcao) {
    if (!user || !etapa) return
    const novaData = opcao === 'amanha' ? addDays(new Date(), 1) : addDays(new Date(), 2)
    await updateDoc(
      doc(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas', etapaId),
      { dataEtapa: novaData, reagendadaEm: new Date(), _modo: null },
    )
    navigate('/app/cronograma')
  }

  async function concluir() {
    if (!user || !etapa || loading) return
    setLoading(true)
    try {
      const uid = user.uid
      const hoje = dataHoje()
      const etapaRef = doc(db, 'usuarios', uid, 'cronogramas', cronogramaId, 'etapas', etapaId)
      const userRef = doc(db, 'usuarios', uid)

      await updateDoc(etapaRef, {
        concluida: true, pulada: false,
        passosConcluidos: stepsDone, sensacoes,
        concluidaEm: new Date(), _modo: null,
      })

      const userSnap = await getDoc(userRef)
      const ud = userSnap.data() ?? {}
      const etapasConcluidas = (ud.etapasConcluidas ?? 0) + 1
      const xpGanho = XP_ACOES.ritual_concluido ?? 20
      const novoXp = (ud.xp ?? 0) + xpGanho

      const scoreRes = await aplicarDeltaHairScore({
        uid, delta: calcularDeltaRitual(etapa.tipoCuidado),
        origem: 'ritual_concluido', dataId: `${hoje}_${etapaId}`,
        extra: { cronogramaId, etapaId, tipoCuidado: etapa.tipoCuidado, xpGanho, passosConcluidos: stepsDone, sensacoes },
      })

      await updateDoc(userRef, { xp: novoXp, etapasConcluidas, ultimoRitualConcluidoEm: new Date() })

      const cSnap = await getDoc(doc(db, 'usuarios', uid, 'conquistas', 'desbloqueadas'))
      const desbloqueadas = cSnap.exists() ? cSnap.data().ids ?? [] : []
      const novasIds = verificarConquistas({
        desbloqueadas, streak: ud.streak ?? 0, etapasConcluidas,
        hairScore: scoreRes.scoreAtual, totalDiagnosticos: ud.totalDiagnosticos ?? 1,
        xp: novoXp, cuidado7Dias: ud.cuidado7Dias ?? 0,
      })
      const conquistasNovas = novasIds.map(id => CONQUISTAS.find(c => c.id === id)).filter(Boolean)

      if (conquistasNovas.length > 0) {
        const xpBonus = conquistasNovas.reduce((acc, c) => acc + (c.xp ?? 0), 0)
        await setDoc(
          doc(db, 'usuarios', uid, 'conquistas', 'desbloqueadas'),
          { ids: [...desbloqueadas, ...novasIds], atualizadoEm: new Date() },
          { merge: true },
        )
        if (xpBonus > 0) await updateDoc(userRef, { xp: novoXp + xpBonus })
      }

      setResultado({ xpGanho, scoreAtual: scoreRes.scoreAtual, scoreDelta: scoreRes.delta, conquistasNovas })
    } finally {
      setLoading(false)
    }
  }

  async function pular() {
    if (!user || !etapa) return
    await updateDoc(
      doc(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas', etapaId),
      { pulada: true, puladaEm: new Date(), _modo: null },
    )
    navigate('/app/cronograma')
  }

  // ── Loading ──
  if (!etapa) {
    return (
      <AppShell>
        <main className="grid min-h-[70vh] place-items-center bg-surface-muted text-text-tertiary">
          <i className="fa-solid fa-spinner fa-spin text-2xl" />
        </main>
      </AppShell>
    )
  }

  const totalSteps = ritualSteps.length
  const feitos = stepsDone.length
  const todosFeitos = totalSteps > 0 && feitos === totalSteps

  return (
    <AppShell onPrimaryAction={() => navigate('/app/home')}>
      <main className="min-h-screen bg-surface-muted px-4 pb-16 pt-5 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6">

          {/* ── Título de página ── */}
          <header className="flex flex-col gap-1">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => navigate('/app/cronograma')}
                aria-label={tr('etp_voltar', 'Voltar')}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text transition hover:bg-surface-subtle"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-['Montserrat'] text-xl font-semibold text-text">{tr('etp_titulo', 'Cuidado programado')}</h1>
            </div>
            <h1 className="hidden font-['Montserrat'] text-2xl font-semibold text-text lg:block">{tr('etp_titulo', 'Cuidado programado')}</h1>
            <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{tr('etp_subtitulo', 'Veja o que fazer, se prepare com calma e registre quando concluir.')}</p>
          </header>

          {/* ── 2 colunas ── */}
          <div className="grid gap-4 lg:grid-cols-[385px_minmax(0,1fr)] lg:items-start">

            {/* ── Coluna esquerda ── */}
            <div className="flex flex-col gap-4">

              {/* Card info */}
              <section className="flex flex-col gap-6 rounded-[16px] bg-surface p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', theme.iconBg)}>
                      <i className={cn('fa-solid text-base', theme.icon, theme.iconColor)} aria-hidden="true" />
                    </span>
                    <h2 className="font-['Montserrat'] text-xl font-semibold text-text">{labelTipo(etapa.tipoCuidado, tr)}</h2>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <p className="font-['Nunito_Sans'] text-sm leading-6 text-text-secondary">{desc.longa}</p>
                    {desc.complemento && (
                      <p className="font-['Nunito_Sans'] text-sm leading-6 text-text-secondary">{desc.complemento}</p>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 font-['Nunito_Sans'] text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-regular fa-clock text-text-tertiary" aria-hidden="true" />
                    {theme.min} min
                  </span>
                  <span className="text-text-tertiary" aria-hidden="true">·</span>
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-arrow-trend-up text-text-tertiary" aria-hidden="true" />
                    +{theme.score} {tr('etp_no_score', 'no Hair Score')}
                  </span>
                </div>

                {/* Ações */}
                {!iniciado ? (
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" onClick={() => setIniciado(true)}>
                      {tr('etp_fazer_agora', 'Fazer agora')}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setReagendarAberto(true)}>
                        {tr('etp_reagendar', 'Reagendar')}
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setConfirmarPular(true)}>
                        {tr('etp_pular', 'Pular cuidado')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button className="w-full" disabled={loading} onClick={concluir}>
                    {loading ? tr('etp_salvando', 'Salvando...') : tr('etp_concluir', 'Concluir ritual')}
                  </Button>
                )}
              </section>

              {/* Card materiais */}
              {materiais.length > 0 && (
                <section className="flex flex-col gap-5 rounded-[16px] bg-surface p-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-['Montserrat'] text-base font-semibold text-text">{tr('etp_antes', 'Antes de começar')}</h3>
                    <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{tr('etp_antes_sub', 'Separe os itens que você pode precisar para fazer esse cuidado.')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {materiais.map((m, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-surface-subtle py-1 pl-1 pr-3 font-['Nunito_Sans'] text-sm font-medium text-text">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface">
                          <i className={cn('fa-solid text-[11px] text-text-tertiary', m.icon)} aria-hidden="true" />
                        </span>
                        {idioma === 'en' ? m.en : m.ptt}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── Coluna direita: etapas ── */}
            <section className="flex flex-col gap-5 rounded-[16px] bg-surface p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="font-['Montserrat'] text-xl font-semibold text-text">{tr('etp_etapas', 'Passo a passo')}</h2>
                  <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{tr('etp_passo_a_passo', 'Siga as etapas no seu ritmo. Você pode consultar antes de começar ou marcar enquanto faz.')}</p>
                </div>
                {iniciado && (
                  <span className="shrink-0 font-['Nunito_Sans'] text-xs font-semibold text-text-secondary">{feitos}/{totalSteps}</span>
                )}
              </div>

              <div className={cn('flex flex-col transition-opacity', !iniciado && 'opacity-55')}>
                {ritualSteps.map((step, idx) => {
                  const done = stepsDone.includes(idx)
                  const isTimer = idx === passoEspera
                  const isLast = idx === ritualSteps.length - 1
                  return (
                    <div key={idx} className="relative flex gap-3 py-2.5">
                      {!isLast && <div className="absolute left-[15px] top-11 h-[calc(100%-22px)] w-px bg-paper-200" />}
                      <button
                        type="button"
                        onClick={() => iniciado && toggleStep(idx)}
                        disabled={!iniciado}
                        aria-label={done ? tr('etp_desmarcar', 'Desmarcar passo') : tr('etp_marcar', 'Marcar passo')}
                        className={cn(
                          'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-[1.5px] text-xs font-semibold transition',
                          done ? 'border-ink bg-ink text-white' : 'border-paper-200 bg-surface text-text-tertiary',
                          iniciado && !done && 'hover:border-ink',
                          !iniciado && 'cursor-default',
                        )}
                      >
                        {done ? <i className="fa-solid fa-check text-[11px]" aria-hidden="true" /> : idx + 1}
                      </button>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className={cn("font-['Nunito_Sans'] text-sm font-semibold", done ? 'text-text-tertiary line-through' : 'text-text')}>
                          {step.titulo}
                        </p>
                        <p className="mt-0.5 font-['Nunito_Sans'] text-xs leading-5 text-text-secondary">{step.texto}</p>

                        {iniciado && isTimer && !done && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={() => setTimerAberto(true)}
                              className="inline-flex h-9 items-center gap-2 rounded-full border border-paper-200 bg-surface px-4 font-['Nunito_Sans'] text-xs font-semibold text-text transition hover:bg-surface-subtle"
                            >
                              <i className="fa-regular fa-clock" aria-hidden="true" />
                              {tr('etp_usar_timer', 'Usar timer')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Sensações — aparecem quando todos os passos estão feitos */}
              {iniciado && todosFeitos && (
                <div className="flex flex-col gap-4 border-t border-paper-200 pt-5">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="font-['Montserrat'] text-base font-semibold text-text">{tr('etp_como_ficaram', 'Como ficaram seus fios?')}</h3>
                    <p className="font-['Nunito_Sans'] text-xs text-text-secondary">{tr('etp_opcional', 'Opcional. Marque o que você percebeu.')}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SENSACOES.map(s => {
                      const selected = sensacoes.includes(s.id)
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSensacao(s.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border-[1.5px] py-1 pl-1 pr-3.5 font-nunito text-sm font-semibold transition-all',
                            selected ? 'border-ink bg-ink text-white' : 'border-transparent bg-surface-subtle text-text hover:bg-surface-muted',
                          )}
                        >
                          <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', selected ? 'bg-white' : 'bg-surface')}>
                            <i className={cn('fa-solid text-[11px]', s.icon, selected ? 'text-ink' : 'text-text-tertiary')} aria-hidden="true" />
                          </span>
                          <span>{idioma === 'en' ? s.labelEn : s.labelPt}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ── Modal reagendar ── */}
      {reagendarAberto && (
        <ReagendarModal tr={tr} onClose={() => setReagendarAberto(false)} onReagendar={reagendar} />
      )}

      {/* ── Confirmar pular ── */}
      {confirmarPular && (
        <ConfirmarPularModal
          tr={tr}
          onClose={() => setConfirmarPular(false)}
          onConfirmar={() => { setConfirmarPular(false); pular() }}
        />
      )}

      {/* ── Modo em foco: timer ── */}
      {timerAberto && (
        <TimerFoco
          tr={tr}
          tipoCuidado={etapa.tipoCuidado}
          timerSeg={timerSeg}
          timerPct={timerPct}
          timerRodando={timerRodando}
          timerConcluido={timerConcluido}
          tempoEscolhido={tempoEscolhido}
          accent={theme.hex}
          setTempoEscolhido={setTempoEscolhido}
          setTimerRodando={setTimerRodando}
          iniciarTimer={iniciarTimer}
          onFinish={finalizarTimer}
        />
      )}

      {/* ── Sucesso ── */}
      {resultado && (
        <SuccessOverlay
          tr={tr}
          etapa={etapa}
          resultado={resultado}
          onHome={() => navigate('/app/home')}
          onRoutine={() => navigate('/app/cronograma')}
        />
      )}
    </AppShell>
  )
}

// ─── Modo em foco: timer full-screen ────────────────────────────────────────

function TimerFoco({
  tr, tipoCuidado, timerSeg, timerPct, timerRodando, timerConcluido,
  tempoEscolhido, accent, setTempoEscolhido, setTimerRodando, iniciarTimer, onFinish,
}) {
  const R = 98
  const C = 2 * Math.PI * R
  return (
    <div className="fixed inset-0 z-[1000] bg-[#111110] text-white">
      <div className="mx-auto flex min-h-screen max-w-[520px] flex-col px-6 pb-8 pt-12">
        {/* topo */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-3 font-['Nunito_Sans'] text-xs font-semibold text-white/60 transition hover:bg-white/15"
          >
            <i className="fa-solid fa-chevron-left text-[10px]" aria-hidden="true" />
            {tr('etp_voltar', 'Voltar')}
          </button>
          <span className="font-['Nunito_Sans'] text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {tipoCuidado}
          </span>
        </div>

        {/* centro */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="relative h-[230px] w-[230px]">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 220 220" fill="none">
              <circle cx="110" cy="110" r={R} stroke="rgba(255,255,255,.08)" strokeWidth="7" />
              <circle
                cx="110" cy="110" r={R}
                stroke={timerConcluido ? 'rgba(255,255,255,.92)' : accent}
                strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${C}`}
                strokeDashoffset={`${C * (1 - timerPct / 100)}`}
                transform="rotate(-90 110 110)"
                style={{ transition: 'stroke-dashoffset .9s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-['Nunito_Sans'] text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {timerConcluido ? tr('etp_timer_fim', 'concluído') : timerRodando ? tr('etp_timer_aguardando', 'aguardando') : tr('etp_timer_pronta', 'pronta?')}
              </span>
              <strong className="font-['Montserrat'] text-[58px] font-semibold leading-none tracking-tight text-white">
                {formatTimer(timerSeg)}
              </strong>
            </div>
          </div>

          {/* slider — só antes de iniciar */}
          {!timerRodando && !timerConcluido && (
            <div className="w-full max-w-[320px]">
              <div className="mb-2 flex justify-between font-['Nunito_Sans'] text-[11px] text-white/40">
                <span>3 min</span>
                <span>30 min</span>
              </div>
              <input
                className="w-full accent-white"
                type="range" min={3} max={30} step={1}
                value={tempoEscolhido}
                onChange={e => setTempoEscolhido(Number(e.target.value))}
              />
              <div className="mt-2 text-center font-['Nunito_Sans'] text-sm text-white/60">
                {tempoEscolhido} {tr('etp_min', 'minutos')}
              </div>
            </div>
          )}

          {timerConcluido && (
            <div className="max-w-[320px] rounded-[20px] border border-white/10 bg-white/[0.06] p-5 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-white/10">
                <i className="fa-solid fa-check text-xl text-white" aria-hidden="true" />
              </div>
              <div className="font-['Montserrat'] text-base font-semibold text-white">{tr('etp_pausa_ok', 'Pausa concluída')}</div>
              <div className="mt-1 font-['Nunito_Sans'] text-sm text-white/50">{tr('etp_pausa_ok_sub', 'Hora de continuar o ritual.')}</div>
            </div>
          )}

          {/* botões */}
          <div className="flex w-full max-w-[320px] flex-col gap-2">
            {timerConcluido ? (
              <button
                type="button"
                onClick={onFinish}
                className="h-14 rounded-full bg-white font-['Nunito_Sans'] text-[15px] font-bold text-[#111110]"
              >
                {tr('etp_voltar_ritual', 'Voltar ao ritual')}
              </button>
            ) : timerRodando ? (
              <button
                type="button"
                onClick={() => setTimerRodando(false)}
                className="h-14 rounded-full bg-white font-['Nunito_Sans'] text-[15px] font-bold text-[#111110]"
              >
                {tr('etp_pausar', 'Pausar')}
              </button>
            ) : (
              <button
                type="button"
                onClick={iniciarTimer}
                className="h-14 rounded-full bg-white font-['Nunito_Sans'] text-[15px] font-bold text-[#111110]"
              >
                {tr('etp_iniciar', 'Iniciar')} {tempoEscolhido} min
              </button>
            )}

            <button
              type="button"
              onClick={onFinish}
              className="h-12 rounded-full border border-white/10 font-['Nunito_Sans'] text-[13px] font-semibold text-white/50 transition hover:text-white/70"
            >
              {tr('etp_sem_timer', 'Voltar sem usar timer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Modal reagendar ────────────────────────────────────────────────────────

function ReagendarModal({ tr, onClose, onReagendar }) {
  const opcoes = [
    { id: 'amanha', label: tr('etp_amanha', 'Amanhã') },
    { id: 'dois', label: tr('etp_dois_dias', 'Em 2 dias') },
  ]
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-t-[24px] bg-surface p-6 shadow-[0_-12px_60px_rgba(0,0,0,.18)] sm:rounded-[24px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-paper-300 sm:hidden" />
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="font-['Montserrat'] text-base font-semibold text-text">{tr('etp_reagendar_titulo', 'Para quando fica melhor?')}</h2>
          <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{tr('etp_reagendar_sub', 'Você não está atrasada, só ajustando o ritmo.')}</p>
        </div>
        <div className="mb-5 flex flex-col gap-3">
          {opcoes.map(o => (
            <button
              key={o.id}
              type="button"
              onClick={() => onReagendar(o.id)}
              className="flex items-center justify-between rounded-[8px] border border-paper-200 bg-surface p-3 text-left font-['Nunito_Sans'] text-sm font-medium text-text transition hover:bg-surface-subtle"
            >
              {o.label}
              <i className="fa-solid fa-chevron-right text-xs text-text-tertiary" aria-hidden="true" />
            </button>
          ))}
        </div>
        <Button variant="outline" className="w-full" onClick={onClose}>{tr('etp_voltar', 'Voltar')}</Button>
      </div>
    </div>
  )
}

// ─── Modal confirmar pular ──────────────────────────────────────────────────

function ConfirmarPularModal({ tr, onClose, onConfirmar }) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-t-[24px] bg-surface p-6 shadow-[0_-12px_60px_rgba(0,0,0,.18)] sm:rounded-[24px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-paper-300 sm:hidden" />
        <div className="mb-5 flex flex-col gap-1">
          <h2 className="font-['Montserrat'] text-base font-semibold text-text">{tr('etp_pular_titulo', 'Pular esse cuidado?')}</h2>
          <p className="font-['Nunito_Sans'] text-sm text-text-secondary">{tr('etp_pular_sub', 'Ele não será registrado hoje. Você pode reagendar se preferir ajustar o ritmo.')}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={onConfirmar}>{tr('etp_pular_confirmar', 'Sim, pular cuidado')}</Button>
          <Button variant="outline" className="w-full" onClick={onClose}>{tr('etp_voltar', 'Voltar')}</Button>
        </div>
      </div>
    </div>
  )
}

function SuccessOverlay({ tr, etapa, resultado, onHome, onRoutine }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-end bg-black/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-6">
      <div className="w-full max-w-[440px] rounded-t-[28px] bg-surface p-6 shadow-[0_-12px_60px_rgba(0,0,0,.18)] sm:rounded-[28px]">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-paper-300 sm:hidden" />

        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-ink text-white">
            <i className="fa-solid fa-check text-2xl" aria-hidden="true" />
          </div>
          <h2 className="font-['Montserrat'] text-xl font-semibold text-text">{tr('etp_concluido_titulo', 'Ritual concluído')}</h2>
          <p className="mt-1 font-['Nunito_Sans'] text-sm text-text-secondary">{labelTipo(etapa.tipoCuidado, tr)}</p>
        </div>

        {resultado && (
          <div className="mb-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl border-[1.5px] border-paper-200 p-3.5 text-center">
              <span className="mb-1 block font-['Nunito_Sans'] text-[10px] font-bold uppercase tracking-wider text-text-secondary">Hair Score</span>
              <strong className="font-['Montserrat'] text-[26px] font-semibold tracking-tight text-text">{resultado.scoreAtual}</strong>
            </div>
            <div className="rounded-2xl border-[1.5px] border-paper-200 p-3.5 text-center">
              <span className="mb-1 block font-['Nunito_Sans'] text-[10px] font-bold uppercase tracking-wider text-text-secondary">{tr('etp_variacao', 'Variação')}</span>
              <strong className={cn("font-['Montserrat'] text-[26px] font-semibold tracking-tight", resultado.scoreDelta >= 0 ? 'text-state-positive' : 'text-state-negative')}>
                {formatSigned(resultado.scoreDelta)}
              </strong>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={onHome}>{tr('etp_voltar_inicio', 'Voltar para o início')}</Button>
          <Button variant="outline" className="w-full" onClick={onRoutine}>{tr('etp_ver_rotina', 'Ver minha rotina')}</Button>
        </div>
      </div>
    </div>
  )
}

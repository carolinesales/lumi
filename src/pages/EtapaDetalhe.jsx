import { useEffect, useMemo, useRef, useState } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useIdioma } from '../contexts/IdiomaContext'
import { XP_ACOES, CONQUISTAS, verificarConquistas } from '../lib/gamificacao'
import { aplicarDeltaHairScore, calcularDeltaRitual } from '@/features/hairScore/services/hairScore'


import AppShell from '@/components/lumi/AppShell'
import PageContainer from '@/components/lumi/PageContainer'

const TIPO_ICON = {
  Hidratação: 'fa-droplet',
  Nutrição: 'fa-leaf',
  Reconstrução: 'fa-shield-heart',
  Detox: 'fa-sparkles',
  Umectação: 'fa-bottle-droplet',
  Lavagem: 'fa-pump-soap',
}

const TIPO_THEME = {
  Hidratação: {
    label: 'hidratação',
    accent: '#7DA9AD',
    soft: '#E7F1F2',
    text: '#31575A',
    hero: 'radial-gradient(circle at 82% 8%, rgba(125,169,173,.30), transparent 34%), linear-gradient(145deg, #272522, #181714)',
  },
  Nutrição: {
    label: 'nutrição',
    accent: '#9B8757',
    soft: '#EEE6D0',
    text: '#695733',
    hero: 'radial-gradient(circle at 82% 8%, rgba(155,135,87,.34), transparent 34%), linear-gradient(145deg, #272522, #181714)',
  },
  Reconstrução: {
    label: 'reconstrução',
    accent: '#A77A66',
    soft: '#EEDDD5',
    text: '#744D3D',
    hero: 'radial-gradient(circle at 82% 8%, rgba(167,122,102,.34), transparent 34%), linear-gradient(145deg, #272522, #181714)',
  },
  Detox: {
    label: 'detox',
    accent: '#6F8A5B',
    soft: '#E4EEDC',
    text: '#4E6540',
    hero: 'radial-gradient(circle at 82% 8%, rgba(111,138,91,.34), transparent 34%), linear-gradient(145deg, #272522, #181714)',
  },
  Umectação: {
    label: 'umectação',
    accent: '#A77E44',
    soft: '#EEDFC7',
    text: '#704F25',
    hero: 'radial-gradient(circle at 82% 8%, rgba(167,126,68,.34), transparent 34%), linear-gradient(145deg, #272522, #181714)',
  },
  Lavagem: {
    label: 'lavagem',
    accent: '#728895',
    soft: '#E3EAEE',
    text: '#465B66',
    hero: 'radial-gradient(circle at 82% 8%, rgba(114,136,149,.34), transparent 34%), linear-gradient(145deg, #272522, #181714)',
  },
}

const TIPO_DICA = {
  Hidratação: 'Máscaras hidratantes costumam agir melhor entre 5 e 15 minutos. Respeite o tempo indicado no produto.',
  Nutrição: 'Nutrição ajuda a reduzir aspereza e frizz. Use pouca quantidade para não pesar os fios.',
  Reconstrução: 'Reconstrução pede equilíbrio. Proteína em excesso pode deixar os fios rígidos.',
  Detox: 'Massageie o couro cabeludo com movimentos leves. A ideia é limpar sem agredir.',
  Umectação: 'Na umectação, comece pelas pontas. Se pesar, reduza a quantidade na próxima vez.',
  Lavagem: 'Enxágue bem. Resíduos podem aumentar a sensação de ressecamento.',
}

const TIPO_DESC = {
  pt: {
    Hidratação: {
      curta: 'Repõe água, maciez e brilho nos fios.',
      longa: 'A hidratação repõe água e ajuda a recuperar maciez, brilho e maleabilidade dos fios.',
      beneficio: 'ideal para fios opacos, ásperos ou com sensação de ressecamento.',
    },
    Nutrição: {
      curta: 'Reduz frizz, aspereza e perda de brilho.',
      longa: 'A nutrição repõe lipídios, ajuda a controlar frizz e cria uma barreira protetora no fio.',
      beneficio: 'ideal para fios com frizz, toque áspero ou pontas ressecadas.',
    },
    Reconstrução: {
      curta: 'Fortalece fios fragilizados ou sensibilizados.',
      longa: 'A reconstrução restaura força e estrutura, especialmente após química, quebra ou perda de massa.',
      beneficio: 'ideal para fios frágeis, elásticos, quebradiços ou pós-química.',
    },
    Detox: {
      curta: 'Remove resíduos e alivia o couro cabeludo.',
      longa: 'O detox capilar limpa resíduos acumulados e ajuda o couro cabeludo a respirar melhor.',
      beneficio: 'ideal para sensação de raiz pesada, acúmulo de produto ou oleosidade.',
    },
    Umectação: {
      curta: 'Cuidado nutritivo com óleos para toque mais macio.',
      longa: 'A umectação sela nutrientes e melhora o toque dos fios ressecados.',
      beneficio: 'ideal para pontas secas, frizz e fios sem maleabilidade.',
    },
    Lavagem: {
      curta: 'Limpeza suave para preparar os fios para a rotina.',
      longa: 'A lavagem correta remove impurezas sem agredir a fibra capilar.',
      beneficio: 'ideal para manter couro cabeludo limpo e fios leves.',
    },
  },
  en: {
    Hidratação: { curta: 'Restores water, softness and shine.', longa: 'Hydration restores water and improves softness, shine and manageability.', beneficio: 'ideal for dull or dry-feeling hair.' },
    Nutrição: { curta: 'Reduces frizz, roughness and dullness.', longa: 'Nutrition replenishes lipids and helps control frizz.', beneficio: 'ideal for frizz and rough ends.' },
    Reconstrução: { curta: 'Strengthens fragile or sensitized strands.', longa: 'Reconstruction restores strength and structure after damage.', beneficio: 'ideal for fragile or chemically treated hair.' },
    Detox: { curta: 'Removes buildup and soothes the scalp.', longa: 'Scalp detox removes buildup and helps the scalp breathe.', beneficio: 'ideal for buildup or oily roots.' },
    Umectação: { curta: 'Nourishing oil-based care for softer strands.', longa: 'Umectation seals nutrients and improves dry hair texture.', beneficio: 'ideal for dry ends and frizz.' },
    Lavagem: { curta: 'Gentle cleanse to prepare strands for the routine.', longa: 'Proper cleansing removes impurities without harming strands.', beneficio: 'ideal for a clean and light scalp.' },
  },
}

const RITUAL_STEPS = {
  Hidratação: [
    { titulo: 'Preparar', texto: 'Lave os fios com suavidade para receber melhor a máscara.', dica: 'Uma lavagem suave ajuda a máscara a agir melhor.' },
    { titulo: 'Retirar excesso de água', texto: 'Pressione com a toalha, sem esfregar.', dica: 'O fio úmido absorve melhor do que o fio pingando.' },
    { titulo: 'Aplicar', texto: 'Distribua a máscara pelo comprimento e pontas.', dica: 'Evite excesso na raiz para não pesar.' },
    { titulo: 'Pausar', texto: 'Deixe o produto agir pelo tempo indicado.', dica: 'Use o timer se quiser acompanhar o tempo.' },
    { titulo: 'Finalizar', texto: 'Enxágue e finalize observando toque, brilho e leveza.', dica: 'Finalize com calma e perceba como os fios respondem.' },
  ],
  Nutrição: [
    { titulo: 'Preparar', texto: 'Separe os fios em mechas para facilitar a aplicação.', dica: 'Mechas ajudam a distribuir o cuidado melhor.' },
    { titulo: 'Aplicar', texto: 'Aplique no comprimento, priorizando áreas ásperas.', dica: 'Evite a raiz para não pesar.' },
    { titulo: 'Massagear', texto: 'Espalhe com suavidade, sem friccionar demais.', dica: 'O movimento ajuda o produto a envolver os fios.' },
    { titulo: 'Pausar', texto: 'Aguarde o tempo indicado pelo produto.', dica: 'Use o timer se quiser evitar passar do tempo.' },
    { titulo: 'Finalizar', texto: 'Enxágue e finalize evitando calor excessivo.', dica: 'Calor em excesso pode reduzir a sensação de tratamento.' },
  ],
  Reconstrução: [
    { titulo: 'Preparar', texto: 'Comece com os fios limpos.', dica: 'Fios limpos recebem melhor o tratamento.' },
    { titulo: 'Aplicar', texto: 'Aplique apenas no comprimento e pontas.', dica: 'A raiz não precisa de reconstrução.' },
    { titulo: 'Distribuir', texto: 'Espalhe sem exagerar na quantidade.', dica: 'Excesso de proteína pode deixar os fios rígidos.' },
    { titulo: 'Pausar', texto: 'Respeite o tempo indicado na embalagem.', dica: 'Reconstrução pede precisão: nem menos, nem mais.' },
    { titulo: 'Finalizar', texto: 'Enxágue e observe se os fios ficaram mais firmes.', dica: 'Se ficarem rígidos, priorize hidratação depois.' },
  ],
  Detox: [
    { titulo: 'Preparar', texto: 'Molhe bem o couro cabeludo.', dica: 'Água morna ajuda a preparar a limpeza.' },
    { titulo: 'Aplicar', texto: 'Aplique o produto na raiz.', dica: 'O foco é o couro cabeludo, não o comprimento.' },
    { titulo: 'Massagear', texto: 'Massageie com as pontas dos dedos.', dica: 'Evite usar as unhas para não irritar.' },
    { titulo: 'Pausar', texto: 'Aguarde o produto agir, se ele pedir pausa.', dica: 'Use o timer se quiser controlar a pausa.' },
    { titulo: 'Finalizar', texto: 'Enxágue completamente e finalize com leveza.', dica: 'Um cuidado suave nas pontas pode ajudar.' },
  ],
  Umectação: [
    { titulo: 'Aplicar', texto: 'Aplique óleo no comprimento e pontas.', dica: 'Comece pelas áreas mais ressecadas.' },
    { titulo: 'Distribuir', texto: 'Espalhe com cuidado para não pesar.', dica: 'Use pouca quantidade e reaplique se precisar.' },
    { titulo: 'Pausar', texto: 'Deixe agir pelo tempo que fizer sentido para você.', dica: 'Use o timer se quiser controlar o tempo.' },
    { titulo: 'Remover', texto: 'Remova com uma lavagem suave.', dica: 'Não precisa esfregar: remova aos poucos.' },
    { titulo: 'Observar', texto: 'Perceba o toque final dos fios.', dica: 'Se pesar, reduza o óleo na próxima vez.' },
  ],
  Lavagem: [
    { titulo: 'Molhar', texto: 'Molhe bem os fios antes do shampoo.', dica: 'A água prepara os fios para uma limpeza mais suave.' },
    { titulo: 'Aplicar', texto: 'Aplique shampoo apenas na raiz.', dica: 'O comprimento não precisa de muito produto.' },
    { titulo: 'Massagear', texto: 'Massageie com as polpas dos dedos.', dica: 'Evite usar as unhas para não irritar.' },
    { titulo: 'Enxaguar', texto: 'Enxágue completamente.', dica: 'Resíduos podem causar ressecamento.' },
    { titulo: 'Finalizar', texto: 'Use condicionador ou máscara leve se necessário.', dica: 'Finalize de acordo com a necessidade do dia.' },
  ],
}

const PASSO_ESPERA = {
  Hidratação: 3,
  Nutrição: 3,
  Reconstrução: 3,
  Detox: 3,
  Umectação: 2,
  Lavagem: null,
}

const SENSACOES = [
  { id: 'macio', label: 'Mais macio', icon: 'fa-feather' },
  { id: 'leve', label: 'Mais leve', icon: 'fa-wind' },
  { id: 'brilho', label: 'Com mais brilho', icon: 'fa-sparkles' },
  { id: 'frizz', label: 'Menos frizz', icon: 'fa-grip-lines' },
  { id: 'ressecado', label: 'Ainda ressecado', icon: 'fa-droplet-slash' },
  { id: 'semDiferenca', label: 'Sem diferença', icon: 'fa-minus' },
]

const OBS_RAPIDAS = [
  { id: 'useiCalor', label: 'Usei calor hoje' },
  { id: 'muitoFrizz', label: 'Senti muito frizz' },
  { id: 'fiosPesados', label: 'Fios pesados' },
  { id: 'toqueMelhor', label: 'Toque melhor' },
]

function dataHoje() {
  return new Date().toISOString().split('T')[0]
}

function formatSigned(v) {
  const n = Number(v ?? 0)
  return n > 0 ? `+${n}` : `${n}`
}

function formatTimer(s) {
  const min = Math.floor(s / 60)
  const sec = s % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function getSuccessMsg(sensacoes) {
  if (sensacoes.includes('macio') || sensacoes.includes('brilho') || sensacoes.includes('leve')) {
    return 'O Lumi registrou uma resposta positiva dos seus fios após o cuidado.'
  }

  if (sensacoes.includes('ressecado') || sensacoes.includes('semDiferenca')) {
    return 'Registro salvo. O Lumi vai considerar essa resposta nos próximos cuidados.'
  }

  return 'Seu cuidado foi salvo e entrou no acompanhamento da sua rotina capilar.'
}

export default function EtapaDetalhe() {
  const { cronogramaId, etapaId } = useParams()
  const { user } = useAuth()
  const { idioma } = useIdioma()
  const navigate = useNavigate()

  const [etapa, setEtapa] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)

  const [modo, setModo] = useState('leitura')
  const [stepsDone, setStepsDone] = useState([])

  const [tempoEscolhido, setTempoEscolhido] = useState(10)
  const [timerSeg, setTimerSeg] = useState(10 * 60)
  const [timerRodando, setTimerRodando] = useState(false)
  const [timerConcluido, setTimerConcluido] = useState(false)
  const timerRef = useRef(null)

  const [sensacoes, setSensacoes] = useState([])
  const [observacoes, setObservacoes] = useState([])
  const [nota, setNota] = useState('')
  const [notaAberta, setNotaAberta] = useState(false)
  const [verMais, setVerMais] = useState(false)
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
      setUserData(usuario)
      setStepsDone(data.passosConcluidos ?? [])
      setSensacoes(data.sensacoes ?? [])
      setObservacoes(data.observacoesRapidas ?? [])
      setNota(data.nota ?? '')
      setNotaAberta(!!data.nota)

      const tempoSalvo = usuario?.[`timerPausa_${data.tipoCuidado}`]
      if (tempoSalvo) {
        setTempoEscolhido(tempoSalvo)
        setTimerSeg(tempoSalvo * 60)
      }

      if (data.concluida) return
      if (['leitura', 'guiado', 'timer', 'checkin'].includes(data._modo)) setModo(data._modo)
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
    if (!timerRodando && !timerConcluido) {
      setTimerSeg(tempoEscolhido * 60)
    }
  }, [tempoEscolhido, timerRodando, timerConcluido])

  const descLang = TIPO_DESC[idioma] ?? TIPO_DESC.pt
  const desc = etapa ? descLang[etapa.tipoCuidado] ?? { curta: '', longa: '', beneficio: '' } : { curta: '', longa: '', beneficio: '' }
  const ritualSteps = useMemo(() => (etapa ? RITUAL_STEPS[etapa.tipoCuidado] ?? RITUAL_STEPS.Hidratação : []), [etapa])
  const passoEspera = etapa ? PASSO_ESPERA[etapa.tipoCuidado] ?? null : null
  const theme = etapa ? TIPO_THEME[etapa.tipoCuidado] ?? TIPO_THEME.Hidratação : TIPO_THEME.Hidratação
  const dica = etapa ? TIPO_DICA[etapa.tipoCuidado] ?? '' : ''

  const totalSteps = ritualSteps.length
  const progress = totalSteps > 0 ? Math.round((stepsDone.length / totalSteps) * 100) : 0
  const timerPct = Math.min(100, Math.round(((tempoEscolhido * 60 - timerSeg) / (tempoEscolhido * 60)) * 100))
  const hairScore = userData?.hairScoreAtual ?? userData?.hairScore ?? userData?.hair_score ?? null

  function persistModo(nextModo) {
    setModo(nextModo)

    if (!user || !etapa) return

    updateDoc(
      doc(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas', etapaId),
      { _modo: nextModo }
    )
  }

  function toggleStep(index) {
    setStepsDone(prev => (
      prev.includes(index)
        ? prev.filter(item => item !== index)
        : [...prev, index]
    ))
  }

  function toggleLista(setter, lista, id) {
    setter(lista.includes(id) ? lista.filter(item => item !== id) : [...lista, id])
  }

  function iniciarTimer() {
    if (user && etapa) {
      updateDoc(doc(db, 'usuarios', user.uid), {
        [`timerPausa_${etapa.tipoCuidado}`]: tempoEscolhido,
      })
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

    persistModo('guiado')
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
        concluida: true,
        pulada: false,
        nota,
        passosConcluidos: stepsDone,
        sensacoes,
        observacoesRapidas: observacoes,
        concluidaEm: new Date(),
        _modo: null,
      })

      const userSnap = await getDoc(userRef)
      const ud = userSnap.data() ?? {}
      const etapasConcluidas = (ud.etapasConcluidas ?? 0) + 1
      const xpGanho = XP_ACOES.ritual_concluido ?? 20
      const novoXp = (ud.xp ?? 0) + xpGanho

      const scoreRes = await aplicarDeltaHairScore({
        uid,
        delta: calcularDeltaRitual(etapa.tipoCuidado),
        origem: 'ritual_concluido',
        dataId: `${hoje}_${etapaId}`,
        extra: {
          cronogramaId,
          etapaId,
          tipoCuidado: etapa.tipoCuidado,
          xpGanho,
          passosConcluidos: stepsDone,
          sensacoes,
          observacoesRapidas: observacoes,
          nota,
        },
      })

      await updateDoc(userRef, {
        xp: novoXp,
        etapasConcluidas,
        ultimoRitualConcluidoEm: new Date(),
      })

      const cSnap = await getDoc(doc(db, 'usuarios', uid, 'conquistas', 'desbloqueadas'))
      const desbloqueadas = cSnap.exists() ? cSnap.data().ids ?? [] : []
      const novasIds = verificarConquistas({
        desbloqueadas,
        streak: ud.streak ?? 0,
        etapasConcluidas,
        hairScore: scoreRes.scoreAtual,
        totalDiagnosticos: ud.totalDiagnosticos ?? 1,
        xp: novoXp,
        cuidado7Dias: ud.cuidado7Dias ?? 0,
      })

      const conquistasNovas = novasIds.map(id => CONQUISTAS.find(c => c.id === id)).filter(Boolean)

      if (conquistasNovas.length > 0) {
        const xpBonus = conquistasNovas.reduce((acc, c) => acc + (c.xp ?? 0), 0)

        await setDoc(
          doc(db, 'usuarios', uid, 'conquistas', 'desbloqueadas'),
          {
            ids: [...desbloqueadas, ...novasIds],
            atualizadoEm: new Date(),
          },
          { merge: true }
        )

        if (xpBonus > 0) await updateDoc(userRef, { xp: novoXp + xpBonus })
      }

      setResultado({
        xpGanho,
        scoreAtual: scoreRes.scoreAtual,
        scoreDelta: scoreRes.delta,
        conquistasNovas,
      })

      setModo('sucesso')
    } finally {
      setLoading(false)
    }
  }

  async function pular() {
    if (!user || !etapa) return

    await updateDoc(
      doc(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas', etapaId),
      {
        pulada: true,
        puladaEm: new Date(),
        _modo: null,
      }
    )

    navigate('/app/cronograma')
  }

  if (!etapa) {
    return (
      <AppShell>
        <PageContainer>
          <div className="grid min-h-[70vh] place-items-center text-[#9A958E]">
            <i className="fa-solid fa-spinner fa-spin text-2xl" />
          </div>
        </PageContainer>
      </AppShell>
    )
  }

  if (modo === 'timer') {
    return (
      <TimerScreen
        etapa={etapa}
        theme={theme}
        dica={dica}
        timerSeg={timerSeg}
        timerPct={timerPct}
        timerRodando={timerRodando}
        timerConcluido={timerConcluido}
        tempoEscolhido={tempoEscolhido}
        setTempoEscolhido={setTempoEscolhido}
        setTimerRodando={setTimerRodando}
        iniciarTimer={iniciarTimer}
        onBack={() => persistModo('guiado')}
        onFinish={finalizarTimer}
      />
    )
  }

  return (
    <AppShell onPrimaryAction={() => navigate('/app/home')}>
      <PageContainer>
        <div className="mx-auto max-w-[1180px] pb-24">
          {modo === 'leitura' && (
            <ReadingMode
              etapa={etapa}
              theme={theme}
              desc={desc}
              ritualSteps={ritualSteps}
              passoEspera={passoEspera}
              hairScore={hairScore}
              tempoEscolhido={tempoEscolhido}
              onBack={() => navigate('/app/home')}
              onSkip={pular}
              onStart={() => persistModo('guiado')}
              onFinish={() => persistModo('checkin')}
            />
          )}

          {modo === 'guiado' && (
            <GuidedMode
              etapa={etapa}
              theme={theme}
              desc={desc}
              dica={dica}
              ritualSteps={ritualSteps}
              passoEspera={passoEspera}
              stepsDone={stepsDone}
              progress={progress}
              tempoEscolhido={tempoEscolhido}
              onBack={() => persistModo('leitura')}
              onSkip={pular}
              onTimer={() => persistModo('timer')}
              onCheckin={() => persistModo('checkin')}
              onToggleStep={toggleStep}
              verMais={verMais}
              setVerMais={setVerMais}
            />
          )}

          {modo === 'checkin' && (
            <CheckinMode
              etapa={etapa}
              theme={theme}
              sensacoes={sensacoes}
              observacoes={observacoes}
              nota={nota}
              notaAberta={notaAberta}
              loading={loading}
              setSensacoes={setSensacoes}
              setObservacoes={setObservacoes}
              setNota={setNota}
              setNotaAberta={setNotaAberta}
              toggleLista={toggleLista}
              onBack={() => persistModo('guiado')}
              onSave={concluir}
              onSkip={() => {
                setSensacoes([])
                setObservacoes([])
                setNota('')
                concluir()
              }}
            />
          )}
        </div>
      </PageContainer>

      {modo === 'sucesso' && (
        <SuccessOverlay
          etapa={etapa}
          resultado={resultado}
          sensacoes={sensacoes}
          onHome={() => navigate('/app/home')}
          onRoutine={() => navigate('/app/cronograma')}
        />
      )}
    </AppShell>
  )
}

function ReadingMode({
  etapa,
  theme,
  desc,
  ritualSteps,
  passoEspera,
  hairScore,
  tempoEscolhido,
  onBack,
  onSkip,
  onStart,
  onFinish,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <RitualSideNav
        etapa={etapa}
        theme={theme}
        ritualSteps={ritualSteps}
        activeIndex={0}
        stepsDone={[]}
        mode="leitura"
      />

      <main className="flex flex-col gap-5">
        <section
          className="overflow-hidden rounded-[34px] bg-[#181714] p-5 text-white shadow-[0_24px_70px_rgba(24,23,20,.16)] sm:p-7"
          style={{ background: theme.hero }}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/14"
              aria-label="Voltar"
            >
              <i className="fa-solid fa-chevron-left text-xs" />
            </button>

            <span className="text-[10px] font-black uppercase tracking-[.22em] text-white/42">
              modo leitura
            </span>

            <button
              type="button"
              onClick={onSkip}
              className="text-[12px] font-bold text-white/38 transition hover:text-white/70"
            >
              Pular
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-black text-white/58">
                <span className="size-1.5 rounded-full" style={{ background: theme.accent }} />
                Cuidado de {theme.label}
              </div>

              <h1 className="font-['Montserrat'] text-[48px] font-medium leading-none tracking-[-0.078em] text-white sm:text-[64px]">
                {etapa.tipoCuidado}
              </h1>

              <p className="mt-4 max-w-xl text-[15px] leading-8 text-white/62">
                {desc.curta} Este ritual foi pensado para ser simples: leia, faça no seu ritmo e volte para registrar quando quiser.
              </p>

              <div className="mt-7 grid max-w-md grid-cols-2 gap-2">
                {hairScore && <InfoBox value={hairScore} label="Hair Score atual" />}
                <InfoBox value={`${tempoEscolhido} min`} label="Pausa sugerida" />
              </div>
            </div>

            <div
              className="relative min-h-[240px] overflow-hidden rounded-[28px] border border-white/10 bg-white/8"
              style={{ background: `linear-gradient(135deg, rgba(255,255,255,.16), rgba(255,255,255,.05)), radial-gradient(circle at 50% 42%, ${theme.accent}66, transparent 32%)` }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.22),transparent_18%),radial-gradient(circle_at_54%_38%,rgba(255,255,255,.18),transparent_12%)]" />
              <div className="absolute bottom-4 left-4 rounded-full bg-[#181714]/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-white/70">
                Lumi ritual
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
          <article className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_18px_54px_rgba(24,23,20,.045)] backdrop-blur-xl">
            <span className="mb-1 block text-[9px] font-black uppercase tracking-[.18em] text-[#9A958E]">
              Antes de começar
            </span>
            <h2 className="font-['Montserrat'] text-[26px] font-medium tracking-[-0.06em] text-[#181714]">
              Seu momento de cuidado
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-[#77736C]">
              Este ritual serve como guia. Você pode seguir todos os passos, usar apenas o timer ou só voltar depois para concluir.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <QuietInfo icon="fa-book-open" title="Leia" text="Entenda o cuidado." />
              <QuietInfo icon="fa-clock" title="Use o timer" text="Só se precisar." />
              <QuietInfo icon="fa-check" title="Conclua" text="Quando terminar." />
            </div>
          </article>

          <article className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_18px_54px_rgba(24,23,20,.045)] backdrop-blur-xl">
            <span className="mb-1 block text-[9px] font-black uppercase tracking-[.18em] text-[#9A958E]">
              Benefício
            </span>
            <h3 className="font-['Montserrat'] text-[22px] font-medium tracking-[-0.055em] text-[#181714]">
              Para que serve?
            </h3>
            <p className="mt-3 text-[13px] leading-6 text-[#77736C]">
              {desc.beneficio}
            </p>
          </article>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_18px_54px_rgba(24,23,20,.045)] backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="mb-1 block text-[9px] font-black uppercase tracking-[.18em] text-[#9A958E]">
                roteiro
              </span>
              <h2 className="font-['Montserrat'] text-[24px] font-medium tracking-[-0.06em] text-[#181714]">
                O que você vai fazer
              </h2>
            </div>
          </div>

          <div className="flex flex-col">
            {ritualSteps.map((step, idx) => (
              <ReadOnlyStep
                key={step.titulo}
                index={idx}
                step={step}
                isTimer={idx === passoEspera}
                isLast={idx === ritualSteps.length - 1}
                theme={theme}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onStart}
              className="h-12 rounded-full bg-[#181714] text-[14px] font-black text-white"
            >
              Fazer com Lumi
            </button>

            <button
              type="button"
              onClick={onFinish}
              className="h-12 rounded-full border border-[#D8D4CC] bg-white/70 text-[13px] font-black text-[#181714]"
            >
              Já fiz, quero registrar
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function GuidedMode({
  etapa,
  theme,
  desc,
  dica,
  ritualSteps,
  passoEspera,
  stepsDone,
  progress,
  tempoEscolhido,
  onBack,
  onSkip,
  onTimer,
  onCheckin,
  onToggleStep,
  verMais,
  setVerMais,
}) {
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <RitualSideNav
          etapa={etapa}
          theme={theme}
          ritualSteps={ritualSteps}
          activeIndex={getActiveIndex(stepsDone, ritualSteps.length)}
          stepsDone={stepsDone}
          mode="guiado"
        />

        <main className="flex flex-col gap-5">
          <section className="rounded-[28px] bg-[#181714] px-5 py-4 text-white shadow-[0_18px_54px_rgba(24,23,20,.12)]">
            <div className="mb-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onBack}
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white"
                aria-label="Voltar"
              >
                <i className="fa-solid fa-chevron-left text-xs" />
              </button>

              <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-[.18em] text-white/38">
                  Modo guiado
                </div>
                <div className="mt-1 text-[12px] font-bold text-white/58">
                  marque o que fizer sentido
                </div>
              </div>

              <button
                type="button"
                onClick={onSkip}
                className="text-[12px] font-bold text-white/38"
              >
                Pular
              </button>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_18px_54px_rgba(24,23,20,.045)] backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <span className="mb-1 block text-[9px] font-black uppercase tracking-[.18em] text-[#9A958E]">
                  acompanhamento
                </span>
                <h2 className="font-['Montserrat'] text-[24px] font-medium tracking-[-0.06em] text-[#181714]">
                  Sua jornada
                </h2>
                <p className="mt-2 text-[12px] leading-5 text-[#77736C]">
                  Toque no círculo quando concluir um passo. Se preferir, apenas leia e conclua no final.
                </p>
              </div>

              <div className="rounded-full bg-[#F2F0EC] px-3 py-1.5 text-[11px] font-black text-[#6F675E]">
                {progress}%
              </div>
            </div>

            <div className="flex flex-col">
              {ritualSteps.map((step, idx) => {
                const done = stepsDone.includes(idx)
                const isTimer = idx === passoEspera

                return (
                  <InteractiveStep
                    key={step.titulo}
                    index={idx}
                    step={step}
                    done={done}
                    isTimer={isTimer}
                    isLast={idx === ritualSteps.length - 1}
                    theme={theme}
                    onToggle={() => onToggleStep(idx)}
                    onTimer={onTimer}
                  />
                )
              })}
            </div>
          </section>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E8E2DA] bg-[#F7F6F3]/92 px-4 py-3 backdrop-blur-xl xl:hidden">
        <button
          type="button"
          onClick={onCheckin}
          className="h-12 w-full rounded-full bg-[#181714] text-[14px] font-black text-white"
        >
          Concluir ritual
        </button>
      </div>

      <aside className="fixed bottom-6 right-6 z-20 hidden w-[320px] flex-col gap-3 xl:flex">
        <section className="rounded-[26px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_54px_rgba(24,23,20,.08)] backdrop-blur-xl">
          <h3 className="font-['Montserrat'] text-[18px] font-medium tracking-[-0.055em] text-[#181714]">
            Terminou?
          </h3>
          <p className="mt-1 text-[12px] leading-5 text-[#77736C]">
            A avaliação é opcional e ajuda o Lumi a entender a resposta dos seus fios.
          </p>
          <button
            type="button"
            onClick={onCheckin}
            className="mt-4 h-11 w-full rounded-full bg-[#181714] text-[13px] font-black text-white"
          >
            Concluir ritual
          </button>
        </section>

        <section className="rounded-[26px] border border-white/70 bg-white/90 p-4 shadow-[0_18px_54px_rgba(24,23,20,.08)] backdrop-blur-xl">
          <h3 className="font-['Montserrat'] text-[18px] font-medium tracking-[-0.055em] text-[#181714]">
            Sobre esse cuidado
          </h3>

          <p className="mt-2 text-[12px] leading-5 text-[#77736C]">
            {verMais ? desc.longa : desc.curta}
          </p>

          {dica && (
            <div
              className="mt-3 rounded-[16px] p-3 text-[11px] leading-5"
              style={{ background: theme.soft, color: theme.text }}
            >
              <i className="fa-regular fa-lightbulb mr-2" />
              {dica}
            </div>
          )}

          <button
            type="button"
            onClick={() => setVerMais(v => !v)}
            className="mt-3 text-[12px] font-black underline"
          >
            {verMais ? 'Ver menos' : 'Ver mais'}
          </button>
        </section>
      </aside>
    </>
  )
}

function CheckinMode({
  etapa,
  theme,
  sensacoes,
  observacoes,
  nota,
  notaAberta,
  loading,
  setSensacoes,
  setObservacoes,
  setNota,
  setNotaAberta,
  toggleLista,
  onBack,
  onSave,
  onSkip,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
      <section
        className="overflow-hidden rounded-[34px] bg-[#181714] p-6 text-white shadow-[0_24px_70px_rgba(24,23,20,.16)] sm:p-8"
        style={{ background: theme.hero }}
      >
        <div className="mb-7 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid size-10 place-items-center rounded-full bg-white/10 text-white"
            aria-label="Voltar"
          >
            <i className="fa-solid fa-chevron-left text-xs" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[.18em] text-white/38">
            {etapa.tipoCuidado} · avaliação opcional
          </span>
        </div>

        <h1 className="font-['Montserrat'] text-[42px] font-medium leading-none tracking-[-0.075em] text-white sm:text-[56px]">
          Como ficaram seus fios?
        </h1>
        <p className="mt-4 max-w-xl text-[14px] leading-7 text-white/58">
          Escolha uma ou mais opções, se quiser. Não precisa saber termos técnicos — marque apenas o que você percebeu.
        </p>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_18px_54px_rgba(24,23,20,.045)] backdrop-blur-xl">
          <h3 className="font-['Montserrat'] text-[20px] font-medium tracking-[-0.055em] text-[#181714]">
            Sensação dos fios
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {SENSACOES.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleLista(setSensacoes, sensacoes, s.id)}
                className={[
                  'min-h-10 rounded-full px-3 text-[12px] font-black transition',
                  sensacoes.includes(s.id)
                    ? 'bg-[#181714] text-white'
                    : 'bg-[#F2F0EC] text-[#4F4A44]',
                ].join(' ')}
              >
                <i className={`fa-solid ${s.icon} mr-1.5`} />
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/86 p-5 shadow-[0_18px_54px_rgba(24,23,20,.045)] backdrop-blur-xl">
          <h3 className="font-['Montserrat'] text-[20px] font-medium tracking-[-0.055em] text-[#181714]">
            Quer lembrar de algo?
          </h3>

          <p className="mt-1 text-[12px] leading-5 text-[#77736C]">
            Opcional. Ex.: ficou pesado, senti mais brilho, usei secador.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {OBS_RAPIDAS.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleLista(setObservacoes, observacoes, o.id)}
                className={[
                  'min-h-10 rounded-full px-3 text-[12px] font-black transition',
                  observacoes.includes(o.id)
                    ? 'bg-[#181714] text-white'
                    : 'bg-[#F2F0EC] text-[#4F4A44]',
                ].join(' ')}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {notaAberta ? (
              <textarea
                className="min-h-[92px] w-full resize-none rounded-[18px] border border-[#D8D4CC] bg-white/70 p-3 text-[13px] leading-6 text-[#181714] outline-none"
                value={nota}
                onChange={e => setNota(e.target.value)}
                placeholder="Algo que queira lembrar sobre esse ritual..."
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => setNotaAberta(true)}
                className="flex h-12 w-full items-center gap-2 rounded-[16px] border border-dashed border-[#C8C4BC] bg-white/50 px-4 text-[13px] font-bold text-[#9A958E]"
              >
                <i className="fa-solid fa-pen text-xs" />
                Adicionar observação
              </button>
            )}
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="h-12 rounded-full bg-[#181714] text-[14px] font-black text-white disabled:opacity-40"
          >
            {loading ? 'Salvando...' : 'Salvar avaliação'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="h-12 rounded-full border border-[#D8D4CC] bg-white/70 text-[13px] font-black text-[#181714] disabled:opacity-40"
          >
            Pular avaliação
          </button>
        </section>
      </aside>
    </div>
  )
}

function TimerScreen({
  etapa,
  theme,
  dica,
  timerSeg,
  timerPct,
  timerRodando,
  timerConcluido,
  tempoEscolhido,
  setTempoEscolhido,
  setTimerRodando,
  iniciarTimer,
  onBack,
  onFinish,
}) {
  return (
    <div className="min-h-screen bg-[#111110] text-white">
      <div className="mx-auto flex min-h-screen max-w-[520px] flex-col px-6 pb-8 pt-12">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-white/8 px-3 text-[12px] font-bold text-white/38"
          >
            <i className="fa-solid fa-chevron-left text-[10px]" />
            Voltar
          </button>

          <span className="text-[10px] font-black uppercase tracking-[.18em] text-white/28">
            {etapa.tipoCuidado}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-7">
          <div className="relative size-[230px]">
            <svg className="absolute inset-0 size-full" viewBox="0 0 220 220" fill="none">
              <circle cx="110" cy="110" r="98" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
              <circle
                cx="110"
                cy="110"
                r="98"
                stroke={timerConcluido ? 'rgba(255,255,255,.92)' : theme.accent}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 98}`}
                strokeDashoffset={`${2 * Math.PI * 98 * (1 - timerPct / 100)}`}
                transform="rotate(-90 110 110)"
                style={{ transition: 'stroke-dashoffset .9s ease' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-[.18em] text-white/28">
                {timerConcluido ? 'concluído' : timerRodando ? 'aguardando' : 'pronta?'}
              </span>
              <strong className="font-['Montserrat'] text-[62px] font-medium leading-none tracking-[-0.07em] text-white">
                {formatTimer(timerSeg)}
              </strong>
            </div>
          </div>

          {!timerRodando && !timerConcluido && (
            <div className="w-full max-w-[320px]">
              <div className="mb-2 flex justify-between text-[11px] text-white/28">
                <span>5 min</span>
                <span>30 min</span>
              </div>
              <input
                className="w-full accent-white"
                type="range"
                min={5}
                max={30}
                step={1}
                value={tempoEscolhido}
                onChange={e => setTempoEscolhido(Number(e.target.value))}
              />
              <div className="mt-2 text-center text-[12px] text-white/38">
                {tempoEscolhido} minutos
              </div>
            </div>
          )}

          {!timerConcluido ? (
            <div className="flex max-w-[340px] gap-3 rounded-[18px] border border-white/10 bg-white/5 p-4 text-[12px] leading-6 text-white/42">
              <i className="fa-regular fa-lightbulb mt-1 text-white/32" />
              <span>{dica}</span>
            </div>
          ) : (
            <div className="max-w-[340px] rounded-[20px] border border-white/10 bg-white/6 p-5 text-center">
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-white/10">
                <i className="fa-solid fa-check text-xl text-white" />
              </div>
              <div className="text-[15px] font-black text-white">
                Pausa concluída
              </div>
              <div className="mt-1 text-[12px] text-white/42">
                Hora de continuar o ritual.
              </div>
            </div>
          )}

          <div className="flex w-full max-w-[340px] flex-col gap-2">
            {timerConcluido ? (
              <button
                type="button"
                onClick={onFinish}
                className="h-14 rounded-full bg-white text-[15px] font-black text-[#111110]"
              >
                Voltar ao ritual
              </button>
            ) : timerRodando ? (
              <button
                type="button"
                onClick={() => setTimerRodando(false)}
                className="h-14 rounded-full bg-white text-[15px] font-black text-[#111110]"
              >
                Pausar
              </button>
            ) : (
              <button
                type="button"
                onClick={iniciarTimer}
                className="h-14 rounded-full bg-white text-[15px] font-black text-[#111110]"
              >
                Iniciar {tempoEscolhido} min
              </button>
            )}

            <button
              type="button"
              onClick={onFinish}
              className="h-12 rounded-full border border-white/10 text-[13px] font-black text-white/38"
            >
              Voltar sem usar timer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RitualSideNav({ etapa, theme, ritualSteps, activeIndex, stepsDone, mode }) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-6 rounded-[30px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_54px_rgba(24,23,20,.045)] backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3">
          <div
            className="grid size-10 place-items-center rounded-full"
            style={{ background: theme.soft, color: theme.text }}
          >
            <i className={`fa-solid ${TIPO_ICON[etapa.tipoCuidado] ?? 'fa-droplet'} text-sm`} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[.16em] text-[#9A958E]">
              Hair Wellness Ritual
            </div>
            <div className="mt-0.5 text-[13px] font-black text-[#181714]">
              {mode === 'leitura' ? 'Leitura tranquila' : 'Modo guiado'}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {ritualSteps.map((step, index) => {
            const done = stepsDone.includes(index)
            const active = index === activeIndex

            return (
              <div
                key={step.titulo}
                className={[
                  'flex items-center gap-3 rounded-[16px] px-3 py-2 text-[12px] font-black transition',
                  active ? 'bg-[#181714] text-white' : done ? 'text-[#6F675E]' : 'text-[#9A958E]',
                ].join(' ')}
              >
                <span
                  className={[
                    'grid size-6 place-items-center rounded-full text-[9px]',
                    active ? 'bg-white/14 text-white' : done ? 'bg-[#181714] text-white' : 'bg-[#F2F0EC] text-[#9A958E]',
                  ].join(' ')}
                >
                  {done ? <i className="fa-solid fa-check" /> : index + 1}
                </span>
                <span>{step.titulo}</span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

function ReadOnlyStep({ index, step, isTimer, isLast, theme }) {
  return (
    <div className="relative flex gap-3 py-3">
      {!isLast && <div className="absolute left-[12px] top-10 h-[calc(100%-20px)] w-px bg-[#E4DED6]" />}

      <div
        className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[10px] font-black"
        style={{
          background: isTimer ? theme.soft : '#fff',
          borderColor: isTimer ? theme.accent : '#D8D4CC',
          color: isTimer ? theme.text : '#8A847D',
        }}
      >
        {isTimer ? <i className="fa-regular fa-clock text-[10px]" /> : index + 1}
      </div>

      <div>
        <div className="text-[14px] font-black leading-5 text-[#181714]">
          {step.titulo}
        </div>
        <div className="mt-1 text-[12px] leading-5 text-[#8A847D]">
          {step.texto}
        </div>
      </div>
    </div>
  )
}

function InteractiveStep({ index, step, done, isTimer, isLast, theme, onToggle, onTimer }) {
  return (
    <div className="relative flex gap-3 py-3">
      {!isLast && <div className="absolute left-[12px] top-10 h-[calc(100%-20px)] w-px bg-[#E4DED6]" />}

      <button
        type="button"
        onClick={onToggle}
        className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border text-[10px] font-black transition hover:scale-105"
        style={{
          background: done ? '#181714' : isTimer ? theme.soft : '#fff',
          borderColor: done ? '#181714' : isTimer ? theme.accent : '#D8D4CC',
          color: done ? '#fff' : isTimer ? theme.text : '#8A847D',
        }}
        aria-label={done ? 'Desmarcar passo' : 'Marcar passo como feito'}
      >
        {done ? <i className="fa-solid fa-check text-[10px]" /> : isTimer ? <i className="fa-regular fa-clock text-[10px]" /> : index + 1}
      </button>

      <div className="min-w-0 flex-1">
        <div className={['text-[14px] leading-5', done ? 'font-medium text-[#B8B4AC] line-through' : 'font-black text-[#181714]'].join(' ')}>
          {step.titulo}
        </div>
        <div className="mt-1 text-[12px] leading-5 text-[#8A847D]">
          {step.texto}
        </div>

        {isTimer && !done && (
          <button
            type="button"
            onClick={onTimer}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-full border border-[#D8D4CC] bg-white/70 px-4 text-[12px] font-black text-[#181714]"
          >
            <i className="fa-regular fa-clock" />
            Iniciar timer
          </button>
        )}
      </div>
    </div>
  )
}

function QuietInfo({ icon, title, text }) {
  return (
    <div className="rounded-[18px] bg-[#F8F6F2] p-3">
      <div className="mb-2 grid size-8 place-items-center rounded-full bg-white text-[#181714]">
        <i className={`fa-solid ${icon} text-xs`} />
      </div>
      <div className="text-[12px] font-black text-[#181714]">
        {title}
      </div>
      <div className="mt-0.5 text-[11px] leading-4 text-[#8A847D]">
        {text}
      </div>
    </div>
  )
}

function SuccessOverlay({ etapa, resultado, sensacoes, onHome, onRoutine }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-end bg-[#11100E]/60 p-0 backdrop-blur-md sm:place-items-center sm:p-6">
      <div className="w-full max-w-[480px] rounded-t-[30px] border border-white/70 bg-white p-6 shadow-[0_28px_90px_rgba(24,23,20,.22)] sm:rounded-[30px]">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#D8D4CC] sm:hidden" />

        <div className="mb-4 text-[10px] font-black uppercase tracking-[.18em] text-[#9A958E]">
          Ritual concluído · {etapa.tipoCuidado}
        </div>

        <div className="mb-5 flex items-center gap-4">
          <div className="grid size-13 shrink-0 place-items-center rounded-full bg-[#181714] text-white">
            <i className="fa-solid fa-check text-xl" />
          </div>

          <div>
            <h2 className="font-['Montserrat'] text-[26px] font-medium leading-none tracking-[-0.06em] text-[#181714]">
              Muito bem!
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-[#6F6A63]">
              {getSuccessMsg(sensacoes)}
            </p>
          </div>
        </div>

        {resultado && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-[18px] border border-[#E4E0D8] bg-[#F2F0EC] p-4 text-center">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-[.12em] text-[#9A958E]">
                Hair Score
              </span>
              <strong className="font-['Montserrat'] text-[28px] font-medium tracking-[-0.05em] text-[#181714]">
                {resultado.scoreAtual}
              </strong>
            </div>

            <div className="rounded-[18px] border border-[#E4E0D8] bg-[#F2F0EC] p-4 text-center">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-[.12em] text-[#9A958E]">
                Variação
              </span>
              <strong
                className={[
                  "font-['Montserrat'] text-[28px] font-medium tracking-[-0.05em]",
                  resultado.scoreDelta >= 0 ? 'text-[#2E6A45]' : 'text-[#9B3F3F]',
                ].join(' ')}
              >
                {formatSigned(resultado.scoreDelta)}
              </strong>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onHome}
            className="h-12 rounded-full bg-[#181714] text-[14px] font-black text-white"
          >
            Voltar para início
          </button>
          <button
            type="button"
            onClick={onRoutine}
            className="h-12 rounded-full border border-[#D8D4CC] bg-white/70 text-[13px] font-black text-[#181714]"
          >
            Ver minha rotina
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ value, label }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/8 p-4">
      <div className="font-['Montserrat'] text-[24px] font-medium leading-none tracking-[-0.055em] text-white">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold text-white/34">
        {label}
      </div>
    </div>
  )
}

function getActiveIndex(stepsDone, total) {
  for (let i = 0; i < total; i += 1) {
    if (!stepsDone.includes(i)) return i
  }

  return total - 1
}

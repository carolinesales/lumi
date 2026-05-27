import { useEffect, useMemo, useState } from 'react'
import { useNavigate }                   from 'react-router-dom'
import {
  collection, query, orderBy, limit, doc, onSnapshot,
} from 'firebase/firestore'

import { db }        from '../lib/firebase'
import { useAuth }   from '../contexts/AuthContext'
import { useIdioma } from '../contexts/IdiomaContext'

import RegistroModal from './RegistroModal'
import AppShell      from '@/components/lumi/AppShell'

import {
  HairScoreCard,
  HairTimeline,
  useHairScoreViewModel,
  useHairTimeline,
} from '@/features/hairScore'

import TodayHeader      from '@/features/home/components/TodayHeader'
import WeekCalendar     from '@/features/home/components/WeekCalendar'
import MonthCalendar    from '@/features/home/components/MonthCalendar'
import QuickCheckinCard from '@/features/home/components/QuickCheckinCard'
import InsightCard      from '@/features/home/components/InsightCard'

import {
  AdaptiveRoutineCard,
  useAdaptiveRoutine,
} from '@/features/routineEngine'

import { ConquistasCard } from '@/features/gamification'

import {
  calcularStreakReal,
  calcularCuidado7Dias,
} from '@/features/gamification/utils/gamificationUtils'

const ESTADOS_BR = {
  Acre: 'AC', Alagoas: 'AL', Amapá: 'AP', Amazonas: 'AM', Bahia: 'BA',
  Ceará: 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', Goiás: 'GO',
  Maranhão: 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', Pará: 'PA', Paraíba: 'PB', Paraná: 'PR',
  Pernambuco: 'PE', Piauí: 'PI', 'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', Rondônia: 'RO',
  Roraima: 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
  Sergipe: 'SE', Tocantins: 'TO',
}

function siglaEstado(state = '') {
  if (!state) return ''
  if (state.length === 2) return state.toUpperCase()
  return ESTADOS_BR[state] ?? state
}

function dataHoje() { return new Date().toISOString().split('T')[0] }

function etapaParaData(e) {
  if (!e?.dataEtapa) return null
  return e.dataEtapa?.toDate?.() ?? new Date(e.dataEtapa)
}

function mesmaData(a, b) {
  return (
    a.getDate()     === b.getDate()  &&
    a.getMonth()    === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  )
}

function gerarRangeDias(diasLabel, diasAntes = 7, diasDepois = 11) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Array.from({ length: diasAntes + 1 + diasDepois }, (_, i) => {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() - diasAntes + i)
    const dow      = d.getDay()
    const labelIdx = dow === 0 ? 6 : dow - 1
    return { wd: diasLabel[labelIdx], n: d.getDate(), date: d, isHoje: mesmaData(d, hoje) }
  })
}

export default function Home() {
  const { user }     = useAuth()
  const { t }        = useIdioma()
  const navigate     = useNavigate()

  const [perfil,           setPerfil]           = useState(null)
  const [etapas,           setEtapas]           = useState([])
  const [hairScore,        setHairScore]        = useState(null)
  const [regHoje,          setRegHoje]          = useState(null)
  const [showReg,          setShowReg]          = useState(false)
  const [clima,            setClima]            = useState(null)
  const [conquistas,       setConquistas]       = useState([])
  const [streakReal,       setStreakReal]       = useState(0)
  const [cuidado7DiasReal, setCuidado7DiasReal] = useState(0)

  const diasTraduzidos = t('cron_dias') || ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const DIAS_LABEL = [
    diasTraduzidos[1], diasTraduzidos[2], diasTraduzidos[3],
    diasTraduzidos[4], diasTraduzidos[5], diasTraduzidos[6], diasTraduzidos[0],
  ]
  const semana = useMemo(() => gerarRangeDias(DIAS_LABEL, 7, 11), [diasTraduzidos])

  const hairScoreVM = useHairScoreViewModel({ perfil, hairScore })
  const { scores: timelineScores } = useHairTimeline(user?.uid, 8)
  const adaptiveRoutine = useAdaptiveRoutine({
    hairState:   hairScoreVM.state,
    hairScore:   hairScoreVM.score,
    eventos:     perfil?.eventosRecentes ?? [],
    fragilidade: hairScoreVM.fragilidade,
    clima,
  })

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    let unsubEtapas = null

    const u1 = onSnapshot(doc(db, 'usuarios', uid), s =>
      setPerfil(s.exists() ? s.data() : null)
    )
    const u2 = onSnapshot(
      query(collection(db, 'usuarios', uid, 'hair_scores'), orderBy('dataRegistro', 'desc'), limit(1)),
      s => setHairScore(s.empty ? null : s.docs[0].data()),
    )
    const u3 = onSnapshot(
      doc(db, 'usuarios', uid, 'registros', dataHoje()),
      s => setRegHoje(s.exists() ? s.data() : null),
    )
    const u4 = onSnapshot(
      query(collection(db, 'usuarios', uid, 'cronogramas'), orderBy('dataInicio', 'desc'), limit(1)),
      s => {
        if (unsubEtapas) unsubEtapas()
        if (s.empty) { setEtapas([]); return }
        const cronId = s.docs[0].id
        unsubEtapas = onSnapshot(
          collection(db, 'usuarios', uid, 'cronogramas', cronId, 'etapas'),
          snap => setEtapas(
            snap.docs
              .map(d => ({ id: d.id, cronogramaId: cronId, ...d.data() }))
              .sort((a, b) => (etapaParaData(a) ?? new Date(0)) - (etapaParaData(b) ?? new Date(0))),
          ),
        )
      },
    )
    const u5 = onSnapshot(
      doc(db, 'usuarios', uid, 'conquistas', 'desbloqueadas'),
      s => setConquistas(s.exists() ? s.data().ids ?? [] : []),
    )

    return () => { u1(); u2(); u3(); u4(); u5(); unsubEtapas?.() }
  }, [user])

  useEffect(() => {
    if (!user) return
    calcularStreakReal(user.uid).then(setStreakReal)
    calcularCuidado7Dias(user.uid).then(setCuidado7DiasReal)
  }, [user, regHoje])

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (!apiKey || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const [wRes, gRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`),
          fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`),
        ])
        const [weather, geo] = await Promise.all([wRes.json(), gRes.json()])
        const cidade = weather.name || geo[0]?.name || ''
        const estado = siglaEstado(geo[0]?.state ?? '')
        setClima({
          cidade:      estado ? `${cidade}, ${estado}` : cidade,
          temperatura: Math.round(weather.main?.temp      ?? 0),
          umidade:     weather.main?.humidity              ?? 0,
          sensacao:    Math.round(weather.main?.feels_like ?? 0),
        })
      } catch { setClima(null) }
    }, () => {})
  }, [])

  const etapaAtual = etapas.find(e => !e.concluida && !e.pulada)
  const streak     = perfil?.streak ?? 0
  const nome       = perfil?.nome || user?.displayName || 'Caroline'
  const foto       = user?.photoURL || perfil?.fotoURL || perfil?.avatar || ''

  const proximasEtapas = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
    return etapas
      .filter(e => !e.concluida && !e.pulada && (etapaParaData(e) ?? new Date(0)) >= hoje)
      .slice(0, 8)
  }, [etapas])

  function getEtapaDia(dia) {
    return etapas.find(e => { const d = etapaParaData(e); return d && mesmaData(d, dia.date) })
  }

  function abrirEtapa(etapa) {
    if (!etapa) return
    navigate(`/app/etapa/${etapa.cronogramaId}/${etapa.id}`)
  }

  function iniciarAcaoAdaptativa(action) {
    const match = etapas.find(e =>
      !e.concluida && !e.pulada &&
      (e.tipoCuidado === action.tipo || e.tipoCuidado === action.title)
    )
    if (match)      { abrirEtapa(match);      return }
    if (etapaAtual) { abrirEtapa(etapaAtual); return }
    navigate('/questionario')
  }

  function climaTexto() {
    if (!clima) return 'Ative a localização para receber insights do clima.'
    if (clima.umidade <= 45)     return `Umidade baixa em ${clima.cidade}. Capriche na hidratação hoje.`
    if (clima.umidade >= 75)     return `Alta umidade hoje. Use um óleo ou creme mais consistente para reduzir o frizz.`
    if (clima.temperatura >= 28) return `Calor em ${clima.cidade}. Use proteção térmica antes de sair.`
    return `Clima equilibrado em ${clima.cidade}. Ótimo dia para manter sua rotina.`
  }

  const hairScoreCard = (
    <HairScoreCard
      score={hairScoreVM.score}
      delta={hairScoreVM.delta}
      state={hairScoreVM.state}
      trend={hairScoreVM.trend}
      message={hairScoreVM.message || 'Seu diagnóstico está sendo acompanhado pelo Lumi.'}
      fragilidade={hairScoreVM.fragilidade}
      streak={streak}
    />
  )

  const routineCard = (
    <AdaptiveRoutineCard routine={adaptiveRoutine} onStartAction={iniciarAcaoAdaptativa} />
  )

  const trendCard    = <HairTimeline scores={timelineScores} />
  const climaCard    = <InsightCard clima={clima} text={climaTexto()} />

  const conquistasCard = (
    <ConquistasCard
      desbloqueadas={conquistas}
      progressData={{
        streak:            streakReal,
        etapasConcluidas:  perfil?.etapasConcluidas  ?? 0,
        hairScore:         hairScoreVM.score          ?? 0,
        totalDiagnosticos: perfil?.totalDiagnosticos  ?? 0,
        xp:                perfil?.xp                 ?? 0,
        cuidado7Dias:      cuidado7DiasReal,
      }}
    />
  )

  const diaryCard = (
    <QuickCheckinCard regHoje={regHoje} onOpen={() => setShowReg(true)} />
  )

  return (
    <AppShell onPrimaryAction={() => setShowReg(true)}>
      <main className="mx-auto flex min-h-dvh w-full max-w-[1120px] flex-col gap-6 bg-[#F5F4F5] px-4 pb-32 pt-4 lg:rounded-[32px] lg:p-6 lg:pb-6">

        {/* Header mobile */}
        <div className="lg:hidden">
          <TodayHeader nome={nome} foto={foto} onProfile={() => navigate('/app/perfil')} />
        </div>

        {/* ── Desktop ── */}
        <div className="hidden flex-col gap-6 lg:flex">
          {hairScoreCard}

          <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

            {/* Coluna principal */}
            <div className="flex flex-col gap-6">
          
              <WeekCalendar
                semana={semana}
                getEtapaDia={getEtapaDia}
                onOpenEtapa={abrirEtapa}
              />
              {routineCard}
              {trendCard}
              {conquistasCard}
              {diaryCard}
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-5">
              <div className="rounded-[20px] bg-white p-5">
                <MonthCalendar
                  etapas={etapas}
                  proximasEtapas={proximasEtapas}
                  onOpenEtapa={abrirEtapa}
                />
              </div>
              {climaCard}
            </aside>
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="flex flex-col gap-6 lg:hidden">
          {hairScoreCard}
          <WeekCalendar
            semana={semana}
            getEtapaDia={getEtapaDia}
            onOpenEtapa={abrirEtapa}
          />
          {routineCard}
          {climaCard}
          {trendCard}
          {conquistasCard}
          {diaryCard}
        </div>
      </main>

      {showReg && (
        <RegistroModal
          onClose={() => setShowReg(false)}
          onSaved={() => setShowReg(false)}
          onConcluido={() => setShowReg(false)}
        />
      )}
    </AppShell>
  )
}
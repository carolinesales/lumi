import { useEffect, useMemo, useState } from 'react'
import { useNavigate }           from 'react-router-dom'
import {
  collection, doc, getDocs, limit,
  onSnapshot, orderBy, query,
} from 'firebase/firestore'

import { db }          from '@/lib/firebase'
import { useAuth }     from '@/contexts/AuthContext'
import { useIdioma }   from '@/contexts/IdiomaContext'
import { CONQUISTAS }  from '@/lib/gamificacao'
import AppShell        from '@/components/lumi/AppShell'
import { cn }          from '@/lib/utils'

// ─── Helpers de data ──────────────────────────────────────────────────────────

function diasAtras(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

const DIAS_90 = diasAtras(90)
const DIAS_30 = diasAtras(30)
const DIAS_7  = diasAtras(7)

const FILTROS_CONSISTENCIA = [
  { label: '7d',  dias: diasAtras(7),  total: 7  },
  { label: '30d', dias: diasAtras(30), total: 30 },
  { label: '90d', dias: diasAtras(90), total: 90 },
]

function dataHoje() { return new Date().toISOString().split('T')[0] }

function localeDate(iso, idioma, opts) {
  return new Date(iso + 'T12:00:00')
    .toLocaleDateString(idioma === 'en' ? 'en-US' : 'pt-BR', opts)
}

// ─── Constantes visuais ───────────────────────────────────────────────────────

const HUMOR_COR = {
  otimo:   '#22c55e',
  bom:     '#86efac',
  neutro:  '#C0BEB8',
  ruim:    '#fca5a5',
  pessimo: '#dc3232',
}
const HUMOR_ICON = {
  otimo: 'fa-face-grin-stars', bom: 'fa-face-smile',
  neutro: 'fa-face-meh', ruim: 'fa-face-frown', pessimo: 'fa-face-tired',
}
const TIPO_SOFT = {
  Hidratação:   { soft: '#EEF4FF', ink: '#3A5FA0', icon: 'fa-droplet'  },
  Nutrição:     { soft: '#EEF5E8', ink: '#4A6E3A', icon: 'fa-leaf'     },
  Reconstrução: { soft: '#F5F0FF', ink: '#6A4E98', icon: 'fa-wrench'   },
  Detox:        { soft: '#E8F6F4', ink: '#3A7068', icon: 'fa-star'     },
  Umectação:    { soft: '#FBF0F5', ink: '#904868', icon: 'fa-droplet'  },
  Lavagem:      { soft: '#F0F2F8', ink: '#4A5070', icon: 'fa-soap'     },
}

function scoreCor(v) {
  if (v >= 80) return '#C8A96A'
  if (v >= 60) return '#8BAD7A'
  if (v >= 40) return '#B8A9D9'
  if (v  > 0)  return '#C8DCFF'
  return '#C0BEB8'
}

// ─── Componentes locais ───────────────────────────────────────────────────────

function SectionCard({ children, className }) {
  return (
    <div className={cn('rounded-[22px] border border-[#EBEBEB] bg-white p-5', className)}>
      {children}
    </div>
  )
}

function Eyebrow({ children }) {
  return (
    <span className="mb-4 block font-nunito text-[9px] font-bold uppercase tracking-[.18em] text-[#8A8880]">
      {children}
    </span>
  )
}

function ScoreBar({ value, max = 100, color }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[#EBEBEB]">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(value / max) * 100}%`, background: color }}
      />
    </div>
  )
}

// ─── Gauge semicircular ───────────────────────────────────────────────────────

const GAUGE_ARC_LEN = 213

function gaugePoint(score) {
  const rad = ((-90 + (score / 100) * 180) * Math.PI) / 180
  return {
    px: 90 + 68 * Math.cos(rad),
    py: 90 + 68 * Math.sin(rad),
  }
}

function ScoreGauge({ score, cor }) {
  const { px, py } = gaugePoint(score)
  const dash = `${(score / 100) * GAUGE_ARC_LEN} ${GAUGE_ARC_LEN}`
  return (
    <svg viewBox="0 0 180 100" className="w-[160px] overflow-visible" aria-label={`Hair Score: ${score}`}>
      <path d="M 22 90 A 68 68 0 0 1 158 90"
        fill="none" stroke="#EBEBEB" strokeWidth="10" strokeLinecap="round" />
      <path d="M 22 90 A 68 68 0 0 1 158 90"
        fill="none" stroke={cor} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={dash} />
      {score > 0 && <circle cx={px} cy={py} r="5" fill={cor} />}
      <text x="90" y="78" textAnchor="middle"
        fontFamily="Montserrat, sans-serif" fontSize="34" fontWeight="300" fill="#171614">
        {score}
      </text>
      <text x="90" y="93" textAnchor="middle"
        fontFamily="Nunito Sans, sans-serif" fontSize="10" fill="#8A8880">
        /100
      </text>
    </svg>
  )
}

// ─── Seções ───────────────────────────────────────────────────────────────────

function SecaoHairScore({ scores, tendencia, streak, xp, idioma }) {
  const scoreAtual = scores[0]?.pontuacao ?? 0
  const cor        = scoreCor(scoreAtual)

  return (
    <SectionCard>
      <Eyebrow>Hair Score</Eyebrow>

      <div className="flex items-center gap-5">
        {/* Gauge */}
        <div className="shrink-0">
          <ScoreGauge score={scoreAtual} cor={cor} />
        </div>

        {/* Info */}
        <div className="flex-1">
          <p className="mb-1.5 font-heading text-[15px] font-medium tracking-tight text-[#171614]">
            {scores[0]?.classificacao ?? '—'}
          </p>

          {tendencia !== null && (
            <div className="mb-2 flex items-center gap-1.5">
              <i className={cn(
                'fa-solid text-xs',
                tendencia >= 0 ? 'fa-arrow-trend-up text-green-500' : 'fa-arrow-trend-down text-[#dc3232]',
              )} aria-hidden="true" />
              <span className={cn('text-xs font-semibold', tendencia >= 0 ? 'text-green-500' : 'text-[#dc3232]')}>
                {tendencia >= 0 ? '+' : ''}{tendencia} pts
              </span>
              <span className="text-[11px] text-[#8A8880]">vs anterior</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {streak > 0 && (
              <span className="rounded-full bg-[#FBF4E6] px-2.5 py-1 font-nunito text-[10px] font-bold text-[#C8A96A]">
                🔥 {streak} dias
              </span>
            )}
            <span className="rounded-full bg-[#F5F3EE] px-2.5 py-1 font-nunito text-[10px] font-bold text-[#8A8880]">
              {xp} XP
            </span>
          </div>
        </div>
      </div>

      {/* Histórico */}
      {scores.length > 1 && (
        <div className="mt-4 border-t border-[#F5F3EE] pt-3.5">
          <p className="mb-2.5 font-nunito text-[10px] font-bold uppercase tracking-[.12em] text-[#C0BEB8]">
            Histórico
          </p>
          <div className="flex flex-col gap-1.5">
            {scores.slice(0, 5).map((s, i) => {
              const data = s.dataRegistro?.toDate?.() ?? new Date()
              const cor  = scoreCor(s.pontuacao)
              return (
                <div key={s.id} className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2',
                  i === 0 ? 'bg-[#F7F5F1]' : '',
                )}>
                  <span className="font-nunito text-xs text-[#8A8880]">
                    {data.toLocaleDateString(idioma === 'en' ? 'en-US' : 'pt-BR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-[60px]">
                      <ScoreBar value={s.pontuacao} color={cor} />
                    </div>
                    <span className="w-7 text-right font-nunito text-xs font-bold text-[#171614]">
                      {s.pontuacao}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function SecaoConsistencia({ registros, streak }) {
  const [filtro, setFiltro] = useState(FILTROS_CONSISTENCIA[1])

  const diasFiltro      = filtro.dias
  const diasRegistrados = diasFiltro.filter(d => registros[d])
  const pct             = Math.round((diasRegistrados.length / filtro.total) * 100)

  // Grade: máx 30 células para não quebrar layout
  const diasGrade = filtro.total <= 30 ? diasFiltro : diasAtras(30)
  const cols      = filtro.total <= 30 ? 15 : 15

  return (
    <SectionCard>
      {/* Header + filtro */}
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <Eyebrow>Consistência</Eyebrow>
        <div className="flex items-center gap-3">
          <div className="flex gap-1" role="group" aria-label="Filtrar período">
            {FILTROS_CONSISTENCIA.map(f => (
              <button
                key={f.label}
                type="button"
                onClick={() => setFiltro(f)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 font-nunito text-[10px] font-semibold transition-colors',
                  filtro.label === f.label
                    ? 'bg-[#171614] text-white'
                    : 'bg-[#F0EDE8] text-[#8A8880] hover:bg-[#E8E4DE]',
                )}
                aria-pressed={filtro.label === f.label}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="font-nunito text-sm font-bold text-[#171614]">{pct}%</span>
        </div>
      </div>

      {/* Grade estilo GitHub */}
      <div className={cn('mb-3.5 grid gap-1', `grid-cols-[repeat(${cols},1fr)]`)}>
        {diasGrade.map(dia => {
          const isHoje = dia === dataHoje()
          const temReg = diasRegistrados.includes(dia)
          return (
            <div
              key={dia}
              title={dia}
              className={cn(
                'aspect-square rounded-[3px] transition',
                temReg ? 'bg-[#171614]' : 'bg-[#F0EDE8]',
                isHoje && 'ring-2 ring-[#171614]',
              )}
            />
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3.5">
        <div className="flex items-center gap-1.5">
          <i className="fa-solid fa-fire text-sm text-[#C8A96A]" aria-hidden="true" />
          <span className="font-nunito text-xs text-[#8A8880]">
            <strong className="text-[#171614]">{streak}</strong> dias seguidos
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <i className="fa-solid fa-calendar-check text-[13px] text-[#8BAD7A]" aria-hidden="true" />
          <span className="font-nunito text-xs text-[#8A8880]">
            <strong className="text-[#171614]">{diasRegistrados.length}</strong> de {filtro.total} dias
          </span>
        </div>
      </div>
    </SectionCard>
  )
}

function SecaoBemEstar({ humor7, agua7, mediaAgua, idioma }) {
  return (
    <SectionCard>
      <Eyebrow>Bem-estar — últimos 7 dias</Eyebrow>

      {/* Humor */}
      <p className="mb-2 font-nunito text-[11px] font-bold text-[#171614]">Humor</p>
      <div className="mb-4 grid grid-cols-7 gap-1.5">
        {humor7.map(({ dia, humor }) => {
          const label = localeDate(dia, idioma, { weekday: 'narrow' })
          return (
            <div key={dia} className="flex flex-col items-center gap-1">
              <div className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                humor ? 'bg-opacity-10' : 'bg-[#F0EDE8]',
              )} style={humor ? { background: HUMOR_COR[humor] + '22' } : {}}>
                {humor
                  ? <i className={cn('fa-regular text-base', HUMOR_ICON[humor])}
                      style={{ color: HUMOR_COR[humor] }} aria-hidden="true" />
                  : <span className="text-[10px] text-[#C0BEB8]">—</span>}
              </div>
              <span className="font-nunito text-[9px] font-bold text-[#C0BEB8]">{label}</span>
            </div>
          )
        })}
      </div>

      {/* Água */}
      <p className="mb-2 font-nunito text-[11px] font-bold text-[#171614]">
        Água — média {mediaAgua > 0 ? `${mediaAgua} copos/dia` : '—'}
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {agua7.map((copos, i) => {
          const pct   = Math.min((copos / 12) * 100, 100)
          const label = localeDate(DIAS_7[i], idioma, { weekday: 'narrow' })
          const cor   = copos >= 8 ? '#8BAD7A' : copos >= 4 ? '#C8DCFF' : '#EBEBEB'
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="relative flex h-9 w-9 items-end overflow-hidden rounded-[10px] bg-[#F0EDE8]">
                <div className="w-full transition-all duration-300"
                  style={{ height: `${pct}%`, background: cor }} />
                {copos > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center font-nunito text-[9px] font-bold text-[#171614]">
                    {copos}
                  </span>
                )}
              </div>
              <span className="font-nunito text-[9px] font-bold text-[#C0BEB8]">{label}</span>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

function SecaoCiclo({ pct, concluidas, puladas, pendentes, proximaEtapa, navigate, idioma }) {
  return (
    <SectionCard>
      <div className="mb-4 flex items-center justify-between">
        <Eyebrow>Ciclo capilar</Eyebrow>
        <span className="font-heading text-xl font-light text-[#171614]">
          {pct}<span className="text-xs text-[#8A8880]">%</span>
        </span>
      </div>

      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#F0EDE8]">
        <div className="h-full rounded-full bg-[#171614] transition-all duration-500"
          style={{ width: `${pct}%` }} />
      </div>

      <div className={cn('grid gap-2.5', proximaEtapa ? 'mb-4' : '', 'grid-cols-3')}>
        {[
          { val: concluidas, label: 'Concluídas', cor: '#22c55e', bg: '#F0FBF4' },
          { val: puladas,    label: 'Puladas',    cor: '#f59e0b', bg: '#FBF9EE' },
          { val: pendentes,  label: 'Pendentes',  cor: '#8A8880', bg: '#F7F5F1' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.bg }}>
            <div className="font-heading text-[22px] font-light" style={{ color: s.cor }}>{s.val}</div>
            <div className="mt-0.5 font-nunito text-[10px] text-[#8A8880]">{s.label}</div>
          </div>
        ))}
      </div>

      {proximaEtapa && (() => {
        const tp  = TIPO_SOFT[proximaEtapa.tipoCuidado] ?? { soft: '#F5F3EE', ink: '#5A5850', icon: 'fa-leaf' }
        const dataE = proximaEtapa.dataEtapa?.toDate?.() ?? null
        return (
          <button
            type="button"
            onClick={() => navigate(`/app/etapa/${proximaEtapa.cronogramaId}/${proximaEtapa.id}`)}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#EBEBEB] bg-[#F7F5F1] px-3.5 py-3 text-left transition hover:bg-[#F0EDE8]"
          >
            <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] text-sm"
              style={{ background: tp.soft, color: tp.ink }}>
              <i className={cn('fa-solid', tp.icon)} aria-hidden="true" />
            </div>
            <div className="flex-1">
              <div className="font-nunito text-sm font-semibold text-[#171614]">{proximaEtapa.tipoCuidado}</div>
              {dataE && (
                <div className="font-nunito text-[11px] text-[#8A8880]">
                  {dataE.toLocaleDateString(idioma === 'en' ? 'en-US' : 'pt-BR', {
                    weekday: 'short', day: '2-digit', month: 'short',
                  })}
                </div>
              )}
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-[#C0BEB8]" aria-hidden="true" />
          </button>
        )
      })()}
    </SectionCard>
  )
}

function SecaoConquistas({ desbloq }) {
  if (!CONQUISTAS?.length) return null
  return (
    <SectionCard>
      <Eyebrow>Conquistas</Eyebrow>
      <div className="flex flex-col gap-2">
        {CONQUISTAS.map(c => {
          const ok = desbloq.includes(c.id)
          return (
            <div key={c.id} className={cn(
              'flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all',
              ok ? 'bg-[#171614]' : 'bg-black/[.03] opacity-45',
            )}>
              <div className={cn(
                'grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl text-[15px]',
                ok ? 'bg-white/10 text-white' : 'bg-black/[.06] text-[#8A8880]',
              )}>
                <i className={cn('fa-solid', ok ? (c.icon ?? 'fa-star') : 'fa-lock')} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className={cn('font-nunito text-xs font-semibold', ok ? 'text-white' : 'text-[#171614]')}>
                  {c.nome}
                </div>
                <div className={cn('mt-0.5 font-nunito text-[11px]', ok ? 'text-white/40' : 'text-[#8A8880]')}>
                  {c.desc}
                </div>
              </div>
              {ok && c.xp > 0 && (
                <span className="font-nunito text-[10px] font-bold text-white/50 whitespace-nowrap">
                  +{c.xp} XP
                </span>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Analises() {
  const { user }      = useAuth()
  const { idioma }    = useIdioma()
  const navigate      = useNavigate()

  const [perfil,    setPerfil]    = useState(null)
  const [scores,    setScores]    = useState([])
  const [registros, setRegistros] = useState({})
  const [etapas,    setEtapas]    = useState([])
  const [desbloq,   setDesbloq]   = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    const uid = user.uid

    const unsub = onSnapshot(doc(db, 'usuarios', uid), s =>
      setPerfil(s.exists() ? s.data() : null)
    )

    async function carregar() {
      // Scores
      const sSnap = await getDocs(
        query(collection(db, 'usuarios', uid, 'hair_scores'), orderBy('dataRegistro', 'desc'), limit(10))
      )
      setScores(sSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      // Registros dos últimos 30 dias
      const allRegs = await getDocs(collection(db, 'usuarios', uid, 'registros'))
      const regs = {}
      allRegs.docs.forEach(d => { if (DIAS_30.includes(d.id)) regs[d.id] = d.data() })
      setRegistros(regs)

      // Cronograma → etapas
      const cSnap = await getDocs(
        query(collection(db, 'usuarios', uid, 'cronogramas'), orderBy('dataInicio', 'desc'), limit(1))
      )
      if (!cSnap.empty) {
        const cronId = cSnap.docs[0].id
        const eSnap  = await getDocs(collection(db, 'usuarios', uid, 'cronogramas', cronId, 'etapas'))
        setEtapas(eSnap.docs.map(d => ({ id: d.id, cronogramaId: cronId, ...d.data() })))
      }

      // Conquistas
      try {
        const qSnap  = await getDocs(collection(db, 'usuarios', uid, 'conquistas'))
        const desbDoc = qSnap.docs.find(d => d.id === 'desbloqueadas')
        setDesbloq(desbDoc?.data()?.ids ?? [])
      } catch {}

      setLoading(false)
    }

    carregar()
    return () => unsub()
  }, [user])

  // ── Derivados ──────────────────────────────────────────────────────────────
  const scoreAtual    = scores[0]?.pontuacao ?? 0
  const scoreAnterior = scores[1]?.pontuacao ?? null
  const tendencia     = scoreAnterior !== null ? scoreAtual - scoreAnterior : null
  const streak        = perfil?.streak ?? 0
  const xp            = perfil?.xp ?? 0

  const diasRegistrados = DIAS_30.filter(d => registros[d])
  const pctConsistencia = Math.round((diasRegistrados.length / 30) * 100)

  const humor7    = DIAS_7.map(d => ({ dia: d, humor: registros[d]?.humor ?? null }))
  const agua7     = DIAS_7.map(d => registros[d]?.agua ?? 0)
  const mediaAgua = agua7.filter(v => v > 0).length > 0
    ? Math.round(agua7.reduce((a, b) => a + b, 0) / agua7.filter(v => v > 0).length)
    : 0

  const concluidas   = etapas.filter(e => e.concluida).length
  const puladas      = etapas.filter(e => e.pulada).length
  const pendentes    = etapas.filter(e => !e.concluida && !e.pulada).length
  const pctCiclo     = etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0
  const proximaEtapa = etapas.find(e => !e.concluida && !e.pulada)

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-screen items-center justify-center">
          <i className="fa-solid fa-spinner fa-spin text-[22px] text-lumi-black" aria-hidden="true" />
        </div>
      </AppShell>
    )
  }

  const secoes = (
    <div className="flex flex-col gap-4">
      <SecaoHairScore scores={scores} tendencia={tendencia} streak={streak} xp={xp} idioma={idioma} />
      <SecaoConsistencia registros={registros} streak={streak} />
      <SecaoBemEstar humor7={humor7} agua7={agua7} mediaAgua={mediaAgua} idioma={idioma} />
      <SecaoCiclo
        pct={pctCiclo}
        concluidas={concluidas}
        puladas={puladas}
        pendentes={pendentes}
        proximaEtapa={proximaEtapa}
        navigate={navigate}
        idioma={idioma}
      />
      <SecaoConquistas desbloq={desbloq} />
    </div>
  )

  return (
    <AppShell>
      <main className="mx-auto max-w-[800px] px-4 pb-28 pt-6 lg:px-12 lg:pb-12 lg:pt-10">
        <h2 className="mb-6 font-heading text-xl font-semibold text-lumi-black lg:text-2xl">
          Análises
        </h2>
        {secoes}
      </main>
    </AppShell>
  )
}

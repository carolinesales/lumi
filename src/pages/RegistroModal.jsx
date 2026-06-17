import { useEffect, useState }                                                from 'react'
import { doc, setDoc, updateDoc, getDoc }                                    from 'firebase/firestore'

import { db }                        from '@/lib/firebase'
import { useAuth }                   from '@/contexts/AuthContext'
import { useIdioma }                 from '@/contexts/IdiomaContext'
import { XP_ACOES, calcularAjusteScore, CONQUISTAS, verificarConquistas }    from '@/lib/gamificacao'
import { aplicarDeltaHairScore }     from '@/features/hairScore/services/hairScore'
import { EVENTOS_CAPILARES, aplicarImpactoEventosDoDia } from '@/lib/reavaliacaoService'
import { calcularStreakReal, calcularCuidado7Dias }       from '@/features/gamification/utils/gamificationUtils'
import { Button }                    from '@/components/ui/button'
import FotoCapilarUpload          from '@/features/jornada/components/FotoCapilarUpload'
import { cn }                        from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dataIdFromDate(date)  { return date.toISOString().split('T')[0] }
function hojeZerado()          { const d = new Date(); d.setHours(0,0,0,0); return d }
function addDays(date, n)      { const d = new Date(date); d.setDate(d.getDate()+n); d.setHours(0,0,0,0); return d }
function isSameDay(a, b)       { return dataIdFromDate(a) === dataIdFromDate(b) }
function isFuture(date)        { return date > hojeZerado() }
function formatSigned(v)       { const n = Number(v ?? 0); return n > 0 ? `+${n}` : `${n}` }

function formatDia(date) {
  if (isSameDay(date, hojeZerado())) return 'Hoje'
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
    .format(date).replace(/^\w/, l => l.toUpperCase())
}
function formatDataCompleta(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(date)
}

const EVENTOS_FILTRADOS = EVENTOS_CAPILARES.filter(e => !['calor','piscina_mar'].includes(e.id))

// ─── copinhos ───────────────────────────────────────────────────────────────────

function CupSVG({ filled, fillPct = 0 }) {
  const accent   = 'var(--text-primary)'
  const border   = filled ? 'var(--text-primary)' : 'var(--lumi-border)'
  const bg       = filled ? 'var(--surface-muted)' : 'var(--surface-subtle)'
  const id       = `cup-${Math.random().toString(36).slice(2,7)}`

  return (
    <svg width="36" height="44" viewBox="0 0 32 40" fill="none">
      <defs>
        <clipPath id={id}>
          <path d="M4 2 L28 2 L25 38 L7 38 Z" />
        </clipPath>
      </defs>
      <path d="M4 2 L28 2 L25 38 L7 38 Z" fill={bg} stroke={border} strokeWidth="2" strokeLinejoin="round" />
      {filled && (
        <rect x="0" y={40 - (36 * (fillPct / 100))} width="32" height="40"
          fill={accent} fillOpacity="0.45" clipPath={`url(#${id})`} />
      )}
      {filled && (
        <line x1="10" y1="8" x2="9" y2="22" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeOpacity="0.5" clipPath={`url(#${id})`} />
      )}
    </svg>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Chip({ selected, onClick, icon, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] py-1 pl-1 pr-3.5 font-nunito text-sm font-semibold transition-all',
        selected
          ? 'border-ink bg-ink text-white'
          : 'border-transparent bg-surface-subtle text-text hover:bg-surface-muted',
      )}
    >
      {icon && (
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', selected ? 'bg-white' : 'bg-surface')}>
          <i className={cn('fa-solid text-[11px]', icon, selected ? 'text-ink' : 'text-text-tertiary')} aria-hidden="true" />
        </span>
      )}
      <span>{children}</span>
    </button>
  )
}

function Section({ title, subtitle, children, className }) {
  return (
    <div className={cn('mb-4 flex flex-col gap-4 rounded-[12px] border border-paper-200 bg-surface p-4', className)}>
      <div className="flex flex-col gap-0.5">
        <h3 className="font-heading text-[15px] font-semibold tracking-[-0.02em] text-text">
          {title}
        </h3>
        {subtitle && (
          <p className="font-nunito text-[11px] leading-snug text-text-secondary">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

function WaterCups({ value, onChange }) {
  const TOTAL  = 12
  const ML_PER = 250

  function label(i) {
    const ml = (i + 1) * ML_PER
    return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`
  }

  return (
    <div className="mb-4 flex flex-col gap-4 rounded-[12px] border border-paper-200 bg-surface p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-heading text-[15px] font-semibold tracking-[-0.02em] text-text">Água</h3>
        <span className="font-heading text-xl font-medium tracking-tight text-text">
          {value * ML_PER}<span className="ml-1 font-nunito text-xs text-text-secondary">ml / {TOTAL * ML_PER}ml</span>
        </span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: TOTAL }).map((_, i) => {
          const filled  = i < value
          const fillPct = filled ? 30 + (i / (TOTAL - 1)) * 50 : 0
          return (
            <button
              key={i} type="button"
              onClick={() => onChange(i + 1 === value ? i : i + 1)}
              aria-label={label(i)}
              className="flex cursor-pointer flex-col items-center gap-[3px] border-none bg-transparent p-0 transition-transform active:scale-[.92]"
            >
              <CupSVG filled={filled} fillPct={fillPct} />
              <span className={cn(
                'font-nunito text-[8.5px] font-bold transition-colors',
                filled ? 'text-text' : 'text-text-tertiary',
              )}>
                {label(i)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ScoreBox({ label, value, variant }) {
  return (
    <div className="rounded-2xl border-[1.5px] border-paper-200 p-3.5 text-center">
      <span className="mb-1.5 block font-nunito text-[10px] font-bold uppercase tracking-[.1em] text-text-secondary">
        {label}
      </span>
      <strong className={cn(
        'font-heading text-[28px] font-normal tracking-[-0.04em]',
        variant === 'positive' ? 'text-state-positive' : variant === 'negative' ? 'text-state-negative' : 'text-text',
      )}>
        {value}
      </strong>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RegistroModal({ onClose, onConcluido, onSaved }) {
  const { user } = useAuth()
  const { t }    = useIdioma()

  const [selectedDate,      setSelectedDate]      = useState(hojeZerado)
  const selectedDataId = dataIdFromDate(selectedDate)
  const isToday   = isSameDay(selectedDate, hojeZerado())
  const canGoNext = !isToday

  const [humor,             setHumor]             = useState('')
  const [sono,              setSono]              = useState('')
  const [estresse,          setEstresse]          = useState('')
  const [agua,              setAgua]              = useState(0)
  const [cuidados,          setCuidados]          = useState([])
  const [estadoFios,        setEstadoFios]        = useState([])
  const [couro,             setCouro]             = useState([])
  const [bemEstar,          setBemEstar]          = useState([])
  const [procedimentos,     setProcedimentos]     = useState([])
  const [eventosDia,        setEventosDia]        = useState(['nada'])
  const [observacao,        setObservacao]        = useState('')
  const [fotoURL,           setFotoURL]           = useState('')
  const [salvando,          setSalvando]          = useState(false)
  const [carregando,        setCarregando]        = useState(false)
  const [resultado,         setResultado]         = useState(null)
  const [registroExistente, setRegistroExistente] = useState(false)
  const [registroOriginal,  setRegistroOriginal]  = useState(null)

  const HUMORES = [
    { val:'otimo',   label: t('reg_humor_otimo')   || 'Ótimo',         icon:'fa-face-grin-stars' },
    { val:'bom',     label: t('reg_humor_bom')     || 'Bem',           icon:'fa-face-smile'       },
    { val:'neutro',  label: t('reg_humor_neutro')  || 'Neutro',        icon:'fa-face-meh'         },
    { val:'ruim',    label: t('reg_humor_ruim')    || 'Ruim',          icon:'fa-face-frown'       },
    { val:'pessimo', label: t('reg_humor_pessimo') || 'Muito cansada', icon:'fa-face-tired'       },
  ]
  const SONOS = [
    { val:'otimo', label:'Dormi bem',    icon:'fa-moon'       },
    { val:'bom',   label:'Sono regular', icon:'fa-bed'        },
    { val:'ruim',  label:'Pouco sono',   icon:'fa-cloud-moon' },
  ]
  const ESTRESSES = [
    { val:'baixo', label:'Baixo', icon:'fa-leaf'        },
    { val:'medio', label:'Médio', icon:'fa-wave-square' },
    { val:'alto',  label:'Alto',  icon:'fa-bolt'        },
  ]
  const CUIDADOS = [
    { val:'lavouCabelo',  label:'Lavei o cabelo',     icon:'fa-pump-soap'        },
    { val:'hidratou',     label:'Hidratação',          icon:'fa-droplet'          },
    { val:'nutriu',       label:'Nutrição',            icon:'fa-leaf'             },
    { val:'reconstruiu',  label:'Reconstrução',        icon:'fa-shield-heart'     },
    { val:'usouOleo',     label:'Óleo ou finalizador', icon:'fa-bottle-droplet'   },
    { val:'usouProtecao', label:'Proteção térmica',    icon:'fa-temperature-high' },
    { val:'nenhum',       label:'Nenhum cuidado',      icon:'fa-minus'            },
  ]
  const ESTADO_FIOS = [
    { val:'brilho',    label:'Com brilho', icon:'fa-sparkles'           },
    { val:'ressecado', label:'Ressecado',  icon:'fa-droplet-slash'      },
    { val:'frizz',     label:'Com frizz',  icon:'fa-wind'               },
    { val:'quebra',    label:'Quebradiço', icon:'fa-scissors'           },
    { val:'pesado',    label:'Pesado',     icon:'fa-weight-hanging'     },
    { val:'alinhado',  label:'Alinhado',   icon:'fa-grip-lines'         },
    { val:'macio',     label:'Macio',      icon:'fa-feather'            },
    { val:'opaco',     label:'Opaco',      icon:'fa-circle-half-stroke' },
  ]
  const COURO = [
    { val:'equilibrado', label:'Equilibrado', icon:'fa-check'              },
    { val:'oleoso',      label:'Oleoso',      icon:'fa-droplet'            },
    { val:'sensivel',    label:'Sensível',    icon:'fa-circle-exclamation' },
    { val:'coceira',     label:'Coçando',     icon:'fa-hand'               },
    { val:'caspa',       label:'Com caspa',   icon:'fa-snowflake'          },
  ]
  const BEM_ESTAR = [
    { val:'comeuBem',  label:'Comi bem',      icon:'fa-utensils'        },
    { val:'atividade', label:'Me movimentei', icon:'fa-person-walking'  },
    { val:'cansaco',   label:'Cansaço',       icon:'fa-battery-quarter' },
    { val:'calor',     label:'Muito calor',   icon:'fa-sun'             },
    { val:'tempoSeco', label:'Tempo seco',    icon:'fa-cloud'           },
  ]
  const PROCEDIMENTOS = [
    { val:'secador',     label:'Secador',        icon:'fa-temperature-high'    },
    { val:'chapinha',    label:'Chapinha',        icon:'fa-grip-lines'          },
    { val:'babyliss',    label:'Modelador',       icon:'fa-wand-magic-sparkles' },
    { val:'amarrou',     label:'Prendi muito',    icon:'fa-link'                },
    { val:'produtoNovo', label:'Produto novo',    icon:'fa-bottle-droplet'      },
    { val:'piscinaMar',  label:'Piscina ou mar',  icon:'fa-water'               },
  ]

  useEffect(() => { carregarRegistroDoDia() }, [user?.uid, selectedDataId]) // eslint-disable-line

  function reset() {
    setHumor(''); setSono(''); setEstresse(''); setAgua(0)
    setCuidados([]); setEstadoFios([]); setCouro([])
    setBemEstar([]); setProcedimentos([])
    setEventosDia(['nada']); setObservacao('')
    setResultado(null); setRegistroExistente(false); setRegistroOriginal(null)
  }

  async function carregarRegistroDoDia() {
    if (!user) return
    setCarregando(true); setResultado(null)
    try {
      const snap = await getDoc(doc(db, 'usuarios', user.uid, 'registros', selectedDataId))
      if (!snap.exists()) { reset(); return }
      const d = snap.data()
      setRegistroExistente(true); setRegistroOriginal(d)
      setHumor(d.humor ?? ''); setSono(d.sono ?? ''); setEstresse(d.estresse ?? '')
      setAgua(d.agua ?? 0)
      const c = []
      if (d.lavouCabelo)   c.push('lavouCabelo')
      if (d.hidratou)      c.push('hidratou')
      if (d.nutriu)        c.push('nutriu')
      if (d.reconstruiu)   c.push('reconstruiu')
      if (d.usouOleo)      c.push('usouOleo')
      if (d.usouProtecao)  c.push('usouProtecao')
      if (d.nenhumCuidado) c.push('nenhum')
      setCuidados(c)
      setEstadoFios(d.estadoFios ?? [])
      setCouro(d.couroCabeludo ?? [])
      setBemEstar(d.bemEstar ?? [])
      setProcedimentos(d.procedimentos ?? [])
      setEventosDia(d.eventosCapilares?.length ? d.eventosCapilares : ['nada'])
      setObservacao(d.observacao ?? '')
      setFotoURL(d.fotoURL ?? '')
    } finally { setCarregando(false) }
  }

  function irAnterior() { setSelectedDate(p => addDays(p, -1)) }
  function irSeguinte() { setSelectedDate(p => { const n = addDays(p, 1); return isFuture(n) ? p : n }) }
  function handleBack() {
    irAnterior()
  }
  function toggleLista(setter, lista, val) {
    setter(lista.includes(val) ? lista.filter(i => i !== val) : [...lista, val])
  }
  function toggleCuidado(val) {
    if (val === 'nenhum') { setCuidados(['nenhum']); return }
    const sem = cuidados.filter(c => c !== 'nenhum')
    setCuidados(sem.includes(val) ? sem.filter(c => c !== val) : [...sem, val])
  }
  function toggleEvento(val) {
    if (val === 'nada') { setEventosDia(['nada']); return }
    const sem = eventosDia.filter(e => e !== 'nada')
    setEventosDia(sem.includes(val) ? sem.filter(e => e !== val) : [...sem, val])
  }

  async function salvar() {
    if (!user || salvando || isFuture(selectedDate)) return
    setSalvando(true)
    try {
      const uid     = user.uid
      const userRef = doc(db, 'usuarios', uid)
      const hoje    = dataIdFromDate(hojeZerado())

      const cuidadosNorm = [...cuidados,
        procedimentos.includes('secador') || procedimentos.includes('chapinha') || procedimentos.includes('babyliss') ? 'usouCalor' : null,
        procedimentos.includes('produtoNovo') ? 'produtoNovo' : null,
        procedimentos.includes('piscinaMar')  ? 'piscinaMar'  : null,
      ].filter(Boolean)
      const eventosNorm = eventosDia.includes('nada') ? ['nada'] : eventosDia

      const registro = {
        data: selectedDataId, dataRegistro: selectedDate,
        humor, sono, estresse, agua,
        lavouCabelo:  cuidados.includes('lavouCabelo'),
        hidratou:     cuidados.includes('hidratou'),
        nutriu:       cuidados.includes('nutriu'),
        reconstruiu:  cuidados.includes('reconstruiu'),
        usouOleo:     cuidados.includes('usouOleo'),
        usouProtecao: cuidados.includes('usouProtecao'),
        nenhumCuidado:cuidados.includes('nenhum'),
        estadoFios, couroCabeludo: couro, bemEstar, procedimentos,
        eventosCapilares: eventosNorm,
        observacao: observacao.trim(),
        fotoURL: fotoURL || null,
        criadoEm: new Date(), atualizadoEm: new Date(),
      }

      let xpGanho = XP_ACOES.registro_diario
      if (humor === 'otimo')                    xpGanho += XP_ACOES.humor_otimo
      if (cuidados.includes('lavouCabelo'))     xpGanho += XP_ACOES.lavou_cabelo
      if (cuidados.includes('hidratou'))        xpGanho += XP_ACOES.hidratou
      if (cuidados.includes('reconstruiu'))     xpGanho += XP_ACOES.reconstruiu
      if (agua >= 8)                            xpGanho += XP_ACOES.bebeu_agua
      if (sono === 'otimo')                     xpGanho += XP_ACOES.dormiu_bem

      const ajuste          = calcularAjusteScore(registro)
      const ajusteAnterior  = Number(registroOriginal?.ajusteAplicado  ?? 0)
      const xpAnterior      = Number(registroOriginal?.xpGanhoAplicado ?? 0)
      const deltaParaAplicar = registroExistente ? ajuste - ajusteAnterior : ajuste
      const xpParaAplicar    = registroExistente ? xpGanho - xpAnterior   : xpGanho

      await setDoc(
        doc(db, 'usuarios', uid, 'registros', selectedDataId),
        { ...registro, ajusteCalculado: ajuste, ajusteAplicado: ajuste, xpGanhoCalculado: xpGanho, xpGanhoAplicado: xpGanho, atualizadoEm: new Date(), criadoEm: registroOriginal?.criadoEm ?? new Date() },
        { merge: true },
      )

      const uSnap = await getDoc(userRef)
      const ud    = uSnap.data() ?? {}
      const novoXp = Math.max(0, (ud.xp ?? 0) + xpParaAplicar)

      const [novoStreak, novoCuidado7Dias] = await Promise.all([
        calcularStreakReal(uid),
        calcularCuidado7Dias(uid),
      ])

      let scoreRes = { scoreAnterior: ud.hairScoreAtual ?? 0, scoreAtual: ud.hairScoreAtual ?? 0, delta: 0 }
      if (deltaParaAplicar !== 0) {
        scoreRes = await aplicarDeltaHairScore({
          uid, delta: deltaParaAplicar,
          origem: registroExistente ? 'registro_diario_atualizado' : selectedDataId === hoje ? 'registro_diario' : 'registro_diario_retroativo',
          dataId: selectedDataId,
          extra: { registroId: selectedDataId, humor, sono, estresse, agua, cuidados: cuidadosNorm, estadoFios, couro, bemEstar, procedimentos, eventosDia: eventosNorm, observacao: observacao.trim(), xpGanho, xpParaAplicar, ajuste, ajusteAnterior, deltaParaAplicar, retroativo: selectedDataId !== hoje, atualizado: registroExistente },
        })
      }

      if (!registroExistente && eventosNorm.length > 0 && !eventosNorm.includes('nada')) {
        const imp = await aplicarImpactoEventosDoDia({
          uid, dataId: selectedDataId, eventos: eventosNorm,
          detalhes: { registroId: selectedDataId, humor, sono, estresse, agua, cuidados: cuidadosNorm, estadoFios, couro, bemEstar, procedimentos, observacao: observacao.trim(), retroativo: selectedDataId !== hoje },
          origem: selectedDataId === hoje ? 'evento_capilar_diario' : 'evento_capilar_retroativo',
        })
        if (imp?.scoreAtual) scoreRes = imp
      }

      const userUpdates = {
        xp: novoXp,
        cuidado7Dias: novoCuidado7Dias,
        streak: novoStreak,
        ultimoRegistroDiarioEm: new Date(),
        humorOtimoCount: humor === 'otimo' && registroOriginal?.humor !== 'otimo'
          ? (ud.humorOtimoCount ?? 0) + 1
          : humor !== 'otimo' && registroOriginal?.humor === 'otimo'
          ? Math.max(0, (ud.humorOtimoCount ?? 0) - 1)
          : (ud.humorOtimoCount ?? 0),
      }
      if (selectedDataId === hoje) userUpdates.ultimoRegistro = hoje

      await updateDoc(userRef, userUpdates)

      const cSnap        = await getDoc(doc(db, 'usuarios', uid, 'conquistas', 'desbloqueadas'))
      const desbloqueadas = cSnap.exists() ? cSnap.data().ids ?? [] : []
      const diagSnap     = await getDoc(userRef)
      const diagData     = diagSnap.data() ?? {}

      const novasIds = verificarConquistas({
        desbloqueadas, streak: novoStreak,
        etapasConcluidas:  diagData.etapasConcluidas  ?? 0,
        hairScore:         scoreRes.scoreAtual,
        totalDiagnosticos: diagData.totalDiagnosticos ?? 1,
        xp: novoXp, humorOtimoCount: diagData.humorOtimoCount ?? 0,
        cuidado7Dias: novoCuidado7Dias,
      })

      const conquistasNovas = novasIds.map(id => CONQUISTAS.find(c => c.id === id)).filter(Boolean)
      let xpFinal = novoXp

      if (conquistasNovas.length > 0) {
        const bonus = conquistasNovas.reduce((a, c) => a + (c.xp ?? 0), 0)
        xpFinal += bonus
        await setDoc(
          doc(db, 'usuarios', uid, 'conquistas', 'desbloqueadas'),
          { ids: [...desbloqueadas, ...novasIds], atualizadoEm: new Date() },
          { merge: true },
        )
        if (bonus > 0) await updateDoc(userRef, { xp: xpFinal })
      }

      setRegistroExistente(true)
      setRegistroOriginal({ ...registro, ajusteAplicado: ajuste, xpGanhoAplicado: xpGanho })
      setResultado({ xpGanho: xpParaAplicar, xpFinal, conquistasNovas, ajuste: deltaParaAplicar, scoreAnterior: scoreRes.scoreAnterior, scoreAtual: scoreRes.scoreAtual, scoreDelta: scoreRes.delta })
      onSaved?.(); onConcluido?.()
    } finally { setSalvando(false) }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex animate-[rmFadeIn_.2s_ease_both] items-end justify-center bg-black/[.38] md:items-center md:bg-black/30 md:p-6"
      onClick={onClose}
      style={{ '--animate-rmFadeIn': 'from{opacity:0}to{opacity:1}' }}
    >
      <style>{`
        @keyframes rmSlideUp { from{transform:translateY(100%);opacity:.8} to{transform:translateY(0);opacity:1} }
        @keyframes rmFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes rmPopIn   { 0%{transform:scale(.72);opacity:0} 70%{transform:scale(1.06);opacity:1} 100%{transform:scale(1)} }
      `}</style>

      {/* Sheet */}
      <div
        className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_-12px_60px_rgba(0,0,0,.14)] md:max-w-[800px] md:rounded-[28px] md:max-h-[88vh]"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '94vh', animation: 'rmSlideUp .32s cubic-bezier(.22,1,.36,1) both' }}
      >
        {/* Alça — mobile only */}
        <div className="flex shrink-0 justify-center pb-1 pt-3 md:hidden">
          <div className="h-1 w-[38px] rounded-full bg-paper-300" />
        </div>

        {/* Header */}
        <header className="grid shrink-0 grid-cols-[40px_1fr_40px] items-center border-b border-paper-200 px-5 pb-4 pt-1 md:grid-cols-[80px_1fr_80px] md:px-8 md:py-5">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Voltar"
              className="grid h-9 w-9 place-items-center rounded-full bg-transparent transition hover:bg-surface-subtle"
            >
              <i className="fa-solid fa-chevron-left text-[13px] text-text-secondary" aria-hidden="true" />
            </button>
          </div>
          <div className="text-center">
            <h2 className="font-heading text-lg font-semibold tracking-[-0.04em] text-text md:text-xl">
              {resultado ? 'Registro salvo' : formatDia(selectedDate)}
            </h2>
            <p className="mt-[3px] font-nunito text-[11px] font-medium text-text-secondary">
              {formatDataCompleta(selectedDate)}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={irSeguinte}
              disabled={!canGoNext}
              aria-label="Próximo dia"
              className="grid h-9 w-9 place-items-center rounded-full bg-transparent transition hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-[.28]"
            >
              <i className="fa-solid fa-chevron-right text-[13px] text-text-secondary" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto bg-surface-subtle px-5 py-5 md:px-8 md:py-7">
          {carregando ? (
            <div className="grid min-h-[240px] place-items-center font-nunito text-sm text-text-secondary">
              Carregando registro...
            </div>
          ) : resultado ? (
            /* ── Resultado ── */
            <div className="py-7 text-center">
              <div
                className="mx-auto mb-[18px] grid h-[72px] w-[72px] place-items-center rounded-full bg-ink text-white"
                style={{ animation: 'rmPopIn .4s ease both' }}
              >
                <i className="fa-solid fa-check text-[28px]" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-heading text-[22px] font-semibold tracking-[-0.04em] text-text">
                Seu dia foi registrado
              </h3>
              <p className="mx-auto mb-5 max-w-[320px] font-nunito text-sm leading-relaxed text-text-secondary">
                O Lumi salvou seu registro e atualizou a evolução dos seus fios.
              </p>

              <div className="mb-2.5 grid grid-cols-2 gap-2.5">
                <ScoreBox label="Hair Score" value={resultado.scoreAtual} />
                <ScoreBox
                  label="Variação"
                  value={formatSigned(resultado.scoreDelta)}
                  variant={resultado.scoreDelta >= 0 ? 'positive' : 'negative'}
                />
              </div>
              <ScoreBox label="XP do dia" value={formatSigned(resultado.xpGanho)} />

              {resultado.conquistasNovas.length > 0 && (
                <div className="mt-3">
                  {resultado.conquistasNovas.map(c => (
                    <div
                      key={c.id}
                      className="mt-2 flex items-center gap-2.5 rounded-2xl bg-surface-subtle p-3"
                    >
                      <i className={cn('fa-solid', c.icon)} style={{ color: c.cor?.icon ?? 'var(--text-primary)' }} aria-hidden="true" />
                      <div className="text-left">
                        <strong className="block font-nunito text-sm text-text">
                          {c.nome}
                        </strong>
                        <p className="mt-0.5 font-nunito text-[11px] leading-snug text-text-secondary">
                          {c.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── Formulário ── */
            <div className="md:grid md:grid-cols-2 md:items-start md:gap-x-4">
              <Section title="Como você está?">
                <div className="flex flex-wrap gap-2">
                  {HUMORES.map(item => (
                    <Chip key={item.val} selected={humor === item.val} onClick={() => setHumor(item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Sono" subtitle="Como foi seu descanso?">
                <div className="flex flex-wrap gap-2">
                  {SONOS.map(item => (
                    <Chip key={item.val} selected={sono === item.val} onClick={() => setSono(item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Estresse">
                <div className="flex flex-wrap gap-2">
                  {ESTRESSES.map(item => (
                    <Chip key={item.val} selected={estresse === item.val} onClick={() => setEstresse(item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <WaterCups value={agua} onChange={setAgua} />

              <Section title="O que você fez nos fios?" className="md:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {CUIDADOS.map(item => (
                    <Chip key={item.val} selected={cuidados.includes(item.val)} onClick={() => toggleCuidado(item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Como estão os fios?">
                <div className="flex flex-wrap gap-2">
                  {ESTADO_FIOS.map(item => (
                    <Chip key={item.val} selected={estadoFios.includes(item.val)} onClick={() => toggleLista(setEstadoFios, estadoFios, item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Couro cabeludo">
                <div className="flex flex-wrap gap-2">
                  {COURO.map(item => (
                    <Chip key={item.val} selected={couro.includes(item.val)} onClick={() => toggleLista(setCouro, couro, item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Hábitos do dia">
                <div className="flex flex-wrap gap-2">
                  {BEM_ESTAR.map(item => (
                    <Chip key={item.val} selected={bemEstar.includes(item.val)} onClick={() => toggleLista(setBemEstar, bemEstar, item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Exposição e rotina">
                <div className="flex flex-wrap gap-2">
                  {PROCEDIMENTOS.map(item => (
                    <Chip key={item.val} selected={procedimentos.includes(item.val)} onClick={() => toggleLista(setProcedimentos, procedimentos, item.val)} icon={item.icon}>{item.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Aconteceu algo?" subtitle="Eventos que o Lumi deve levar em conta." className="md:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {EVENTOS_FILTRADOS.map(e => (
                    <Chip key={e.id} selected={eventosDia.includes(e.id)} onClick={() => toggleEvento(e.id)} icon={e.icon}>{e.label}</Chip>
                  ))}
                </div>
              </Section>

              <Section title="Foto do cabelo" subtitle="Registre como seus fios estão hoje." className="md:col-span-2">
                <FotoCapilarUpload
                  uid={user?.uid}
                  dataId={selectedDataId}
                  fotoURL={fotoURL}
                  onUpload={url => setFotoURL(url)}
                  compact
                />
              </Section>

              <Section title="Observação" subtitle="Algo que o Lumi deve saber sobre hoje?" className="md:col-span-2">
                <textarea
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Ex.: experimentei um produto novo e os fios ficaram mais pesados..."
                  maxLength={240}
                  className="w-full resize-none rounded-[8px] border-[1.5px] border-paper-200 bg-surface-subtle px-3.5 py-3 font-nunito text-sm leading-relaxed text-text outline-none transition placeholder:text-text-tertiary focus:border-ink"
                  rows={3}
                />
              </Section>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-paper-200 bg-surface px-5 pb-7 pt-3.5 md:px-8 md:pb-6">
          {resultado ? (
            <div className="flex md:justify-end">
              <Button size="lg" className="w-full md:w-[220px]" onClick={onClose}>Fechar</Button>
            </div>
          ) : (
            <div className="flex gap-2.5 md:justify-end">
              <Button variant="outline" className="w-[110px] md:w-[120px]" onClick={onClose}>Cancelar</Button>
              <Button
                size="lg"
                className="flex-1 md:flex-none md:w-[220px]"
                disabled={salvando || carregando}
                onClick={salvar}
              >
                {salvando
                  ? 'Salvando...'
                  : registroExistente ? 'Atualizar' : 'Salvar registro'}
                {!salvando && <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />}
              </Button>
            </div>
          )}
        </footer>
      </div>
    </div>
  )
}

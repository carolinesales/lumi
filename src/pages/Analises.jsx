import { useEffect, useState }   from 'react'
import { useNavigate }           from 'react-router-dom'
import {
  collection, doc, getDocs, limit,
  onSnapshot, orderBy, query,
} from 'firebase/firestore'

import { db }                   from '@/lib/firebase'
import { useAuth }              from '@/contexts/AuthContext'
import { useIdioma }            from '@/contexts/IdiomaContext'
import AppShell                 from '@/components/lumi/AppShell'
import { EVENTOS_CAPILARES }    from '@/lib/reavaliacaoService'
import { cn }                   from '@/lib/utils'
import ilustracaoDicas          from '@/assets/Financial Analyst.png'

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


// ─── i18n helper ──────────────────────────────────────────────────────────────
// Usa o sistema de tradução do app; cai no fallback (PT) se a chave ainda não existe.
function useTr() {
  const { t, idioma } = useIdioma()
  const tr = (key, fallback) => {
    if (!key) return fallback
    const v = t(key)
    return (!v || v === key) ? fallback : v
  }
  return { tr, idioma }
}

// ─── Helpers de data ──────────────────────────────────────────────────────────

function diasAtras(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split('T')[0]
  })
}

const DIAS_90 = diasAtras(90)
const DIAS_7  = diasAtras(7)

const FILTROS = [
  { id: '7',  total: 7  },
  { id: '30', total: 30 },
  { id: '90', total: 90 },
]
function filtroLabel(tr, id) {
  return id === '7' ? tr('ana_7d', '7 dias') : id === '30' ? tr('ana_30d', '30 dias') : tr('ana_90d', '90 dias')
}

function dataHoje() { return new Date().toISOString().split('T')[0] }

// ─── Paleta ───────────────────────────────────────────────────────────────────

const TREATMENTS = {
  Hidratação:   { icon: 'fa-droplet',   hex: '#5B9EBF', soft: '#DCE7EF' },
  Nutrição:     { icon: 'fa-leaf',      hex: '#C9A227', soft: '#FBF3D6' },
  Reconstrução: { icon: 'fa-gem',       hex: '#8B6FC4', soft: '#E5DEF2' },
  Umectação:    { icon: 'fa-oil-can',   hex: '#C4A033', soft: '#EFE8D2' },
  Detox:        { icon: 'fa-sparkles',  hex: '#8B6FC4', soft: '#E5DEF2' },
  Lavagem:      { icon: 'fa-pump-soap', hex: '#7A9299', soft: '#E2E8E9' },
}
function getTreatment(tipo) { return TREATMENTS[tipo] ?? TREATMENTS.Hidratação }

// Escala de bem-estar
const SAGE      = '#5E8C6A'
const TERRACOTA = '#C08457'

const SONO_NIVEL    = { otimo: 5, bom: 3, ruim: 1 }
const SONO_KEY      = { otimo: ['ana_sono_otima', 'ótima'], bom: ['ana_sono_regular', 'regular'], ruim: ['ana_sono_baixa', 'baixa'] }
const ESTRESSE_NIVEL = { baixo: 1, medio: 3, alto: 5 }
const ESTRESSE_KEY   = { baixo: ['ana_estr_baixo', 'baixo'], medio: ['ana_estr_medio', 'médio'], alto: ['ana_estr_alto', 'alto'] }
const HUMOR_NIVEL   = { otimo: 5, bom: 4, neutro: 3, ruim: 2, pessimo: 1 }
const HUMOR_KEY     = { otimo: ['ana_humor_otimo', 'Ótimo'], bom: ['ana_humor_bem', 'Bem'], neutro: ['ana_humor_neutro', 'Neutro'], ruim: ['ana_humor_ruim', 'Ruim'], pessimo: ['ana_humor_cansada', 'Muito cansada'] }

const EVENTOS_NEGATIVOS = ['corte_quimico', 'quimica', 'coloracao', 'descoloracao', 'calor', 'queda']

// Tradução dos rótulos de evento capilar só na Análises (não toca no service).
// Mantém o fallback PT igual ao label original de EVENTOS_CAPILARES.
const EVENTO_KEY = {
  corte:         ['ana_ev_corte', 'Cortei o cabelo'],
  corte_pontas:  ['ana_ev_corte_pontas', 'Cortei pontas danificadas'],
  corte_quimico: ['ana_ev_corte_quimico', 'Tive corte químico'],
  quimica:       ['ana_ev_quimica', 'Fiz química'],
  coloracao:     ['ana_ev_coloracao', 'Mudei a cor'],
  descoloracao:  ['ana_ev_descoloracao', 'Descolori os fios'],
  calor:         ['ana_ev_calor', 'Usei muito calor'],
  piscina_mar:   ['ana_ev_piscina_mar', 'Piscina ou mar'],
  produto_novo:  ['ana_ev_produto_novo', 'Usei produto novo'],
  queda:         ['ana_ev_queda', 'Notei mais queda'],
  couro:         ['ana_ev_couro', 'Couro cabeludo mudou'],
  nada:          ['ana_ev_nada', 'Nada diferente'],
}

function scoreCor(v) {
  if (v >= 80) return '#5EA06A'
  if (v >= 60) return '#5B9EBF'
  if (v >= 40) return '#C4A033'
  if (v  > 0)  return '#C47A52'
  return '#9A9A9A'
}

// ─── Card base ────────────────────────────────────────────────────────────────
// `filter`: nó do filtro de período. No mobile vai acima do card (largura total);
// no desktop fica no canto do header.

function Card({ title, subtitle, filter, filterCompact, children, className }) {
  return (
    <div className="flex flex-col gap-3">
      {filter && (
        <div className="sm:hidden">{filter}</div>
      )}
      <div className={cn('flex flex-col gap-6 rounded-[24px] bg-surface p-6', className)}>
        {(title || filterCompact) && (
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              {title && <p className="font-['Montserrat'] text-base font-semibold text-text">{title}</p>}
              {subtitle && <p className="font-['Nunito_Sans'] text-sm leading-5 text-text-secondary">{subtitle}</p>}
            </div>
            {filterCompact && <div className="hidden shrink-0 sm:block">{filterCompact}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

// Segmented control de período — mesmo design do filtro da Rotina (Mês/Semana/Dia)
function FiltroPeriodo({ tr, filtro, setFiltro, full }) {
  return (
    <div
      className={cn('flex items-center rounded-full bg-surface-subtle p-[3px]', full && 'w-full')}
      role="group"
      aria-label={tr('ana_filtrar_periodo', 'Filtrar período')}
    >
      {FILTROS.map(f => {
        const ativo = filtro.id === f.id
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f)}
            aria-pressed={ativo}
            className={cn(
              "rounded-full py-2 font-['Nunito_Sans'] text-sm font-semibold transition",
              full ? 'flex-1' : 'px-3.5',
              ativo ? 'bg-surface text-text shadow-sm' : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {filtroLabel(tr, f.id)}
          </button>
        )
      })}
    </div>
  )
}

// Barra de 5 segmentos (bem-estar)
function SegBar({ nivel, cor }) {
  return (
    <div className="flex w-full gap-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-surface-subtle">
          <div className="h-full rounded-full transition-all" style={{ width: i <= nivel ? '100%' : '0%', background: cor }} />
        </div>
      ))}
    </div>
  )
}

// ─── Gráfico de linha do Lumi Score ──────────────────────────────────────────

function LumiScoreChart({ pontos, idioma, tr }) {
  const [hover, setHover] = useState(null)
  if (pontos.length < 2) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <p className="font-['Nunito_Sans'] text-sm text-text-tertiary text-center px-6">
          {tr('ana_score_vazio', 'Faça uma nova avaliação para ver a evolução ao longo do tempo.')}
        </p>
      </div>
    )
  }

  const W = 460, H = 200
  const padL = 28, padR = 14, padT = 16, padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const yTicks = [0, 25, 50, 75, 100]
  const yFor = v => padT + plotH - (v / 100) * plotH
  const xFor = i => padL + (i / (pontos.length - 1)) * plotW
  const coords = pontos.map((p, i) => ({ x: xFor(i), y: yFor(p.score), ...p }))

  function suave(pts) {
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2
      const cp1x = p1.x + (p2.x - p0.x) / 6, cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6, cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
    return d
  }

  const linePath = suave(coords)
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${padT + plotH} L ${coords[0].x.toFixed(1)} ${padT + plotH} Z`
  const passo = Math.ceil(pontos.length / 5)
  const locale = idioma === 'en' ? 'en-US' : 'pt-BR'

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={tr('ana_evolucao_titulo', 'Evolução do Lumi Score')}>
        <defs>
          <linearGradient id="lumiScoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B9EBF" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#5B9EBF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map(v => (
          <g key={v}>
            <line x1={padL} y1={yFor(v)} x2={W - padR} y2={yFor(v)} stroke="rgba(150,150,150,0.18)" strokeWidth="1" />
            <text x={padL - 8} y={yFor(v) + 3} textAnchor="end" fontFamily="Nunito Sans, sans-serif" fontSize="9" fill="currentColor" className="text-text-tertiary">{v}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#lumiScoreGrad)" />
        <path d={linePath} fill="none" stroke="#5B9EBF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={hover === i ? 5.5 : (i === coords.length - 1 ? 4 : 3)} fill="#5B9EBF" stroke="var(--surface, #fff)" strokeWidth="1.5" />
            <rect x={c.x - plotW / (pontos.length * 2)} y={padT} width={plotW / pontos.length} height={plotH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          </g>
        ))}
        {coords.map((c, i) => (
          (i % passo === 0 || i === coords.length - 1) && (
            <text key={i} x={c.x} y={H - 8} textAnchor="middle" fontFamily="Nunito Sans, sans-serif" fontSize="9" fill="currentColor" className="text-text-tertiary">
              {new Date(c.iso + 'T12:00:00').toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
            </text>
          )
        ))}
        {hover !== null && (
          <line x1={coords[hover].x} y1={padT} x2={coords[hover].x} y2={padT + plotH} stroke="#5B9EBF" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        )}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-center"
          style={{ left: `${(coords[hover].x / W) * 100}%`, top: `${(coords[hover].y / H) * 100}%` }}>
          <div className="font-['Montserrat'] text-sm font-semibold text-white">{coords[hover].score}</div>
          <div className="font-['Nunito_Sans'] text-[10px] text-white/60">
            {new Date(coords[hover].iso + 'T12:00:00').toLocaleDateString(locale, { day: '2-digit', month: 'short' })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Seção: Consistência ──────────────────────────────────────────────────────

function SecaoConsistencia({ registros, tr }) {
  const [filtro, setFiltro] = useState(FILTROS[1])
  const dias            = diasAtras(filtro.total)
  const diasRegistrados = dias.filter(d => registros[d])
  const pct             = Math.round((diasRegistrados.length / filtro.total) * 100)
  const diasGrade       = dias.slice(-30)

  return (
    <Card
      title={tr('ana_consistencia_titulo', 'Consistência da rotina')}
      subtitle={tr('ana_consistencia_sub', 'Frequência com que você registrou sua rotina no período.')}
      filter={<FiltroPeriodo tr={tr} filtro={filtro} setFiltro={setFiltro} full />}
      filterCompact={<FiltroPeriodo tr={tr} filtro={filtro} setFiltro={setFiltro} />}
    >
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <span className="font-['Nunito_Sans'] text-4xl font-semibold leading-none text-text">{pct}%</span>
        <span className="font-['Nunito_Sans'] text-sm text-text-secondary">
          {tr('ana_dias_registrados', '{n} de {total} dias registrados')
            .replace('{n}', diasRegistrados.length)
            .replace('{total}', filtro.total)}
        </span>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {diasGrade.map(dia => {
          const isHoje = dia === dataHoje()
          const temReg = !!registros[dia]
          return (
            <div key={dia} title={dia}
              className={cn(
                'aspect-square w-full rounded',
                temReg ? 'bg-state-positive' : 'bg-surface-subtle',
                isHoje && 'ring-2 ring-state-positive ring-offset-1 ring-offset-surface',
              )} />
          )
        })}
      </div>
    </Card>
  )
}

// ─── Seção: Evolução do Lumi Score ───────────────────────────────────────────

function SecaoEvolucao({ scores, tendencia, idioma, tr }) {
  const [filtro, setFiltro] = useState(FILTROS[0])
  const corte = diasAtras(filtro.total)[0]
  const pontos = [...scores]
    .map(s => ({ score: s.pontuacao, iso: (s.dataRegistro?.toDate?.() ?? new Date()).toISOString().split('T')[0] }))
    .filter(p => p.iso >= corte)
    .sort((a, b) => a.iso.localeCompare(b.iso))

  const scoreAtual = scores[0]?.pontuacao ?? 0
  const cor = scoreCor(scoreAtual)
  const pontoLabel = Math.abs(tendencia) === 1 ? tr('ana_ponto', 'ponto') : tr('ana_pontos', 'pontos')

  return (
    <Card
      title={tr('ana_evolucao_titulo', 'Evolução do Lumi Score')}
      subtitle={tr('ana_evolucao_sub', 'Acompanhe como seu score mudou ao longo dos últimos registros.')}
      filter={<FiltroPeriodo tr={tr} filtro={filtro} setFiltro={setFiltro} full />}
      filterCompact={<FiltroPeriodo tr={tr} filtro={filtro} setFiltro={setFiltro} />}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="font-['Montserrat'] text-[44px] font-light leading-none" style={{ color: cor }}>{scoreAtual}</span>
          <span className="font-['Nunito_Sans'] text-base text-text-tertiary">/ 100</span>
        </div>
        {tendencia !== null && (
          <div className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1.5',
            tendencia >= 0 ? 'bg-state-positive-soft' : 'bg-state-negative-soft',
          )}>
            <i className={cn('fa-solid text-xs', tendencia >= 0 ? 'fa-arrow-trend-up text-state-positive' : 'fa-arrow-trend-down text-state-negative')} aria-hidden="true" />
            <span className={cn('font-["Nunito_Sans"] text-sm font-semibold', tendencia >= 0 ? 'text-state-positive' : 'text-state-negative')}>
              {tendencia >= 0 ? '+' : ''}{tendencia} {pontoLabel}
            </span>
            <span className="font-['Nunito_Sans'] text-xs text-text-secondary">{tr('ana_vs_anterior', 'vs. anterior')}</span>
          </div>
        )}
      </div>
      <LumiScoreChart pontos={pontos} idioma={idioma} tr={tr} />
    </Card>
  )
}

// ─── Seção: Eventos capilares ─────────────────────────────────────────────────

function SecaoEventos({ registros, tr }) {
  const contagem = {}
  Object.values(registros).forEach(r => {
    const evs = r?.eventosCapilares ?? []
    if (!Array.isArray(evs)) return
    evs.filter(id => id !== 'nada').forEach(id => { contagem[id] = (contagem[id] ?? 0) + 1 })
  })
  const lista = Object.entries(contagem)
    .map(([id, qtd]) => {
      const meta = EVENTOS_CAPILARES.find(e => e.id === id)
      const [chave, fb] = EVENTO_KEY[id] ?? [null, meta?.label ?? id]
      return { id, qtd, label: tr(chave, fb), icon: meta?.icon ?? 'fa-circle' }
    })
    .sort((a, b) => b.qtd - a.qtd)

  if (lista.length === 0) return null

  return (
    <Card
      title={tr('ana_eventos_titulo', 'Eventos capilares no período')}
      subtitle={tr('ana_eventos_sub', 'Procedimentos, mudanças e situações que podem influenciar a evolução do seu cabelo.')}
    >
      <div className="flex flex-wrap gap-4">
        {lista.map(({ id, qtd, label, icon }) => (
          <div key={id} className="flex h-10 items-center justify-center gap-1 rounded-full bg-surface-subtle py-3 pl-1 pr-2.5">
            <div className="flex size-8 items-center justify-center rounded-full bg-ink p-[5px]">
              <i className={cn('fa-solid text-[13px] text-white', icon)} aria-hidden="true" />
            </div>
            <span className="font-['Nunito_Sans'] text-sm font-medium text-text">{label}</span>
            {qtd > 1 && (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-paper-200 px-1 font-['Nunito_Sans'] text-[11px] font-bold text-text-secondary">{qtd}</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Seção: Dicas Lumi ────────────────────────────────────────────────────────

function SecaoDicas({ navigate, tr }) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-[16px] bg-surface p-6">
      <div className="flex w-full flex-col items-center gap-2">
        <img src={ilustracaoDicas} alt="" aria-hidden="true" className="size-[200px] object-contain" />
        <div className="flex w-full flex-col gap-2">
          <p className="font-['Montserrat'] text-base font-semibold text-text">{tr('ana_dicas_titulo', 'Dicas Lumi')}</p>
          <p className="font-['Nunito_Sans'] text-sm leading-5 text-text-secondary">
            {tr('ana_dicas_texto', 'Quanto mais você registra sua rotina, mais precisas ficam suas análises e recomendações. Que tal registrar hoje?')}
          </p>
        </div>
      </div>
      <button type="button" onClick={() => navigate('/app/home')}
        className="w-full rounded-[24px] bg-ink py-3 font-['Nunito_Sans'] text-sm font-semibold text-white transition hover:opacity-90">
        {tr('ana_registrar_rotina', 'Registrar rotina')}
      </button>
    </div>
  )
}

// ─── Seção: Aderência por cuidado ─────────────────────────────────────────────

function SecaoAderencia({ etapas, tr }) {
  const porTipo = {}
  etapas.forEach(e => {
    const tipo = e.tipoCuidado ?? 'Outro'
    if (!porTipo[tipo]) porTipo[tipo] = { total: 0, done: 0 }
    porTipo[tipo].total++
    if (e.concluida) porTipo[tipo].done++
  })

  const lista = Object.entries(porTipo)
    .map(([tipo, v]) => ({ tipo, pct: v.total ? Math.round((v.done / v.total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct)

  if (lista.length === 0) return null

  const menor = lista[lista.length - 1]

  return (
    <Card
      title={tr('ana_aderencia_titulo', 'Aderência por cuidado')}
      subtitle={tr('ana_aderencia_sub', 'Veja quais tipos de cuidado você concluiu com mais frequência.')}
    >
      <div className="flex flex-col gap-8 pb-2">
        {lista.map(({ tipo, pct }) => {
          const t = getTreatment(tipo)
          return (
            <div key={tipo} className="flex flex-col gap-2">
              <div className="flex items-start gap-4">
                <span className="flex-1 font-['Nunito_Sans'] text-sm font-semibold text-text">{labelTipo(tipo, tr)}</span>
                <span className="font-['Nunito_Sans'] text-xs text-text-secondary">{pct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded bg-surface-subtle">
                <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: t.hex }} />
              </div>
            </div>
          )
        })}
      </div>

      {menor && menor.pct < 70 && (
        <div className="flex items-center justify-center rounded-[8px] bg-treatment-hydration-soft p-3.5">
          <div className="flex flex-1 flex-col gap-2">
            <p className="font-['Nunito_Sans'] text-sm font-semibold text-text">{tr('ana_insight', 'Insight Lumi')}</p>
            <p className="font-['Nunito_Sans'] text-sm text-text-secondary">
              {tr('ana_insight_texto', 'Você concluiu menos {tipo} neste período. Que tal incluir esse cuidado na sua rotina?')
                .replace('{tipo}', menor.tipo.toLowerCase())}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

// ─── Seção: Hábitos e bem-estar ───────────────────────────────────────────────

function HabitoRow({ icon, titulo, descricao, nivel, cor }) {
  return (
    <div className="flex items-center gap-6">
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-ink p-3">
        <i className={cn('fa-solid text-base text-white', icon)} aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="font-['Nunito_Sans'] text-sm font-semibold text-text">{titulo}</p>
          <p className="font-['Nunito_Sans'] text-xs text-text-secondary">{descricao}</p>
        </div>
        <SegBar nivel={nivel} cor={cor} />
      </div>
    </div>
  )
}

function SecaoHabitos({ registros, tr }) {
  function maisFrequente(campo) {
    const cont = {}
    DIAS_7.forEach(d => {
      const v = registros[d]?.[campo]
      if (v) cont[v] = (cont[v] ?? 0) + 1
    })
    const ord = Object.entries(cont).sort((a, b) => b[1] - a[1])
    return ord[0]?.[0] ?? null
  }

  const sono     = maisFrequente('sono')
  const estresse = maisFrequente('estresse')
  const humor    = maisFrequente('humor')

  if (!sono && !estresse && !humor) return null

  const sonoTxt     = sono     ? tr(...(SONO_KEY[sono] ?? [null, sono])) : ''
  const estresseTxt = estresse ? tr(...(ESTRESSE_KEY[estresse] ?? [null, estresse])) : ''
  const humorTxt    = humor    ? tr(...(HUMOR_KEY[humor] ?? [null, humor])) : ''

  return (
    <Card
      title={tr('ana_habitos_titulo', 'Hábitos e bem-estar')}
      subtitle={tr('ana_habitos_sub', 'Acompanhe sinais da sua rotina que podem impactar a saúde dos fios.')}
    >
      <div className="flex flex-col gap-6">
        {sono && (
          <HabitoRow icon="fa-moon" titulo={tr('ana_sono', 'Sono')} descricao={`${tr('ana_qualidade', 'Qualidade')}: ${sonoTxt}`}
            nivel={SONO_NIVEL[sono] ?? 0} cor={SAGE} />
        )}
        {estresse && (
          <HabitoRow icon="fa-bolt" titulo={tr('ana_estresse', 'Estresse')} descricao={`${tr('ana_nivel', 'Nível')}: ${estresseTxt}`}
            nivel={ESTRESSE_NIVEL[estresse] ?? 0} cor={TERRACOTA} />
        )}
        {humor && (
          <HabitoRow icon="fa-face-smile" titulo={tr('ana_humor', 'Humor')} descricao={`${tr('ana_mais_frequente', 'Mais frequente')}: ${humorTxt}`}
            nivel={HUMOR_NIVEL[humor] ?? 0} cor={SAGE} />
        )}
      </div>
    </Card>
  )
}

// ─── Estado vazio ─────────────────────────────────────────────────────────────

function EmptyAnalises({ navigate, tr }) {
  return (
    <div className="mt-2 flex flex-col items-center gap-6 rounded-3xl bg-surface px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink text-white">
        <i className="fa-solid fa-chart-line text-lg" aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-['Montserrat'] text-xl font-semibold text-text">{tr('ana_vazio_titulo', 'Suas análises aparecem aqui')}</h2>
        <p className="mx-auto mt-2 max-w-md font-['Nunito_Sans'] text-sm leading-6 text-text-secondary">
          {tr('ana_vazio_texto', 'Faça seu diagnóstico e registre sua rotina para acompanhar a evolução do seu Lumi Score, hábitos e ciclo capilar.')}
        </p>
      </div>
      <button type="button" onClick={() => navigate('/questionario')}
        className="rounded-full bg-ink px-6 py-3 font-['Nunito_Sans'] text-sm font-semibold text-white transition hover:opacity-90">
        {tr('ana_fazer_diagnostico', 'Fazer diagnóstico')}
      </button>
    </div>
  )
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="flex flex-col gap-6 xl:w-[738px]">
        <div className="h-44 animate-pulse rounded-[24px] bg-surface" />
        <div className="h-72 animate-pulse rounded-[24px] bg-surface" />
        <div className="h-40 animate-pulse rounded-[24px] bg-surface" />
      </div>
      <div className="flex flex-1 flex-col gap-6">
        <div className="h-72 animate-pulse rounded-[16px] bg-surface" />
        <div className="h-80 animate-pulse rounded-[24px] bg-surface" />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Analises() {
  const { user }   = useAuth()
  const { tr, idioma } = useTr()
  const navigate   = useNavigate()

  const [, setPerfil]         = useState(null)
  const [scores,    setScores]    = useState([])
  const [registros, setRegistros] = useState({})
  const [etapas,    setEtapas]    = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    const unsub = onSnapshot(doc(db, 'usuarios', uid), s => setPerfil(s.exists() ? s.data() : null))

    async function carregar() {
      const sSnap = await getDocs(query(collection(db, 'usuarios', uid, 'hair_scores'), orderBy('dataRegistro', 'desc'), limit(20)))
      setScores(sSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const allRegs = await getDocs(collection(db, 'usuarios', uid, 'registros'))
      const regs = {}
      allRegs.docs.forEach(d => { if (DIAS_90.includes(d.id)) regs[d.id] = d.data() })
      setRegistros(regs)

      const cSnap = await getDocs(query(collection(db, 'usuarios', uid, 'cronogramas'), orderBy('dataInicio', 'desc'), limit(1)))
      if (!cSnap.empty) {
        const cronId = cSnap.docs[0].id
        const eSnap  = await getDocs(collection(db, 'usuarios', uid, 'cronogramas', cronId, 'etapas'))
        setEtapas(eSnap.docs.map(d => ({ id: d.id, cronogramaId: cronId, ...d.data() })))
      }
      setLoading(false)
    }
    carregar()
    return () => unsub()
  }, [user])

  const scoreAtual    = scores[0]?.pontuacao ?? 0
  const scoreAnterior = scores[1]?.pontuacao ?? null
  const tendencia     = scoreAnterior !== null ? scoreAtual - scoreAnterior : null

  const temRegistros = Object.keys(registros).length > 0
  const semDados     = scores.length === 0 && !temRegistros && etapas.length === 0

  return (
    <AppShell>
      <main className="min-h-screen bg-surface-muted px-4 pb-28 pt-5 sm:px-6 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="mx-auto max-w-[1320px]">

          <header className="mb-5 sm:mb-8">
            <h1 className="font-['Montserrat'] text-xl font-semibold leading-[40px] text-text sm:text-2xl">{tr('ana_titulo', 'Análises')}</h1>
            <p className="mt-1 font-['Nunito_Sans'] text-sm leading-5 text-text-secondary">
              {tr('ana_subtitulo', 'Acompanhe sua evolução capilar com base nos registros, cuidados concluídos e hábitos da sua rotina.')}
            </p>
          </header>

          {loading ? (
            <LoadingSkeleton />
          ) : semDados ? (
            <EmptyAnalises navigate={navigate} tr={tr} />
          ) : (
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">

              {/* Coluna principal */}
              <div className="flex flex-col gap-6 xl:w-[738px]">
                {temRegistros && <SecaoConsistencia registros={registros} tr={tr} />}
                {scores.length > 0 && <SecaoEvolucao scores={scores} tendencia={tendencia} idioma={idioma} tr={tr} />}
                {temRegistros && <SecaoEventos registros={registros} tr={tr} />}
              </div>

              {/* Coluna lateral */}
              <div className="flex flex-1 flex-col gap-6">
                <SecaoDicas navigate={navigate} tr={tr} />
                {etapas.length > 0 && <SecaoAderencia etapas={etapas} tr={tr} />}
                {temRegistros && <SecaoHabitos registros={registros} tr={tr} />}
              </div>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  )
}

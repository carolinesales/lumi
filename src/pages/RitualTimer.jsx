// src/pages/RitualTimer.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS_COM_PAUSA = ['Hidratação', 'Nutrição', 'Reconstrução', 'Umectação']

const HINT_POR_TIPO = {
  Hidratação:   'Máscaras hidratantes agem melhor entre 5 e 15 min. Respeite o tempo indicado no produto.',
  Nutrição:     'Óleos nutritivos agem melhor entre 15 e 30 min. Pode usar touca térmica para potencializar.',
  Reconstrução: 'Tratamentos reconstrutores pedem entre 15 e 20 min. Não ultrapasse o tempo indicado.',
  Umectação:    'A umectação com óleos funciona melhor entre 20 e 30 min. Pode deixar agindo por mais tempo.',
}

const DEFAULT_MIN_POR_TIPO = {
  Hidratação: 10, Nutrição: 15, Reconstrução: 20, Umectação: 30,
}

const MIN_MINUTOS = 3
const MAX_MINUTOS = 30

function pad(n)          { return String(Math.floor(n)).padStart(2, '0') }
function formatTimer(s)  { return `${pad(s / 60)}:${pad(s % 60)}` }

export function temPausa(tipoCuidado) {
  return TIPOS_COM_PAUSA.includes(tipoCuidado)
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function RitualTimer({ tipoCuidado, onContinuar, onPular }) {
  const defaultMin = DEFAULT_MIN_POR_TIPO[tipoCuidado] ?? 10

  const [minutos,           setMinutos]           = useState(defaultMin)
  const [segundosRestantes, setSegundosRestantes] = useState(defaultMin * 60)
  const [estado,            setEstado]            = useState('ajuste') // ajuste|rodando|pausado|zerou
  const [tempoReal,         setTempoReal]         = useState(0)

  const intervalRef = useRef(null)

  const totalSegundos = minutos * 60
  const progresso     = estado === 'ajuste' ? minutos / MAX_MINUTOS : 1 - segundosRestantes / totalSegundos
  const circumference = 2 * Math.PI * 54
  const offset        = circumference * (1 - progresso)
  const sliderPct     = ((minutos - MIN_MINUTOS) / (MAX_MINUTOS - MIN_MINUTOS)) * 100

  const pararInterval = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  useEffect(() => () => pararInterval(), [pararInterval])

  function tick() {
    intervalRef.current = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          pararInterval(); setEstado('zerou')
          if (navigator.vibrate) navigator.vibrate([200, 100, 200])
          return 0
        }
        return prev - 1
      })
      setTempoReal(t => t + 1)
    }, 1000)
  }

  function iniciar()   { setEstado('rodando');  tick() }
  function pausar()    { pararInterval();        setEstado('pausado') }
  function retomar()   { setEstado('rodando');  tick() }
  function reiniciar() { pararInterval(); setSegundosRestantes(minutos * 60); setTempoReal(0); setEstado('ajuste') }

  function ajustarMinutos(v) {
    const c = Math.min(MAX_MINUTOS, Math.max(MIN_MINUTOS, v))
    setMinutos(c); setSegundosRestantes(c * 60)
  }

  const zerou   = estado === 'zerou'
  const rodando = estado === 'rodando'
  const pausado = estado === 'pausado'
  const ajuste  = estado === 'ajuste'

  // Cores dinâmicas do timer
  const corPrincipal = zerou ? '#5DCAA5' : '#fff'
  const corSub       = zerou ? 'rgba(93,202,165,.5)' : 'rgba(255,255,255,.28)'
  const corRing      = zerou ? '#5DCAA5' : rodando ? '#fff' : 'rgba(255,255,255,.25)'

  return (
    <div className="flex min-h-screen select-none flex-col bg-[#111110] font-nunito">
      <style>{`
        .timer-slider{-webkit-appearance:none;appearance:none;width:100%;height:3px;border-radius:999px;outline:none;border:none;cursor:pointer;transition:opacity .2s}
        .timer-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;cursor:pointer;box-shadow:0 0 0 3px rgba(255,255,255,.12);transition:transform .15s}
        .timer-slider:active::-webkit-slider-thumb{transform:scale(1.2)}
        .timer-slider:disabled{opacity:.25;cursor:default}
        @keyframes pulseGreen{0%{box-shadow:0 0 0 0 rgba(93,202,165,.4)}70%{box-shadow:0 0 0 16px rgba(93,202,165,0)}100%{box-shadow:0 0 0 0 rgba(93,202,165,0)}}
      `}</style>

      {/* Nav */}
      <div className="flex items-center justify-between px-6 pb-4 pt-[52px]">
        <button
          type="button"
          onClick={onPular}
          className="flex items-center gap-0.5 bg-transparent p-0 font-nunito text-sm text-white/40 transition hover:text-white/70"
        >
          <span className="text-base">‹</span> Voltar
        </button>
        <span className="font-nunito text-[10px] font-bold tracking-[.15em] text-white/25">
          {tipoCuidado.toUpperCase()}
        </span>
      </div>

      {/* Estado */}
      <div className="px-6 pt-2 text-center">
        <p className={cn('text-sm transition-colors duration-300', zerou ? 'text-[#5DCAA5]' : 'text-white/50')}>
          {ajuste  && 'Quanto tempo o produto pede?'}
          {rodando && 'Tempo restante'}
          {pausado && 'Pausado'}
          {zerou   && 'Pronto.'}
        </p>
      </div>

      {/* Ring */}
      <div className="relative mx-auto mb-2 mt-6 flex h-[132px] w-[132px] items-center justify-center">
        <svg width="132" height="132" viewBox="0 0 132 132">
          <circle cx="66" cy="66" r="54" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="6" />
          <circle
            cx="66" cy="66" r="54" fill="none"
            stroke={corRing} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 66 66)"
            style={{ transition: 'stroke-dashoffset .8s ease, stroke .4s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center gap-1 text-center">
          <span
            className="font-heading text-[32px] font-medium leading-none tracking-[-0.04em] transition-colors duration-300"
            style={{ color: corPrincipal, animation: zerou ? 'pulseGreen 1s ease' : 'none' }}
          >
            {formatTimer(ajuste ? minutos * 60 : segundosRestantes)}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-[.1em] transition-colors duration-300"
            style={{ color: corSub }}
          >
            {ajuste  && 'minutos'}
            {rodando && 'restantes'}
            {pausado && 'pausado'}
            {zerou   && 'concluído'}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className={cn(
        'flex flex-col gap-1.5 px-7 pt-4 transition-opacity duration-300',
        ajuste ? 'opacity-100' : 'opacity-[.22]',
      )}>
        <div className="flex justify-between">
          <span className="font-nunito text-[11px] text-white/[.22]">{MIN_MINUTOS} min</span>
          <span className="font-nunito text-[11px] text-white/[.22]">{MAX_MINUTOS} min</span>
        </div>
        <input
          type="range"
          className="timer-slider"
          min={MIN_MINUTOS} max={MAX_MINUTOS} step={1}
          value={minutos}
          disabled={!ajuste}
          onChange={e => ajustarMinutos(Number(e.target.value))}
          style={{ background: `linear-gradient(to right, rgba(255,255,255,.7) ${sliderPct}%, rgba(255,255,255,.12) 0%)` }}
        />
        <p className="text-center font-nunito text-xs font-semibold text-white/45">{minutos} minutos</p>
      </div>

      {/* Hint */}
      <div className={cn(
        'min-h-[52px] px-7 pt-3.5 text-center transition-opacity duration-500',
        zerou ? 'opacity-0' : 'opacity-100',
      )}>
        {(ajuste) && (
          <p className="font-nunito text-xs leading-relaxed text-white/[.28]">
            {HINT_POR_TIPO[tipoCuidado] ?? 'Respeite o tempo indicado na embalagem do produto.'}
          </p>
        )}
        {(rodando || pausado) && (
          <p className="font-nunito text-xs leading-relaxed text-white/[.28]">
            Pode pousar o celular — o timer continua rodando.
          </p>
        )}
        {zerou && (
          <p className="font-nunito text-xs leading-relaxed text-[rgba(93,202,165,.5)]">
            Enxágue os fios e vamos registrar.
          </p>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="mt-auto flex flex-col gap-2 px-6 pb-10 pt-4">
        {ajuste && (
          <>
            <button type="button" onClick={iniciar}
              className="h-[52px] w-full rounded-full bg-white font-nunito text-[15px] font-bold text-[#111110] transition hover:opacity-90 active:scale-[.98]">
              ▶ Iniciar {minutos} min
            </button>
            <button type="button" onClick={onPular}
              className="h-9 w-full bg-transparent font-nunito text-sm text-white/20 transition hover:text-white/40">
              Pular pausa
            </button>
          </>
        )}

        {rodando && (
          <>
            <button type="button" onClick={pausar}
              className="h-12 w-full rounded-full border border-white/10 bg-white/[.06] font-nunito text-sm font-semibold text-white/55 transition hover:bg-white/10">
              ⏸ Pausar
            </button>
            <button type="button" onClick={onPular}
              className="h-9 w-full bg-transparent font-nunito text-sm text-white/20 transition hover:text-white/40">
              Pular pausa
            </button>
          </>
        )}

        {pausado && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={retomar}
                className="h-12 rounded-full border border-white/10 bg-white/[.06] font-nunito text-sm font-semibold text-white/55 transition hover:bg-white/10">
                ▶ Retomar
              </button>
              <button type="button" onClick={reiniciar}
                className="h-12 rounded-full border border-white/10 bg-white/[.06] font-nunito text-xs font-semibold text-white/55 transition hover:bg-white/10">
                ↺ Reiniciar
              </button>
            </div>
            <button type="button" onClick={onPular}
              className="h-9 w-full bg-transparent font-nunito text-sm text-white/20 transition hover:text-white/40">
              Pular pausa
            </button>
          </>
        )}

        {zerou && (
          <>
            <button type="button" onClick={() => onContinuar(tempoReal)}
              className="lumi-animate-in h-[52px] w-full rounded-full bg-[#5DCAA5] font-nunito text-[15px] font-bold text-[#04342C] transition hover:opacity-90 active:scale-[.98]">
              Continuar →
            </button>
            <button type="button" onClick={reiniciar}
              className="h-9 w-full bg-transparent font-nunito text-sm text-[rgba(93,202,165,.3)] transition hover:text-[rgba(93,202,165,.6)]">
              Reiniciar timer
            </button>
          </>
        )}
      </div>
    </div>
  )
}
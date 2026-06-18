// src/features/hairScore/components/HairScoreCard.jsx

import { useEffect, useRef, useState } from 'react'
import { getHairScoreDeltaMeta } from '../utils/hairScore.utils'
import { useIdioma } from '@/contexts/IdiomaContext'

const SCORE_THEME = {
  fragil: {
    cardBg: 'radial-gradient(133% 102% at 6% 29%, #D4D8DC 0%, #E4E6E8 50%, #D8DADC 100%)',
    mobileBg: 'linear-gradient(160deg, #C8CDD2 0%, #DDE0E3 60%, #EAECEE 100%)',
    ellipse3Border: '#B8BEC4',
    labelColor: 'rgba(30,30,31,0.65)',
    scoreColor: '#1E1E1F',
    btnBg: '#FFFFFF',
    btnColor: '#000000',
  },
  recuperacao: {
    cardBg: 'radial-gradient(133% 102% at 6% 29%, #E8D8D4 0%, #F0E4E0 50%, #EAD8D4 100%)',
    mobileBg: 'linear-gradient(160deg, #DCC0B8 0%, #EDD4CE 60%, #F5E4E0 100%)',
    ellipse3Border: '#D4B8B2',
    labelColor: 'rgba(30,15,12,0.65)',
    scoreColor: '#1E1E1F',
    btnBg: '#FFFFFF',
    btnColor: '#000000',
  },
  evolucao: {
    cardBg: 'radial-gradient(133% 102% at 6% 29%, #DDD8E8 0%, #EAE6F2 50%, #E0DCF0 100%)',
    mobileBg: 'linear-gradient(160deg, #C0B8D8 0%, #D8D4EC 60%, #ECEAF6 100%)',
    ellipse3Border: '#C4BED8',
    labelColor: 'rgba(20,15,30,0.65)',
    scoreColor: '#1E1E1F',
    btnBg: '#FFFFFF',
    btnColor: '#000000',
  },
  saudavel: {
    cardBg: 'radial-gradient(133.37% 102.29% at 6.25% 28.9%, #C8D8E4 0%, #E0E8F0 50%, #D8E4EC 100%)',
    mobileBg: 'linear-gradient(160deg, #8BB5A2 0%, #C8D8E4 60%, #EAEFF3 100%)',
    ellipse3Border: '#B3C3CE',
    labelColor: 'rgba(30,30,31,0.65)',
    scoreColor: '#1E1E1F',
    btnBg: '#FFFFFF',
    btnColor: '#000000',
  },
  excelente: {
    cardBg: 'radial-gradient(133% 102% at 6% 29%, #EDE4CC 0%, #F4EDD8 50%, #EEE4CC 100%)',
    mobileBg: 'linear-gradient(160deg, #C8B478 0%, #DEC88A 60%, #F0DFA8 100%)',
    ellipse3Border: '#D4C488',
    labelColor: 'rgba(30,24,8,0.65)',
    scoreColor: '#1E1E1F',
    btnBg: '#FFFFFF',
    btnColor: '#000000',
  },
}

function getTheme(score) {
  if (score <= 25) return SCORE_THEME.fragil
  if (score <= 50) return SCORE_THEME.recuperacao
  if (score <= 75) return SCORE_THEME.evolucao
  if (score <= 90) return SCORE_THEME.saudavel
  return SCORE_THEME.excelente
}

function AnimatedScore({ value, color }) {
  const [displayed, setDisplayed] = useState(value)
  const rafRef = useRef(null)
  const prevRef = useRef(value)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    if (from === to) return
    const duration = 600
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      else prevRef.current = to
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return <span style={{ color }}>{displayed}</span>
}

export default function HairScoreCard({
  score = 0,
  delta = 0,
  state,
  trend = 'stable',
  message,
  streak,
  fragilidade,
  onUpdateDiagnostic,
  className = '',
}) {
  const theme = getTheme(score)
  const { t } = useIdioma()
  const stateLabel = getScoreMomentLabel({ state, fragilidade, trend, score }, t)
  const stateMessage = getScoreReading({ message, fragilidade, trend, delta, score, state }, t)

  return (
    <>
      <div
        className={['hidden sm:flex', className].join(' ')}
        style={{
          borderRadius: 24,
          background: theme.cardBg,
          padding: "28px 24px",
          alignItems: 'center',
          gap: 24,
          alignSelf: 'stretch',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 96,
          boxShadow: '0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        }}
        role="region"
        aria-label="Lumi Score"
      >
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 64, fontWeight: 600, lineHeight: 1, color: theme.scoreColor }}>
              <AnimatedScore value={score} color={theme.scoreColor} />
            </span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 28, fontWeight: 400, lineHeight: 1, color: theme.scoreColor, opacity: 0.65 }}>
              /100
            </span>
          </div>
          {/* divider */}
          <div aria-hidden style={{ width: 1, height: 48, background: theme.scoreColor, opacity: 0.15, flexShrink: 0 }} />
        </div>

        {/* Text block */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, flex: '1 0 0', minWidth: 0 }}>
          <span style={{ fontFamily: '"Nunito Sans", sans-serif', fontSize: 11, fontWeight: 600, lineHeight: '16px', letterSpacing: '1.4px', textTransform: 'uppercase', color: theme.labelColor }}>
            Lumi Score
          </span>
          <span style={{ fontFamily: '"Nunito Sans", sans-serif', fontSize: 17, fontWeight: 700, lineHeight: '22px', color: theme.scoreColor }}>
            {stateLabel}
          </span>
          <span style={{ fontFamily: '"Nunito Sans", sans-serif', fontSize: 14, fontWeight: 400, lineHeight: '20px', color: theme.scoreColor, opacity: 0.70, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {stateMessage}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={onUpdateDiagnostic}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, padding: '14px 16px', paddingTop: 16, borderRadius: 24,
            background: theme.btnBg, border: 'none', cursor: 'pointer', flexShrink: 0,
            fontFamily: '"Nunito Sans", sans-serif', fontSize: 14, fontWeight: 500,
            lineHeight: '14px', color: theme.btnColor, whiteSpace: 'nowrap',
            transition: 'opacity 0.15s ease, transform 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.98)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
          aria-label="Atualizar diagnóstico capilar"
        >
          {t('hs_atualizar')}
        </button>
      </div>

      <div
        className="sm:hidden -mx-5"
        style={{
          position: 'relative',
          height: 420,
          background: 'var(--surface-muted)',
          overflow: 'hidden',
          marginBottom: 8,
        }}
        role="region"
        aria-label="Lumi Score"
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 845,
            height: 845,
            borderRadius: '50%',
            background: theme.mobileBg,
            top: -478,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />

        
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 891,
            height: 891,
            borderRadius: '50%',
            border: `4.36px solid ${theme.ellipse3Border}`,
            top: -501,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
          }}
        />

        {/* Conteúdo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            paddingBottom: 60,
          }}
        >
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 400, letterSpacing: '1.2px', textTransform: 'uppercase', color: theme.labelColor }}>
            Lumi Score
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 80, fontWeight: 600, lineHeight: 1, color: theme.scoreColor }}>
              <AnimatedScore value={score} color={theme.scoreColor} />
            </span>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 36, fontWeight: 400, lineHeight: 1, color: theme.scoreColor, opacity: 0.65 }}>
              /100
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: '"Nunito Sans", sans-serif', fontSize: 17, fontWeight: 600, color: theme.scoreColor }}>
              {stateLabel}
            </span>
            <span style={{ fontFamily: '"Nunito Sans", sans-serif', fontSize: 14, fontWeight: 400, color: theme.scoreColor, opacity: 0.70, textAlign: 'center', maxWidth: 280 }}>
              {stateMessage}
            </span>
          </div>

          <button
            onClick={onUpdateDiagnostic}
            style={{
              marginTop: 8, padding: '10px 24px', borderRadius: 24,
              background: theme.btnBg, border: 'none', cursor: 'pointer',
              fontFamily: '"Nunito Sans", sans-serif', fontSize: 14,
              fontWeight: 500, color: theme.btnColor,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            aria-label="Atualizar diagnóstico capilar"
          >
            {t('hs_atualizar')}
          </button>
        </div>
      </div>
    </>
  )
}

function getScoreMomentLabel({ state, fragilidade, trend, score }, t) {
  if (fragilidade?.ativa) return t('hs_label_recuperacao')
  if (score <= 25) return t('hs_label_fragilizado')
  if (score <= 50) return t('hs_label_precisa_cuidado')
  if (score <= 75) return t('hs_label_evolucao')
  if (trend === 'up') return t('hs_label_evolucao')
  if (trend === 'down') return t('hs_label_observacao')
  if (state?.id && state.id !== 'neutral') return t('hs_state_' + state.id)
  return t('hs_label_radiante')
}

function getScoreReading({ message, fragilidade, trend, delta, score, state }, t) {
  if (fragilidade?.ativa) return t('hs_read_fragil')
  if (score <= 25) return t('hs_read_baixo')
  if (score <= 50) return t('hs_read_medio')
  if (score <= 75) return t('hs_read_bom')
  if (trend === 'up' || delta > 0) return t('hs_read_subindo')
  if (trend === 'down' || delta < 0) return t('hs_read_descendo')
  return (state?.id && state.id !== 'neutral') ? t('hs_msg_' + state.id) : (message || t('hs_read_radiante'))
}
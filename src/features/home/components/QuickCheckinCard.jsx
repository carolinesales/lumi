// src/features/home/components/QuickCheckinCard.jsx
import { useState } from 'react'

export default function QuickCheckinCard({ regHoje, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const done = !!regHoje

  return (
    <div style={{
      background: '#FFF',
      borderRadius: 24,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
      boxSizing: 'border-box',
    }}>

      {/* ── título + subtítulo ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{
          margin: 0,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          lineHeight: '20px',
          color: '#1E1E1F',
        }}>
          Diário Lumi
        </h3>

        <p style={{
          margin: 0,
          fontFamily: '"Nunito Sans", sans-serif',
          fontSize: 14,
          fontWeight: 400,
          lineHeight: '20px',
          color: '#495059',
        }}>
          {done
            ? 'Seu dia já foi registrado. O Lumi vai usar essas informações para acompanhar padrões e evolução dos seus fios.'
            : 'Um resumo dos cuidados, hábitos e sensações do seu dia.'}
        </p>
      </div>

      {/* ── botão ── */}
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={done ? 'Abrir registro do dia' : 'Registrar meu dia'}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '12px 16px',
          background: '#1E1E1F',
          borderRadius: 24,
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          boxSizing: 'border-box',
          opacity: hovered ? 0.85 : 1,
          transition: 'opacity .2s ease',
        }}
      >
        <span style={{
          fontFamily: '"Nunito Sans", sans-serif',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: '14px',
          color: '#FFF',
          flex: '1 0 0',
          textAlign: 'left',
        }}>
          {done ? 'Abrir registro' : 'Registrar'}
        </span>

        <span style={{
          display: 'flex',
          width: 24,
          height: 24,
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          background: '#FFF',
          borderRadius: '50%',
        }}>
          <ArrowIcon />
        </span>
      </button>

    </div>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'block' }}>
      <path d="M2 7H12" stroke="#1E1E1F" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7.5 2.5L12 7L7.5 11.5" stroke="#1E1E1F" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
// src/features/home/components/InsightCard.jsx

export default function InsightCard({ clima, text }) {
  const hasWeather = !!clima

  return (
    <div style={{
      background: '#FFF',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxSizing: 'border-box',
    }}>

      {/* ── row superior: cidade + temperatura | umidade + sensação ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        {/* esquerda: cidade + temperatura */}
        <div style={{
          flex: '1 0 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}>
          <span style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            lineHeight: '20px',
            color: '#1E1E1F',
          }}>
            {hasWeather ? formatCidade(clima.cidade) : 'Insight do dia'}
          </span>

          {hasWeather && (
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 36,
              fontWeight: 600,
              lineHeight: '40px',
              color: '#000',
              letterSpacing: '-0.5px',
            }}>
              {clima.temperatura}°C
            </span>
          )}
        </div>

        {/* direita: umidade + sensação */}
        {hasWeather && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
            paddingTop: 2,
          }}>
            {/* umidade */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <DropletIcon />
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: '20px',
                color: '#495059',
              }}>
                {clima.umidade}%
              </span>
            </div>

            {/* sensação */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <ThermometerIcon />
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: '20px',
                color: '#495059',
                whiteSpace: 'nowrap',
              }}>
                Sensação {clima.sensacao ?? clima.temperatura - 2}°
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── área de insight ── */}
      {text && (
        <div style={{
          background: '#FAF9FC',
          border: '1px solid #ECEAF0',
          borderRadius: 16,
          padding: '10px 14px',
          boxSizing: 'border-box',
          alignSelf: 'stretch',
        }}>
          <p style={{
            fontFamily: '"Nunito Sans", Numans, sans-serif',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: '20px',
            color: '#495059',
            margin: 0,
          }}>
            {text}
          </p>
        </div>
      )}

    </div>
  )
}

// ── formata cidade  ──────────────────────
function formatCidade(cidade = '') {
  if (!cidade) return ''
  if (cidade.includes(',')) return cidade
  return cidade
}

// ─── ícones SVG ──────────────────────────────────────────────────────────────

function DropletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'block' }}>
      <path
        d="M8 2C8 2 3.5 7.2 3.5 10.5C3.5 12.985 5.515 15 8 15C10.485 15 12.5 12.985 12.5 10.5C12.5 7.2 8 2 8 2Z"
        fill="#495059"
      />
    </svg>
  )
}

function ThermometerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'block' }}>
      <path
        d="M14 13.76V7a2 2 0 0 0-4 0v6.76a4 4 0 1 0 4 0Z"
        stroke="#495059" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1.5" fill="#495059" />
    </svg>
  )
}
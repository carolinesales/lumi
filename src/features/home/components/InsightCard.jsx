// src/features/home/components/InsightCard.jsx

export default function InsightCard({ clima, text }) {
  const hasWeather = !!clima

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      boxSizing: 'border-box',
    }}>

      {/* cidade + temperatura | umidade + sensação termica ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        {/*cidade + temperatura */}
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
            color: 'var(--text-primary)',
          }}>
            {hasWeather ? formatCidade(clima.cidade) : 'Insight do dia'}
          </span>

          {hasWeather && (
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 36,
              fontWeight: 600,
              lineHeight: '40px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}>
              {clima.temperatura}°C
            </span>
          )}
        </div>

        {/*umidade + sensação termica */}
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
              alignItems: 'center', color: 'var(--text-secondary)',
              gap: 6,
            }}>
              <DropletIcon />
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: '20px',
                color: 'var(--text-secondary)',
              }}>
                {clima.umidade}%
              </span>
            </div>

            {/* sensação termica */}
            <div style={{
              display: 'flex',
              alignItems: 'center', color: 'var(--text-secondary)',
              gap: 6,
            }}>
              <ThermometerIcon />
              <span style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 12,
                fontWeight: 500,
                lineHeight: '20px',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
              }}>
                Sensação {clima.sensacao ?? clima.temperatura - 2}°
              </span>
            </div>
          </div>
        )}
      </div>

      {/* insight lumi ── */}
      {text && (
        <div style={{
          background: 'var(--surface-subtle)',
          border: '1px solid var(--surface-muted)',
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
            color: 'var(--text-secondary)',
            margin: 0,
          }}>
            {text}
          </p>
        </div>
      )}

    </div>
  )
}

// formata a cidade
function formatCidade(cidade = '') {
  if (!cidade) return ''
  if (cidade.includes(',')) return cidade
  return cidade
}

//icones

function DropletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, display: 'block' }}>
      <path
        d="M8 2C8 2 3.5 7.2 3.5 10.5C3.5 12.985 5.515 15 8 15C10.485 15 12.5 12.985 12.5 10.5C12.5 7.2 8 2 8 2Z"
        fill="currentColor"
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
        stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" />
    </svg>
  )
}
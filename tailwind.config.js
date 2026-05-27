/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ── Fontes ────────────────────────────────────────────────────────
      fontFamily: {
        nunito:  ['"Nunito Sans"', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        serif:   ['"Times New Roman"', 'serif'],
        mono:    ['"Geist Variable"', 'monospace'],
      },

      // ── Cores ────────────────────────────────────────────────────
      colors: {
        lumi: {
          // Neutros
          black:     '#1A1A1A',
          ink:       '#181714',
          body:      '#333333',
          secondary: '#495059',
          gray:      '#6B6B6B',
          subtle:    '#888888',
          label:     '#9A958E',
          muted:     '#C8C8C8',

          // Fundos
          bg:    '#F5F5F5',
          page:  '#F7F6F3',
          hover: '#FAFAFA',
          today: '#F7F7F7',
          input: '#EFEFEF',

          // Bordas
          border: '#E0E0E0',
          line:   '#ECE8E1',

          // Semânticas
          green:   '#4CAF50',
          weekend: '#E53935',
          danger:  '#dc3232',
        },
      },

      // ── Raios ─────────────────────
      borderRadius: {
    
        'sm':   '0.375rem',  //  6px
        'md':   '0.75rem',   // 12px  
        DEFAULT:'1rem',      // 16px
        'lg':   '1.25rem',   // 20px
        'xl':   '1.5rem',    // 24px  
        '2xl':  '1.75rem',   // 28px  
        '3xl':  '2rem',      // 32px
        '4xl':  '2rem',      // alias
        'full': '9999px',    // pill / botão
      },

      // ── Sombras ─────────────────────────────────────────────────
      boxShadow: {
        'lumi-soft':  '0 16px 48px rgba(25,25,25,0.045)',
        'lumi-float': '0 22px 70px rgba(25,25,25,0.12)',
        'lumi-card':  '0 18px 54px rgba(24,23,20,0.055)',
      },

      // ── Animações ────────────────────────────────────────────────
      transitionTimingFunction: {
        lumi: 'cubic-bezier(.22, 1, .36, 1)',
      },
    },
  },
  plugins: [],
}

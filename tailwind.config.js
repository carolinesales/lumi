/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // fontes
      fontFamily: {
        nunito:  ['"Nunito Sans"', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        serif:   ['"Times New Roman"', 'serif'],
        mono:    ['"Geist Variable"', 'monospace'],
      },

    
      colors: {

        ink: {
          DEFAULT: '#1E1E1F', 
          900:     '#1E1E1F',
          800:     '#333333',
          700:     '#495059',
          600:     '#6B6B6B',
          500:     '#757575',
          400:     '#8A8880',
          300:     '#AAAAAA',
          200:     '#C8C8C8',
          100:     '#E0E0E0',
        },
        // Fundos neutros
        paper: {
          DEFAULT: '#FFFFFF',
          50:      '#FAFAFA',
          100:     '#F5F5F5',
          150:     '#F0F0F0',
          200:     '#EEEEEE',
          300:     '#EBEBEB',
        },

        
        treatment: {
          hydration:      '#5B9EBF',
          'hydration-soft':'#DCE7EF',
          nutrition:      '#F3D673',           // âmbar (preenchimentos/barras)
          'nutrition-deep':'#A8841E',           // âmbar profundo (ícones/texto sobre soft)
          'nutrition-soft':'#FBF3D6',           // fundo claro de nutrição
          reconstruction: '#8B6FC4',  
          'reconstruction-soft':'#E5DEF2',
          oils:           '#C4A033',
          'oils-soft':    '#EFE8D2',
          detox:          '#7459A6',
          'detox-soft':   '#E8E2F2',
          washing:        '#7A9299',
          'washing-soft': '#E2E8E9',
        },

        
        wellbeing: {
          good:   '#5E8C6A',  
          'good-soft': '#E6EDE8',
          bad:    '#C08457',  
          'bad-soft':  '#F0E4DA',
          track:  '#ECEEEC',  
        },

        // Cores de estado 
        state: {
          positive: '#5E8C6A',           
          'positive-soft': '#E6EDE8',
          warning:  '#C4A033',
          'warning-soft':  '#F5EFD9',
          negative: '#D9694B',
          'negative-soft': '#FBEAE5',
        },

        
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        card:        'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary:     'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        muted:       'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border:      'var(--border)',
        input:       'var(--input)',
        ring:        'var(--ring)',
        destructive: 'var(--destructive)',

        
        surface: {
          DEFAULT:   'var(--surface)',
          subtle:    'var(--surface-subtle)',
          muted:     'var(--surface-muted)',
        },
        text: {
          DEFAULT:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
        },

        
        lumi: {
          black:     'var(--lumi-black)',
          ink:       'var(--lumi-black)',
          body:      'var(--lumi-body)',
          secondary: 'var(--lumi-secondary)',
          gray:      'var(--lumi-gray)',
          subtle:    'var(--lumi-subtle)',
          label:     'var(--lumi-label)',
          muted:     'var(--lumi-muted)',
          bg:    'var(--lumi-bg)',
          page:  'var(--lumi-page)',
          hover: 'var(--lumi-hover)',
          today: 'var(--lumi-today)',
          input: 'var(--lumi-input)',
          border: 'var(--lumi-border)',
          line:   'var(--lumi-line)',
          green:   '#5E8C6A',   /* identidade — não muda no dark */
          weekend: '#E53935',
          danger:  '#dc3232',
        },
      },

      
      borderRadius: {
        'sm':   '0.5rem',    //  8px  (pills, chips)
        'md':   '0.75rem',   // 12px
        DEFAULT:'1rem',      // 16px  (itens médios)
        'lg':   '1.25rem',   // 20px
        'xl':   '1.5rem',    // 24px  (cards)
        '2xl':  '1.75rem',   // 28px
        '3xl':  '2rem',      // 32px
        'full': '9999px',    // pill / botão
      },

      
      boxShadow: {
        'lumi-soft':  '0 16px 48px rgba(25,25,25,0.045)',
        'lumi-float': '0 22px 70px rgba(25,25,25,0.12)',
        'lumi-card':  '0 18px 54px rgba(24,23,20,0.055)',
      },

      // Animações 
      transitionTimingFunction: {
        lumi: 'cubic-bezier(.22, 1, .36, 1)',
      },
    },
  },
  plugins: [],
}
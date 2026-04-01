/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne:   ['Syne', 'sans-serif'],
        nunito: ['"Nunito Sans"', 'sans-serif'],
      },
      colors: {
        lumi: {
          bg:      '#F5F5F5',
          black:   '#1A1A1A',
          gray:    '#6B6B6B',
          border:  '#E0E0E0',
          input:   '#EFEFEF',
          green:   '#4CAF50',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
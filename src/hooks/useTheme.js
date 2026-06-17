// src/hooks/useTheme.js
import { useEffect, useState } from 'react'

// gerenciamento do tema claro/escuro
export function useTheme() {
  const [tema, setTema] = useState(() => {
    const salvo = localStorage.getItem('lumi_tema')
    if (salvo === 'dark' || salvo === 'light') return salvo
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (tema === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    localStorage.setItem('lumi_tema', tema)
  }, [tema])

  function alternar() {
    setTema(t => t === 'dark' ? 'light' : 'dark')
  }

  return { tema, alternar, isDark: tema === 'dark' }
}

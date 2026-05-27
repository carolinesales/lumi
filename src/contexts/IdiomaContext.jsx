import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import pt from '../i18n/pt'
import en from '../i18n/en'

const TRADUCOES = { pt, en }
const LS_KEY    = 'lumi_idioma'

// ── Lê o idioma inicial do localStorage (funciona sem login) ──
function lerIdiomaLocal() {
  try {
    const salvo = localStorage.getItem(LS_KEY)
    if (salvo === 'pt' || salvo === 'en') return salvo
  } catch {}
  return 'pt'
}

// ── Salva no localStorage ─────────────────────────────────────
function salvarIdiomaLocal(idioma) {
  try { localStorage.setItem(LS_KEY, idioma) } catch {}
}

const IdiomaContext = createContext({ t: (k) => k, idioma: 'pt', setIdiomaApp: () => {} })

export function IdiomaProvider({ children }) {
  const { user } = useAuth()

  // Estado inicial vem do localStorage — funciona antes do login
  const [idioma, setIdioma] = useState(lerIdiomaLocal)

  // ── Quando usuário faz login: sincroniza Firestore → localStorage ──
  useEffect(() => {
    if (!user) return

    const unsub = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
      if (!snap.exists()) return
      const salvoFirestore = snap.data().idioma
      if (salvoFirestore === 'pt' || salvoFirestore === 'en') {
        // Firestore é a fonte de verdade quando logado
        setIdioma(salvoFirestore)
        salvarIdiomaLocal(salvoFirestore)
      }
    })

    return unsub
  }, [user])

  // ── Troca de idioma: salva local + Firestore (se logado) ──────
  async function setIdiomaApp(novoIdioma) {
    if (novoIdioma !== 'pt' && novoIdioma !== 'en') return
    setIdioma(novoIdioma)
    salvarIdiomaLocal(novoIdioma)
    if (user) {
      try {
        await updateDoc(doc(db, 'usuarios', user.uid), { idioma: novoIdioma })
      } catch {}
    }
  }

  // ── Função de tradução com interpolação ───────────────────────
  function t(chave, vars) {
    const textos = TRADUCOES[idioma] ?? TRADUCOES.pt
    let texto = textos[chave] ?? TRADUCOES.pt[chave] ?? chave
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        texto = texto.replace(`{${k}}`, v)
      })
    }
    return texto
  }

  return (
    <IdiomaContext.Provider value={{ t, idioma, setIdiomaApp }}>
      {children}
    </IdiomaContext.Provider>
  )
}

export const useIdioma = () => useContext(IdiomaContext)
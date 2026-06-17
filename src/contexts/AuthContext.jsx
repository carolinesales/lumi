import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  // Recarrega o usuário do Firebase e atualiza o estado

  async function refreshUser() {
    if (!auth.currentUser) return null
    await auth.currentUser.reload()
    await auth.currentUser.getIdToken(true)

    // Clona o objeto para forçar nova referência e atualizar componentes dependentes
    setUser(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser))
    return auth.currentUser
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout: () => signOut(auth) }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
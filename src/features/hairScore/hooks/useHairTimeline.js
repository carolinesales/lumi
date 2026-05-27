// src/features/hairScore/hooks/useHairTimeline.js
import { useEffect, useState } from 'react'
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function useHairTimeline(uid, max = 8) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setScores([])
      setLoading(false)
      return undefined
    }

    setLoading(true)

    const q = query(
      collection(db, 'usuarios', uid, 'hair_scores'),
      orderBy('dataRegistro', 'desc'),
      limit(max)
    )

    const unsub = onSnapshot(
      q,
      snapshot => {
        const docs = snapshot.docs.map(item => ({
          id: item.id,
          ...item.data(),
        }))

        // Firestore retorna do mais novo para o mais antigo.
        // A timeline precisa receber em ordem cronológica.
        setScores(docs.reverse())
        setLoading(false)
      },
      error => {
        console.error('[useHairTimeline] erro ao carregar timeline:', error)
        setScores([])
        setLoading(false)
      }
    )

    return () => unsub()
  }, [uid, max])

  return { scores, loading }
}

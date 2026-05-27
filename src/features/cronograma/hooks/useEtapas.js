import { useEffect, useMemo, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { toDate, isSameDay } from '../lib/calendar'

export function useEtapas() {
  const { user } = useAuth()
  const [etapas, setEtapas]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) { setEtapas([]); setLoading(false); return }

    setLoading(true)
    const q = query(
      collection(db, 'usuarios', user.uid, 'cronogramas'),
      orderBy('dataInicio', 'desc'),
      limit(1),
    )
    let unsubEtapas = null

    const unsubCron = onSnapshot(q, snap => {
      if (snap.empty) { setEtapas([]); setLoading(false); return }

      const cronogramaId = snap.docs[0].id
      if (unsubEtapas) unsubEtapas()

      unsubEtapas = onSnapshot(
        query(
          collection(db, 'usuarios', user.uid, 'cronogramas', cronogramaId, 'etapas'),
          orderBy('dataEtapa', 'asc'),
        ),
        snap => {
          setEtapas(snap.docs.map(d => ({ id: d.id, cronogramaId, ...d.data() })))
          setLoading(false)
        },
        err => { console.error(err); setLoading(false) },
      )
    }, err => { console.error(err); setLoading(false) })

    return () => { unsubCron(); if (unsubEtapas) unsubEtapas() }
  }, [user?.uid])

  const etapasOrdenadas = useMemo(() =>
    [...etapas].sort((a, b) => toDate(a.dataEtapa) - toDate(b.dataEtapa)),
    [etapas],
  )

  // Mapa de data → etapas (todas, não só do mês)
  const etapasPorDiaMap = useMemo(() => {
    const map = {}
    etapasOrdenadas.forEach(e => {
      const d = toDate(e.dataEtapa)
      if (!d) return
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(e)
    })
    return map
  }, [etapasOrdenadas])

  function getEtapasDoDia(date) {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return etapasPorDiaMap[key] ?? []
  }

  const hoje = new Date()

  const etapaHoje = useMemo(() =>
    etapasOrdenadas.find(e => isSameDay(toDate(e.dataEtapa), hoje)),
    [etapasOrdenadas],
  )

  const proximasEtapas = useMemo(() => {
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    return etapasOrdenadas
      .filter(e => { const d = toDate(e.dataEtapa); return d && d >= inicio && !e.concluida })
      .slice(0, 4)
  }, [etapasOrdenadas])

  const concluidas = etapas.filter(e => e.concluida).length
  const total      = etapas.length

  return {
    etapas,
    etapasOrdenadas,
    etapaHoje,
    proximasEtapas,
    getEtapasDoDia,
    concluidas,
    total,
    loading,
  }
}
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function calcularStreakReal(uid) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const snap = await getDocs(
    query(collection(db, 'usuarios', uid, 'registros'), orderBy('data', 'desc'))
  )

  const datas = new Set(snap.docs.map(d => d.data().data).filter(Boolean))

  let streak = 0
  const cursor = new Date(hoje)

  while (true) {
    const id = cursor.toISOString().split('T')[0]
    if (datas.has(id)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      if (streak === 0 && id === hoje.toISOString().split('T')[0]) {
        cursor.setDate(cursor.getDate() - 1)
        continue
      }
      break
    }
  }

  return streak
}

export async function calcularCuidado7Dias(uid) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const snap = await getDocs(
    query(collection(db, 'usuarios', uid, 'registros'), orderBy('data', 'desc'))
  )

  const registros = snap.docs.map(d => d.data())

  let count = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() - i)
    const id = d.toISOString().split('T')[0]

    const reg = registros.find(r => r.data === id)
    if (reg && !reg.nenhumCuidado && (
      reg.lavouCabelo || reg.hidratou || reg.nutriu ||
      reg.reconstruiu || reg.usouOleo || reg.usouProtecao
    )) {
      count++
    }
  }

  return count
}

export function calcularProgressoConquistas({ streak, etapasConcluidas, hairScore, totalDiagnosticos, xp, cuidado7Dias }) {
  return {
    inicio_jornada:  { atual: Math.min(totalDiagnosticos, 1), total: 1,   label: 'diagnóstico'  },
    primeiro_ritual: { atual: Math.min(etapasConcluidas, 1),  total: 1,   label: 'ritual'       },
    ciclo_completo:  { atual: Math.min(etapasConcluidas, 4),  total: 4,   label: 'etapas'       },
    ritmo_continuo:  { atual: Math.min(streak, 14),           total: 14,  label: 'dias'         },
    ritual_em_dia:   { atual: Math.min(cuidado7Dias, 7),      total: 7,   label: 'dias'         },
    fios_equilibrio: { atual: Math.min(hairScore ?? 0, 75),   total: 75,  label: 'pts'          },
    nova_fase:       { atual: Math.min(totalDiagnosticos, 2), total: 2,   label: 'diagnósticos' },
    essencia_lumi:   { atual: Math.min(xp, 500),              total: 500, label: 'XP'           },
  }
}

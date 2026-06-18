// src/features/hairScore/utils/hairTimeline.utils.js

export function formatTimelineDate(value) {
  if (!value) return ''

  const date = value?.toDate?.() ?? new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

export function getTimelineTrendLabel(delta = 0) {
  if (delta > 0) return 'evolução'
  if (delta < 0) return 'oscilação'
  return 'estável'
}

export function getTimelinePointTone(delta = 0) {
  if (delta > 0) return 'positive'
  if (delta < 0) return 'negative'
  return 'neutral'
}

export function normalizeHairScoreTimeline(scores = []) {
  return scores
    .map((item, index) => {
      const atual = Number(item.pontuacao ?? item.score ?? 0)
      const anterior = Number(item.anterior ?? scores[index + 1]?.pontuacao ?? atual)
      const delta = Number(item.delta ?? atual - anterior)

      return {
        id: item.id ?? `${index}-${atual}`,
        score: Math.max(0, Math.min(100, Math.round(atual))),
        anterior: Math.max(0, Math.min(100, Math.round(anterior))),
        delta,
        date: item.dataRegistro ?? item.createdAt ?? item.data ?? null,
        origem: item.origem ?? '',
        eventos: item.eventos ?? item.extra?.eventos ?? [],
        fragilidade: item.fragilidade ?? null,
      }
    })
    .sort((a, b) => {
      const da = a.date?.toDate?.() ?? new Date(a.date ?? 0)
      const db = b.date?.toDate?.() ?? new Date(b.date ?? 0)
      return da - db
    })
}

export function getTimelineInsight(items = [], t) {
  const tr = (k, fb) => {
    if (!t) return fb
    const v = t(k)
    return (!v || v === k) ? fb : v
  }

  if (!items.length) {
    return tr('ti_vazio', 'Sua evolução aparecerá aqui conforme você registra cuidados e atualiza sua rotina.')
  }

  const first = items[0]
  const last = items[items.length - 1]
  const diff = last.score - first.score

  if (last.fragilidade?.ativa) {
    return tr('ti_recuperacao', 'Seus fios estão em recuperação gradual. O Lumi acompanha a evolução com cuidado, sem acelerar o processo.')
  }

  if (diff >= 5) {
    return tr('ti_evolucao', 'Seu cabelo mostra sinais consistentes de evolução nos últimos registros.')
  }

  if (diff <= -5) {
    return tr('ti_oscilacao', 'O Lumi percebeu uma oscilação recente. Vale observar eventos como calor, química, queda ou ressecamento.')
  }

  return tr('ti_estavel', 'Seu Hair Score está relativamente estável. Pequenos registros ajudam o Lumi a entender melhor sua evolução.')
}

export function getJourneySummary(items) {
  if (!items.length) {
    return {
      title: 'Sua evolução',
      diffLabel: '—',
      tone: 'neutral',
      reading: 'Seus registros vão formar uma linha de evolução aqui.',
    }
  }

  if (items.length === 1) {
    return {
      title: 'Primeiro registro',
      diffLabel: '0',
      tone: 'neutral',
      reading: 'Este é o primeiro ponto da sua jornada. Continue registrando para o Lumi entender seus fios.',
    }
  }

  const first = items[0]
  const last = items[items.length - 1]
  const diff = last.score - first.score
  const diffLabel = diff > 0 ? `+${diff}` : `${diff}`
  const tone = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral'

  if (last.fragilidade?.ativa) {
    return {
      title: 'Recuperação gradual',
      diffLabel,
      tone,
      reading: 'Seus fios ainda pedem cuidado gradual. O foco agora é consistência e menos agressões.',
    }
  }

  if (diff >= 5) {
    return {
      title: 'Evolução recente',
      diffLabel,
      tone: 'positive',
      reading: 'Os registros mostram uma resposta positiva aos cuidados recentes.',
    }
  }

  if (diff <= -5) {
    return {
      title: 'Oscilação recente',
      diffLabel,
      tone: 'negative',
      reading: 'Calor, química ou ressecamento podem ter influenciado essa mudança.',
    }
  }

  return {
    title: 'Fios estáveis',
    diffLabel,
    tone,
    reading: 'Seu Hair Score está relativamente estável. Pequenos registros ajudam a revelar padrões.',
  }
}
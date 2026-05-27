// src/pages/JornadaCapilar.jsx
import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

import { db }      from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import AppShell    from '@/components/lumi/AppShell'
import { cn }      from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatData(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function diasAtras(n) {
  const hoje = new Date()
  hoje.setDate(hoje.getDate() - n)
  return hoje.toISOString().split('T')[0]
}

const FILTROS = [
  { label: 'Tudo',    dias: null },
  { label: '30 dias', dias: 30   },
  { label: '60 dias', dias: 60   },
  { label: '90 dias', dias: 90   },
]

// ─── Components ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-lumi-bg">
        <i className="fa-solid fa-camera text-2xl text-lumi-muted" aria-hidden="true" />
      </div>
      <div>
        <p className="font-heading text-base font-semibold text-lumi-black">
          Nenhuma foto ainda
        </p>
        <p className="mt-1 max-w-[260px] font-nunito text-sm text-lumi-gray">
          Adicione fotos ao registrar seu dia para acompanhar a evolução dos fios.
        </p>
      </div>
    </div>
  )
}

function FotoCard({ registro, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(registro)}
      className="group relative aspect-square overflow-hidden rounded-2xl bg-lumi-bg"
    >
      <img
        src={registro.fotoURL}
        alt={`Foto capilar de ${formatData(registro.id)}`}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
        <div>
          <p className="font-nunito text-[11px] font-semibold text-white">
            {new Date(registro.id + 'T12:00:00').toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short',
            })}
          </p>
          {registro.hairScore && (
            <p className="font-nunito text-[10px] text-white/70">
              Score: {registro.hairScore}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

function Modal({ registro, onClose, onAnterior, onProximo, temAnterior, temProximo }) {
  useEffect(() => {
    function handler(e) {
      if (e.key === 'Escape')    onClose()
      if (e.key === 'ArrowLeft'  && temAnterior) onAnterior()
      if (e.key === 'ArrowRight' && temProximo)  onProximo()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onAnterior, onProximo, temAnterior, temProximo])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      style={{ animation: 'lumi-fade-up-soft .2s ease both' }}
    >
      <div
        className="relative flex max-h-[90vh] max-w-[600px] w-full flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Foto */}
        <div className="overflow-hidden rounded-[24px]">
          <img
            src={registro.fotoURL}
            alt={`Foto capilar de ${formatData(registro.id)}`}
            className="w-full object-cover"
            style={{ maxHeight: '70vh' }}
          />
        </div>

        {/* Info */}
        <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
          <div>
            <p className="font-heading text-sm font-semibold text-white">
              {formatData(registro.id)}
            </p>
            {registro.observacao && (
              <p className="mt-0.5 font-nunito text-xs text-white/70">{registro.observacao}</p>
            )}
          </div>
          {registro.hairScore && (
            <div className="text-right">
              <p className="font-heading text-xl font-light text-white">{registro.hairScore}</p>
              <p className="font-nunito text-[10px] text-white/60">Hair Score</p>
            </div>
          )}
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onAnterior}
            disabled={!temAnterior}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
            aria-label="Foto anterior"
          >
            <i className="fa-solid fa-chevron-left text-sm" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-5 py-2 font-nunito text-sm text-white transition hover:bg-white/20"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={onProximo}
            disabled={!temProximo}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-30"
            aria-label="Próxima foto"
          >
            <i className="fa-solid fa-chevron-right text-sm" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JornadaCapilar() {
  const { user } = useAuth()

  const [registros,  setRegistros]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filtro,     setFiltro]     = useState(FILTROS[0])
  const [modalIdx,   setModalIdx]   = useState(null)

  useEffect(() => {
    if (!user) return
    async function carregar() {
      setLoading(true)
      try {
        const snap = await getDocs(
          query(
            collection(db, 'usuarios', user.uid, 'registros'),
            orderBy('data', 'desc'),
          )
        )
        const comFoto = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.fotoURL)
        setRegistros(comFoto)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [user])

  const filtrados = useMemo(() => {
    if (!filtro.dias) return registros
    const corte = diasAtras(filtro.dias)
    return registros.filter(r => r.id >= corte)
  }, [registros, filtro])

  const fotoAtual  = modalIdx !== null ? filtrados[modalIdx] : null
  const temAnterior = modalIdx !== null && modalIdx > 0
  const temProximo  = modalIdx !== null && modalIdx < filtrados.length - 1

  return (
    <AppShell>
      <main className="mx-auto max-w-[800px] px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-10">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold text-lumi-black lg:text-2xl">
              Jornada Capilar
            </h2>
            <p className="mt-1 font-nunito text-sm text-lumi-gray">
              {registros.length} {registros.length === 1 ? 'foto registrada' : 'fotos registradas'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-5 flex gap-2" role="group" aria-label="Filtrar por período">
          {FILTROS.map(f => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFiltro(f)}
              aria-pressed={filtro.label === f.label}
              className={cn(
                'rounded-full px-4 py-1.5 font-nunito text-sm font-semibold transition-colors',
                filtro.label === f.label
                  ? 'bg-lumi-black text-white'
                  : 'bg-lumi-input text-lumi-gray hover:bg-lumi-border',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-lumi-muted" aria-hidden="true" />
          </div>
        ) : filtrados.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtrados.map((reg, i) => (
              <FotoCard
                key={reg.id}
                registro={reg}
                onClick={() => setModalIdx(i)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de visualização */}
      {fotoAtual && (
        <Modal
          registro={fotoAtual}
          onClose={() => setModalIdx(null)}
          onAnterior={() => setModalIdx(i => i - 1)}
          onProximo={() => setModalIdx(i => i + 1)}
          temAnterior={temAnterior}
          temProximo={temProximo}
        />
      )}
    </AppShell>
  )
}

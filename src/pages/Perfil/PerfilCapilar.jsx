import { useEffect, useState }    from 'react'
import { doc, getDoc, setDoc }    from 'firebase/firestore'

import { db }      from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { cn }      from '@/lib/utils'
import { PageLayout, Card, ChipGroup, SL, SH } from './base'

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS_FIO = ['Liso', 'Ondulado', 'Cacheado', 'Crespo']

const SUBTIPOS = {
  Liso:     [{ cod: '1A', desc: 'Completamente liso e fino' }, { cod: '1B', desc: 'Liso com leve volume' }, { cod: '1C', desc: 'Liso grosso e resistente' }],
  Ondulado: [{ cod: '2A', desc: 'Ondas leves e finas' }, { cod: '2B', desc: 'Ondas definidas em S' }, { cod: '2C', desc: 'Ondas grossas com volume' }],
  Cacheado: [{ cod: '3A', desc: 'Cachos grandes e abertos' }, { cod: '3B', desc: 'Cachos médios em espiral' }, { cod: '3C', desc: 'Cachos apertados em espiral' }],
  Crespo:   [{ cod: '4A', desc: 'Crespo em formato de S' }, { cod: '4B', desc: 'Crespo em formato de Z' }, { cod: '4C', desc: 'Crespo sem padrão definido' }],
}

const POROSIDADES = [
  { val: 'Baixa', desc: 'Cutícula fechada. Difícil absorver, mas retém bem.' },
  { val: 'Média', desc: 'Cutícula regular. Absorção e retenção equilibradas.' },
  { val: 'Alta',  desc: 'Cutícula aberta. Absorve rápido, mas perde hidratação.' },
]

const ESPESSURAS   = ['Fino', 'Médio', 'Grosso']
const COMPRIMENTOS = ['Curto', 'Médio', 'Longo', 'Muito longo']
const PROCESSOS    = ['Nenhum', 'Coloração', 'Descolorado', 'Relaxamento', 'Escova progressiva', 'Keratina', 'Permanente']
const QUEIXAS      = ['Frizz', 'Ressecamento', 'Quebra', 'Oleosidade', 'Volume excessivo', 'Queda', 'Sem definição', 'Sem brilho']

const OBJETIVOS = [
  { id: 'hidratacao',  titulo: 'Cabelo sempre hidratado',      desc: 'Rotina focada em reposição hídrica' },
  { id: 'definicao',   titulo: 'Mais definição e menos frizz', desc: 'Técnicas e produtos para cachos' },
  { id: 'crescimento', titulo: 'Crescimento saudável',          desc: 'Protocolo de fortalecimento do fio' },
  { id: 'quebra',      titulo: 'Reduzir quebra',                desc: 'Reconstrução e proteção capilar' },
  { id: 'transicao',   titulo: 'Transição capilar',             desc: 'Abandonar processos químicos gradualmente' },
]

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SelectCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition',
        selected
          ? 'border-lumi-black bg-lumi-hover'
          : 'border-lumi-border bg-white hover:border-lumi-gray',
      )}
    >
      {children}
    </button>
  )
}

function RadioCard({ cod, desc, selected, onClick }) {
  return (
    <SelectCard selected={selected} onClick={onClick}>
      <div className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition',
        selected ? 'bg-lumi-black' : 'bg-lumi-bg',
      )}>
        <span className={cn(
          'font-heading text-xs font-bold',
          selected ? 'text-white' : 'text-lumi-gray',
        )}>
          {cod}
        </span>
      </div>
      <p className={cn(
        'font-nunito text-sm',
        selected ? 'font-semibold text-lumi-black' : 'font-normal text-lumi-gray',
      )}>
        {desc}
      </p>
    </SelectCard>
  )
}

function PorosidadeCard({ val, desc, selected, onClick }) {
  return (
    <SelectCard selected={selected} onClick={onClick}>
      <div className={cn(
        'h-5 w-5 shrink-0 rounded-full border-2 transition',
        selected ? 'border-lumi-black bg-lumi-black' : 'border-lumi-muted bg-transparent',
      )} />
      <div>
        <p className="font-nunito text-sm font-semibold text-lumi-black">{val}</p>
        <p className="font-nunito text-xs text-lumi-gray">{desc}</p>
      </div>
    </SelectCard>
  )
}

function ObjetivoCard({ obj, selected, onClick }) {
  return (
    <SelectCard selected={selected} onClick={onClick}>
      <div className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition',
        selected ? 'border-lumi-black bg-lumi-black' : 'border-lumi-muted bg-transparent',
      )}>
        {selected && <i className="fa-solid fa-check text-[9px] text-white" aria-hidden="true" />}
      </div>
      <div>
        <p className="font-nunito text-sm font-semibold text-lumi-black">{obj.titulo}</p>
        <p className="font-nunito text-xs text-lumi-gray">{obj.desc}</p>
      </div>
    </SelectCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerfilCapilar() {
  const { user } = useAuth()

  const [original,   setOriginal]  = useState(null)
  const [tipoFio,    setTipoFio]   = useState('Cacheado')
  const [subtipo,    setSubtipo]   = useState('')
  const [porosidade, setPoros]     = useState('')
  const [espessura,  setEspess]    = useState('')
  const [comprimento,setCompr]     = useState('')
  const [processos,  setProcessos] = useState([])
  const [queixas,    setQueixas]   = useState([])
  const [objetivos,  setObjetivos] = useState([])
  const [salvando,   setSalv]      = useState(false)
  const [sucesso,    setSucesso]   = useState(false)
  const [erro,       setErro]      = useState('')

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'usuarios', user.uid, 'perfil_capilar', 'atual')).then(snap => {
      const p = snap.exists() ? snap.data() : {}
      const dados = {
        tipoFio:     p.tipoFio     ?? 'Cacheado',
        subtipo:     p.subtipo     ?? '',
        porosidade:  p.porosidade  ?? '',
        espessura:   p.espessura   ?? '',
        comprimento: p.comprimento ?? '',
        processos:   JSON.stringify(p.processos ?? []),
        queixas:     JSON.stringify(p.queixas   ?? []),
        objetivos:   JSON.stringify(p.objetivos ?? []),
      }
      setOriginal(dados)
      setTipoFio(dados.tipoFio)
      setSubtipo(dados.subtipo)
      setPoros(dados.porosidade)
      setEspess(dados.espessura)
      setCompr(dados.comprimento)
      setProcessos(p.processos ?? [])
      setQueixas(p.queixas    ?? [])
      setObjetivos(p.objetivos ?? [])
    })
  }, [user])

  const modificado = original !== null && (
    tipoFio     !== original.tipoFio     ||
    subtipo     !== original.subtipo     ||
    porosidade  !== original.porosidade  ||
    espessura   !== original.espessura   ||
    comprimento !== original.comprimento ||
    JSON.stringify(processos) !== original.processos ||
    JSON.stringify(queixas)   !== original.queixas   ||
    JSON.stringify(objetivos) !== original.objetivos
  )

  async function salvar() {
    setSalv(true); setErro('')
    try {
      await setDoc(
        doc(db, 'usuarios', user.uid, 'perfil_capilar', 'atual'),
        { tipoFio, subtipo, porosidade, espessura, comprimento, processos, queixas, objetivos },
        { merge: true },
      )
      setOriginal({
        tipoFio, subtipo, porosidade, espessura, comprimento,
        processos:  JSON.stringify(processos),
        queixas:    JSON.stringify(queixas),
        objetivos:  JSON.stringify(objetivos),
      })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch { setErro('Erro ao salvar. Tente novamente.') }
    finally { setSalv(false) }
  }

  return (
    <PageLayout
      titulo="Perfil capilar"
      onSalvar={salvar}
      salvando={salvando}
      sucesso={sucesso}
      erro={erro}
      modificado={modificado}
    >
      {/* Tipo de fio */}
      <Card>
        <SL>Tipo de fio</SL>
        <SH>Selecione o tipo que representa seu cabelo no estado natural, sem produto.</SH>
        <ChipGroup options={TIPOS_FIO} value={tipoFio} onChange={v => { setTipoFio(v); setSubtipo('') }} />
        {SUBTIPOS[tipoFio] && (
          <div className="mt-3.5 flex flex-col gap-2">
            {SUBTIPOS[tipoFio].map(s => (
              <RadioCard key={s.cod} cod={s.cod} desc={s.desc}
                selected={subtipo === s.cod} onClick={() => setSubtipo(s.cod)} />
            ))}
          </div>
        )}
      </Card>

      {/* Porosidade */}
      <Card>
        <SL>Porosidade</SL>
        <SH>Define como seu fio absorve e retém hidratação.</SH>
        <div className="flex flex-col gap-2">
          {POROSIDADES.map(p => (
            <PorosidadeCard key={p.val} val={p.val} desc={p.desc}
              selected={porosidade === p.val} onClick={() => setPoros(p.val)} />
          ))}
        </div>
      </Card>

      {/* Espessura + Comprimento */}
      <Card>
        <div className="mb-5">
          <SL>Espessura</SL>
          <SH>Espessura de cada fio individualmente.</SH>
          <ChipGroup options={ESPESSURAS} value={espessura} onChange={setEspess} />
        </div>
        <div className="border-t border-lumi-bg pt-5">
          <SL>Comprimento</SL>
          <SH>Comprimento atual do seu cabelo.</SH>
          <ChipGroup options={COMPRIMENTOS} value={comprimento} onChange={setCompr} />
        </div>
      </Card>

      {/* Processos */}
      <Card>
        <SL>Processos químicos</SL>
        <SH>Selecione todos que se aplicam ao seu cabelo atualmente.</SH>
        <ChipGroup options={PROCESSOS} value={processos} onChange={setProcessos} multi />
      </Card>

      {/* Queixas */}
      <Card>
        <SL>Principais queixas</SL>
        <SH>O que mais te incomoda? Selecione até 3.</SH>
        <ChipGroup options={QUEIXAS} value={queixas} onChange={setQueixas} multi max={3} />
      </Card>

      {/* Objetivos */}
      <Card>
        <SL>Seus objetivos</SL>
        <SH>O que você quer alcançar com a Lumi?</SH>
        <div className="flex flex-col gap-2">
          {OBJETIVOS.map(obj => (
            <ObjetivoCard
              key={obj.id}
              obj={obj}
              selected={objetivos.includes(obj.id)}
              onClick={() => setObjetivos(
                objetivos.includes(obj.id)
                  ? objetivos.filter(o => o !== obj.id)
                  : [...objetivos, obj.id],
              )}
            />
          ))}
        </div>
      </Card>
    </PageLayout>
  )
}
import { useState }   from 'react'
import { useNavigate } from 'react-router-dom'
import {
  doc, setDoc, addDoc, collection, serverTimestamp,
} from 'firebase/firestore'

import { db }      from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { Button }  from '@/components/ui/button'
import { cn }      from '@/lib/utils'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    titulo: 'Estrutura do cabelo',
    subtitulo: 'Etapa 1 de 4',
    perguntas: [
      { id: 'tipoCurvatura',    label: 'Tipo de curvatura',           opcoes: ['Liso', 'Ondulado', 'Cacheado', 'Crespo'] },
      { id: 'espessuraTextura', label: 'Espessura e textura do fio',  opcoes: ['Fino e liso', 'Fino e poroso', 'Médio', 'Grosso e liso', 'Grosso e poroso'] },
      { id: 'densidadeCapilar', label: 'Densidade capilar',           opcoes: ['Baixa', 'Média', 'Alta'] },
      { id: 'comprimento',      label: 'Comprimento do cabelo',       opcoes: ['Curto', 'Médio', 'Longo', 'Muito longo'] },
    ],
  },
  {
    titulo: 'Estado atual do fio',
    subtitulo: 'Etapa 2 de 4',
    perguntas: [
      { id: 'ressecamento', label: 'Nível de ressecamento',                                    opcoes: ['Baixo', 'Moderado', 'Alto'] },
      { id: 'frizz',        label: 'Nível de frizz',                                           opcoes: ['Baixo', 'Moderado', 'Alto'] },
      { id: 'quebra',       label: 'Frequência de quebra',                                     opcoes: ['Baixa', 'Moderada', 'Alta'] },
      { id: 'brilho',       label: 'Como você avalia o brilho?',                               opcoes: ['Alto', 'Médio', 'Baixo'] },
      { id: 'elasticidade', label: 'Ao esticar um fio molhado e soltar, ele volta ao normal?', opcoes: ['Sim, totalmente', 'Parcialmente', 'Não volta'] },
    ],
  },
  {
    titulo: 'Couro cabeludo e química',
    subtitulo: 'Etapa 3 de 4',
    perguntas: [
      { id: 'oleosidade', label: 'Oleosidade do couro cabeludo',    opcoes: ['Baixa', 'Normal', 'Alta'] },
      { id: 'caspa',      label: 'Presença de caspa',               opcoes: ['Não', 'Leve', 'Frequente'] },
      { id: 'queda',      label: 'Queda de cabelo',                 opcoes: ['Baixa', 'Moderada', 'Alta'] },
      { id: 'quimica',    label: 'Você fez química recentemente?',  opcoes: ['Não', 'Coloração', 'Progressiva', 'Descoloração'] },
    ],
  },
  {
    titulo: 'Hábitos e rotina',
    subtitulo: 'Etapa 4 de 4',
    perguntas: [
      { id: 'estresse',        label: 'Nível de estresse',                 opcoes: ['Baixo', 'Moderado', 'Alto'] },
      { id: 'sono',            label: 'Qualidade do sono',                 opcoes: ['Boa', 'Média', 'Ruim'] },
      { id: 'atividadeFisica', label: 'Frequência de atividade física',    opcoes: ['Baixa', 'Moderada', 'Alta'] },
      { id: 'alimentacao',     label: 'Como você avalia sua alimentação?', opcoes: ['Equilibrada', 'Intermediária', 'Desregulada'] },
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Questionario() {
  const [step,      setStep]      = useState(0)
  const [respostas, setRespostas] = useState({})
  const [loading,   setLoading]   = useState(false)
  const [erro,      setErro]      = useState('')

  const { user }  = useAuth()
  const navigate  = useNavigate()
  const stepAtual = STEPS[step]
  const progresso = ((step + 1) / STEPS.length) * 100
  const valido    = stepAtual.perguntas.every(p => respostas[p.id])

  async function finalizar() {
    setLoading(true); setErro('')
    try {
      const uid = user.uid

      await setDoc(doc(db, 'usuarios', uid, 'perfil_capilar', 'atual'), {
        tipoCurvatura:     respostas.tipoCurvatura,
        espessuraFio:      respostas.espessuraTextura,
        densidadeCapilar:  respostas.densidadeCapilar,
        comprimentoCabelo: respostas.comprimento,
        atualizadoEm:      serverTimestamp(),
      })

      await setDoc(doc(db, 'usuarios', uid, 'habito_vida', 'atual'), {
        estresse:        respostas.estresse,
        sono:            respostas.sono,
        atividadeFisica: respostas.atividadeFisica,
        alimentacao:     respostas.alimentacao,
        atualizadoEm:    serverTimestamp(),
      })

      if (respostas.quimica !== 'Não') {
        await addDoc(collection(db, 'usuarios', uid, 'historico_quimico'), {
          tipoQuimica: respostas.quimica,
          dataQuimica: serverTimestamp(),
        })
      }

      const questionarioRef = await addDoc(collection(db, 'usuarios', uid, 'questionarios'), {
        elasticidade: respostas.elasticidade,
        brilho:       respostas.brilho,
        ressecamento: respostas.ressecamento,
        frizz:        respostas.frizz,
        quebra:       respostas.quebra,
        oleosidade:   respostas.oleosidade,
        caspa:        respostas.caspa,
        quedaCabelo:  respostas.queda,
        dataResposta: serverTimestamp(),
      })

      sessionStorage.setItem('lumi_respostas', JSON.stringify({
        estrutura: { tipoCurvatura: respostas.tipoCurvatura, espessuraTextura: respostas.espessuraTextura, densidadeCapilar: respostas.densidadeCapilar, comprimento: respostas.comprimento },
        estado:    { ressecamento: respostas.ressecamento, frizz: respostas.frizz, quebra: respostas.quebra, brilho: respostas.brilho, elasticidade: respostas.elasticidade },
        couro:     { oleosidade: respostas.oleosidade, caspa: respostas.caspa, queda: respostas.queda },
        quimica:   { tipo: respostas.quimica },
        vida:      { estresse: respostas.estresse, sono: respostas.sono, atividadeFisica: respostas.atividadeFisica, alimentacao: respostas.alimentacao },
      }))
      sessionStorage.setItem('lumi_questionario_id', questionarioRef.id)
      navigate('/analisando')
    } catch (err) {
      console.error(err)
      setErro('Erro ao salvar. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-lumi-bg">

      {/* Logo */}
      <div className="pb-2 pt-6 text-center">
        <h1 className="font-serif text-[28px] italic font-normal text-lumi-black">Lumi</h1>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-10 pt-4">

        {/* Header do step */}
        <div className="mb-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/app/home')}
            className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-lumi-input"
            aria-label="Voltar"
          >
            <i className="fa-solid fa-chevron-left text-sm text-lumi-black" aria-hidden="true" />
          </button>
          <div className="flex-1">
            <p className="font-nunito text-xs text-lumi-gray">{stepAtual.subtitulo}</p>
            <h2 className="font-heading text-lg font-semibold text-lumi-black">{stepAtual.titulo}</h2>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-7 h-1 overflow-hidden rounded-full bg-lumi-border">
          <div
            className="h-full rounded-full bg-lumi-black transition-all duration-400"
            style={{ width: `${progresso}%` }}
          />
        </div>

        {/* Perguntas */}
        <div className="flex flex-col gap-6">
          {stepAtual.perguntas.map(pergunta => (
            <div key={pergunta.id}>
              <label className="mb-2.5 block font-nunito text-sm font-semibold text-lumi-black">
                {pergunta.label}
              </label>
              <div className="flex flex-col gap-2">
                {pergunta.opcoes.map(opcao => {
                  const sel = respostas[pergunta.id] === opcao
                  return (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setRespostas(prev => ({ ...prev, [pergunta.id]: opcao }))}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-nunito text-sm transition-all',
                        sel
                          ? 'bg-lumi-black font-semibold text-white'
                          : 'bg-lumi-input font-normal text-lumi-black hover:bg-lumi-border',
                      )}
                    >
                      {opcao}
                      {sel && <i className="fa-solid fa-check text-xs" aria-hidden="true" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Erro */}
        {erro && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <i className="fa-solid fa-circle-exclamation text-sm text-lumi-danger" aria-hidden="true" />
            <p className="font-nunito text-sm text-lumi-danger">{erro}</p>
          </div>
        )}

        {/* CTA */}
        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : finalizar()}
          disabled={!valido || loading}
        >
          {loading
            ? <><i className="fa-solid fa-spinner fa-spin text-sm" aria-hidden="true" />Salvando...</>
            : step < STEPS.length - 1
            ? 'Próximo passo'
            : 'Finalizar diagnóstico'}
        </Button>

      </div>
    </div>
  )
}
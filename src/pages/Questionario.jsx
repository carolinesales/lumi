import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'

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
      { id: 'ressecamento',  label: 'Nível de ressecamento',                                    opcoes: ['Baixo', 'Moderado', 'Alto'] },
      { id: 'frizz',         label: 'Nível de frizz',                                           opcoes: ['Baixo', 'Moderado', 'Alto'] },
      { id: 'quebra',        label: 'Frequência de quebra',                                     opcoes: ['Baixa', 'Moderada', 'Alta'] },
      { id: 'brilho',        label: 'Como você avalia o brilho?',                               opcoes: ['Alto', 'Médio', 'Baixo'] },
      { id: 'elasticidade',  label: 'Ao esticar um fio molhado e soltar, ele volta ao normal?', opcoes: ['Sim, totalmente', 'Parcialmente', 'Não volta'] },
    ],
  },
  {
    titulo: 'Couro cabeludo e química',
    subtitulo: 'Etapa 3 de 4',
    perguntas: [
      { id: 'oleosidade', label: 'Oleosidade do couro cabeludo',      opcoes: ['Baixa', 'Normal', 'Alta'] },
      { id: 'caspa',      label: 'Presença de caspa',                  opcoes: ['Não', 'Leve', 'Frequente'] },
      { id: 'queda',      label: 'Queda de cabelo',                   opcoes: ['Baixa', 'Moderada', 'Alta'] },
      { id: 'quimica',    label: 'Você fez química recentemente?',     opcoes: ['Não', 'Coloração', 'Progressiva', 'Descoloração'] },
    ],
  },
  {
    titulo: 'Hábitos e rotina',
    subtitulo: 'Etapa 4 de 4',
    perguntas: [
      { id: 'estresse',       label: 'Nível de estresse',                    opcoes: ['Baixo', 'Moderado', 'Alto'] },
      { id: 'sono',           label: 'Qualidade do sono',                    opcoes: ['Boa', 'Média', 'Ruim'] },
      { id: 'atividadeFisica',label: 'Frequência de atividade física',       opcoes: ['Baixa', 'Moderada', 'Alta'] },
      { id: 'alimentacao',    label: 'Como você avalia sua alimentação?',    opcoes: ['Equilibrada', 'Intermediária', 'Desregulada'] },
    ],
  },
]

export default function Questionario() {
  const [step, setStep]           = useState(0)
  const [respostas, setRespostas] = useState({})
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')
  const { user } = useAuth()
  const navigate  = useNavigate()

  const stepAtual = STEPS[step]
  const progresso = ((step + 1) / STEPS.length) * 100

  function stepValido() {
    return stepAtual.perguntas.every(p => respostas[p.id])
  }

  async function finalizar() {
    setLoading(true)
    setErro('')
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
        elasticidade:  respostas.elasticidade,
        brilho:        respostas.brilho,
        ressecamento:  respostas.ressecamento,
        frizz:         respostas.frizz,
        quebra:        respostas.quebra,
        oleosidade:    respostas.oleosidade,
        caspa:         respostas.caspa,
        quedaCabelo:   respostas.queda,
        dataResposta:  serverTimestamp(),
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
    <div style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 8 }}>
        <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', letterSpacing: 1 }}>
          Lumi
        </h1>
      </div>

      <div style={{ flex: 1, padding: '16px 24px 40px' }}>

        {/* Voltar + título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/app/home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <i className="fa-solid fa-chevron-left" style={{ fontSize: 14, color: '#1A1A1A' }} />
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 12, color: '#6B6B6B', margin: 0 }}>
              {stepAtual.subtitulo}
            </p>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {stepAtual.titulo}
            </h2>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 4, background: '#E0E0E0', borderRadius: 99, overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ height: '100%', width: `${progresso}%`, background: '#1A1A1A', borderRadius: 99, transition: 'width .4s ease' }} />
        </div>

        {/* Perguntas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {stepAtual.perguntas.map(pergunta => (
            <div key={pergunta.id}>
              <label style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'block', marginBottom: 10 }}>
                {pergunta.label}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pergunta.opcoes.map(opcao => {
                  const selecionado = respostas[pergunta.id] === opcao
                  return (
                    <button key={opcao} type="button"
                      onClick={() => setRespostas(prev => ({ ...prev, [pergunta.id]: opcao }))}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '13px 16px',
                        borderRadius: 12,
                        border: selecionado ? '1.5px solid #1A1A1A' : '1.5px solid transparent',
                        background: selecionado ? '#1A1A1A' : '#EFEFEF',
                        color: selecionado ? '#fff' : '#1A1A1A',
                        fontFamily: 'Nunito Sans, sans-serif',
                        fontSize: 14,
                        fontWeight: selecionado ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all .2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      {opcao}
                      {selecionado && <i className="fa-solid fa-check" style={{ fontSize: 12 }} />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {erro && (
          <div style={{ marginTop: 20, background: 'rgba(220,50,50,0.07)', border: '1px solid rgba(220,50,50,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: '#dc3232', fontSize: 14 }} />
            <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#dc3232', margin: 0 }}>{erro}</p>
          </div>
        )}

        {/* Botão */}
        <button
          onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : finalizar()}
          disabled={!stepValido() || loading}
          style={{ width: '100%', background: stepValido() ? '#1A1A1A' : '#C0C0C0', color: '#fff', border: 'none', borderRadius: 50, padding: '16px 24px', fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', fontWeight: 600, cursor: stepValido() && !loading ? 'pointer' : 'not-allowed', marginTop: 32, transition: 'all .2s' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14 }} />
              Salvando...
            </span>
          ) : step < STEPS.length - 1 ? 'Próximo passo' : 'Finalizar diagnóstico'}
        </button>

      </div>
    </div>
  )
}
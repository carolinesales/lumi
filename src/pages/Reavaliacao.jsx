import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { calcularHairScoreDetalhado, classificarScore, gerarDiagnostico, gerarRecomendacoes, gerarCronograma } from '../lib/motor'
import { buscarBaseUsuario, montarRespostasReavaliacao, salvarReavaliacaoInteligente } from '../lib/reavaliacaoService'

import AppShell from '@/components/lumi/AppShell'
import PageContainer from '@/components/lumi/PageContainer'
import PageHeader from '@/components/lumi/PageHeader'
import LumiCard from '@/components/lumi/LumiCard'
import ConfirmDialog from '@/components/lumi/ConfirmDialog'
import ReavaliacaoSteps from '@/components/lumi/ReavaliacaoSteps'

import ReavaliacaoBody from '@/features/reavaliacao/components/ReavaliacaoBody'
import ReavaliacaoActions from '@/features/reavaliacao/components/ReavaliacaoActions'
import { getStepInfo, PERGUNTAS_ESTADO, PERGUNTAS_EVENTO } from '@/features/reavaliacao/constants/reavaliacao.constants'

export default function Reavaliacao() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [eventos, setEventos] = useState([])
  const [estadoSemMudanca, setEstadoSemMudanca] = useState('')
  const [respostas, setRespostas] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmarSaida, setConfirmarSaida] = useState(false)
  const [tipoSaida, setTipoSaida] = useState('reavaliacao')

  const semMudancas = eventos.includes('nada')
  const totalSteps = semMudancas ? 2 : 3
  const progresso = (step / totalSteps) * 100
  const stepInfo = getStepInfo({ semMudancas })

  const perguntasEvento = useMemo(() => {
    const lista = eventos.flatMap(e => PERGUNTAS_EVENTO[e] ?? [])
    const mapa = new Map()
    lista.forEach(p => mapa.set(p.id, p))
    return [...mapa.values()]
  }, [eventos])

  const perguntas = useMemo(() => {
    if (step === 2) return perguntasEvento
    if (step === 3) return PERGUNTAS_ESTADO
    return []
  }, [step, perguntasEvento])

  const stepValido =
    step === 1
      ? eventos.length > 0
      : semMudancas
        ? !!estadoSemMudanca
        : perguntas.every(p => respostas[p.id])

  async function confirmarAcaoSaida() {
    if (tipoSaida === 'conta') {
      await logout?.()
      navigate('/')
      return
    }

    navigate('/app/home')
  }

  async function finalizar() {
    if (!user || salvando) return

    setSalvando(true)
    setErro('')

    try {
      const uid = user.uid
      const base = await buscarBaseUsuario(uid)

      const respostasAjustadas = semMudancas
        ? {
            ...respostas,
            ressecamento: estadoSemMudanca === 'ressecados' ? 'Moderado' : estadoSemMudanca === 'frageis' ? 'Moderado' : respostas.ressecamento,
            frizz: estadoSemMudanca === 'ressecados' ? 'Moderado' : respostas.frizz,
            quebra: estadoSemMudanca === 'frageis' ? 'Moderada' : respostas.quebra,
            brilho: estadoSemMudanca === 'melhor' ? 'Alto' : estadoSemMudanca === 'ressecados' ? 'Médio' : respostas.brilho,
            elasticidade: estadoSemMudanca === 'frageis' ? 'Parcialmente' : respostas.elasticidade,
          }
        : respostas

      const respostasMotor = montarRespostasReavaliacao({ base, respostas: respostasAjustadas, eventos })
      const scoreDetalhado = calcularHairScoreDetalhado(respostasMotor)
      const pontuacao = scoreDetalhado.pontuacao
      const classificacao = classificarScore(pontuacao, scoreDetalhado.fragilidade)
      const diagnostico = gerarDiagnostico(respostasMotor)

      if (semMudancas) {
        const checkinRef = await addDoc(collection(db, 'usuarios', uid, 'reavaliacoes'), {
          tipo: 'checkin_sem_mudancas',
          eventos,
          estadoSemMudanca,
          respostas: respostasMotor,
          resultado: {
            pontuacao,
            classificacao: classificacao.label,
            fragilidade: scoreDetalhado.fragilidade,
          },
          criadoEm: serverTimestamp(),
        })

        await setDoc(
          doc(db, 'usuarios', uid),
          {
            ultimaReavaliacaoId: checkinRef.id,
            ultimaReavaliacaoEm: serverTimestamp(),
            ultimoCheckinSemMudancas: estadoSemMudanca,
            hairScoreAtual: pontuacao,
            hairScoreAnterior: pontuacao,
            hairScoreDelta: 0,
            hairScoreClassificacao: classificacao.label,
            fragilidadeAtiva: scoreDetalhado.fragilidade.ativa,
            fragilidadeNivel: scoreDetalhado.fragilidade.nivel,
            fragilidadeMotivos: scoreDetalhado.fragilidade.motivos,
          },
          { merge: true }
        )

        navigate('/app/home')
        return
      }

      const recomendacoes = gerarRecomendacoes(diagnostico, respostasMotor)
      const cronograma = gerarCronograma(diagnostico, respostasMotor)

      const diagnosticoRef = await addDoc(collection(db, 'usuarios', uid, 'diagnosticos'), {
        tipo: 'reavaliacao',
        eventos,
        nivelDano: diagnostico.nivelDano,
        resultadoPrincipal: diagnostico.resultadoPrincipal,
        riscoQueda: diagnostico.riscoQueda,
        tratamentos: diagnostico.tratamentos,
        saudeCouro: diagnostico.saudeCouro,
        fragilidade: scoreDetalhado.fragilidade,
        eixos: scoreDetalhado.eixos,
        dataDiagnostico: serverTimestamp(),
      })

      await addDoc(collection(db, 'usuarios', uid, 'hair_scores'), {
        idDiagnostico: diagnosticoRef.id,
        pontuacao,
        anterior: pontuacao,
        delta: 0,
        origem: 'reavaliacao',
        classificacao: classificacao.label,
        fragilidade: scoreDetalhado.fragilidade,
        dataRegistro: serverTimestamp(),
      })

      const cronogramaRef = await addDoc(collection(db, 'usuarios', uid, 'cronogramas'), {
        idDiagnostico: diagnosticoRef.id,
        tipo: 'reavaliacao',
        dataInicio: serverTimestamp(),
        frequenciaLavagem: cronograma.frequenciaLavagem,
      })

      for (const semana of cronograma.semanas) {
        for (const etapa of semana.etapas) {
          await addDoc(collection(db, 'usuarios', uid, 'cronogramas', cronogramaRef.id, 'etapas'), {
            semana: semana.semana,
            dia: etapa.dia,
            tipoCuidado: etapa.tipo,
            dataEtapa: etapa.data,
            concluida: false,
            pulada: false,
          })
        }
      }

      for (const rec of recomendacoes) {
        await addDoc(collection(db, 'usuarios', uid, 'recomendacoes'), {
          idDiagnostico: diagnosticoRef.id,
          tipo: rec.tipo,
          descricao: rec.descricao,
          prioridade: rec.prioridade,
          dataGerada: serverTimestamp(),
        })
      }

      await setDoc(
        doc(db, 'usuarios', uid),
        {
          hairScoreBase: pontuacao,
          hairScoreAtual: pontuacao,
          hairScoreAnterior: pontuacao,
          hairScoreDelta: 0,
          hairScoreAjuste: 0,
          hairScoreClassificacao: classificacao.label,
          ultimoDiagnosticoId: diagnosticoRef.id,
          perfilCompleto: true,
          reavaliadoEm: serverTimestamp(),
          fragilidadeAtiva: scoreDetalhado.fragilidade.ativa,
          fragilidadeNivel: scoreDetalhado.fragilidade.nivel,
          fragilidadeMotivos: scoreDetalhado.fragilidade.motivos,
        },
        { merge: true }
      )

      await salvarReavaliacaoInteligente({
        uid,
        eventos,
        respostas: respostasMotor,
        resultado: {
          pontuacao,
          classificacao: classificacao.label,
          diagnosticoId: diagnosticoRef.id,
          fragilidade: scoreDetalhado.fragilidade,
        },
      })

      navigate('/resultado')
    } catch (err) {
      console.error(err)
      setErro('Não foi possível concluir sua reavaliação agora.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <AppShell
      onPrimaryAction={() => {}}
    >
      <PageContainer>
        <PageHeader
          eyebrow="Reavaliação"
          title="Reavaliação"
          description="Seu cabelo muda com o tempo. O Lumi acompanha essa evolução com você."
          actionLabel="Sair da reavaliação"
          onAction={() => {
            setTipoSaida('reavaliacao')
            setConfirmarSaida(true)
          }}
        />

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <LumiCard className="min-h-[520px] p-6">
            <ReavaliacaoBody
              step={step}
              semMudancas={semMudancas}
              eventos={eventos}
              setEventos={setEventos}
              estadoSemMudanca={estadoSemMudanca}
              setEstadoSemMudanca={setEstadoSemMudanca}
              perguntas={perguntas}
              respostas={respostas}
              setRespostas={setRespostas}
            />

            {erro && (
              <div className="mt-4 rounded-2xl border border-[#8C3D3D]/15 bg-[#FCEBEB] p-3 text-sm text-[#8C3D3D]">
                {erro}
              </div>
            )}

            <ReavaliacaoActions
              step={step}
              totalSteps={totalSteps}
              stepValido={stepValido}
              salvando={salvando}
              semMudancas={semMudancas}
              onBack={() => setStep(step - 1)}
              onNext={() => setStep(step + 1)}
              onFinish={finalizar}
            />
          </LumiCard>

          <LumiCard className="sticky top-7 hidden p-6 lg:block">
            <ReavaliacaoSteps current={step} steps={stepInfo} progress={progresso} />
          </LumiCard>
        </div>
      </PageContainer>

      <ConfirmDialog
        open={confirmarSaida}
        onOpenChange={setConfirmarSaida}
        title={tipoSaida === 'conta' ? 'Sair da conta?' : 'Sair da reavaliação?'}
        description={
          tipoSaida === 'conta'
            ? 'Você será desconectada do Lumi. Para voltar, será necessário acessar sua conta novamente.'
            : 'As respostas desta reavaliação ainda não foram salvas. Você pode continuar de onde está ou sair e voltar para a Home.'
        }
        cancelLabel="Continuar"
        confirmLabel={tipoSaida === 'conta' ? 'Sair da conta' : 'Sair'}
        onConfirm={confirmarAcaoSaida}
      />
    </AppShell>
  )
}

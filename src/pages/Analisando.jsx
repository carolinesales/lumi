import { useEffect }    from 'react'
import { useNavigate }  from 'react-router-dom'
import {
  doc, addDoc, setDoc, collection, serverTimestamp,
} from 'firebase/firestore'

import { db }       from '@/lib/firebase'
import { useAuth }  from '@/contexts/AuthContext'
import { useIdioma } from '@/contexts/IdiomaContext'
import {
  calcularHairScore, classificarScore,
  gerarDiagnostico, gerarRecomendacoes, gerarCronograma,
} from '@/lib/motor'

export default function Analisando() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { t }     = useIdioma()

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (!user?.uid) return

        const respostas      = JSON.parse(sessionStorage.getItem('lumi_respostas') || '{}')
        const questionarioId = sessionStorage.getItem('lumi_questionario_id')
        const uid            = user.uid

        const pontuacao      = calcularHairScore(respostas)
        const classificacao  = classificarScore(pontuacao)
        const diagnostico    = gerarDiagnostico(respostas)
        const recomendacoes  = gerarRecomendacoes(diagnostico, respostas)
        const cronograma     = gerarCronograma(diagnostico, respostas)

        const diagnosticoRef = await addDoc(collection(db, 'usuarios', uid, 'diagnosticos'), {
          idQuestionario:    questionarioId,
          nivelDano:         diagnostico.nivelDano,
          resultadoPrincipal:diagnostico.resultadoPrincipal,
          riscoQueda:        diagnostico.riscoQueda,
          tratamentos:       diagnostico.tratamentos,
          saudeCouro:        diagnostico.saudeCouro,
          dataDiagnostico:   serverTimestamp(),
        })

        await addDoc(collection(db, 'usuarios', uid, 'hair_scores'), {
          idDiagnostico: diagnosticoRef.id,
          pontuacao,
          anterior:      pontuacao,
          delta:         0,
          origem:        'diagnostico_inicial',
          classificacao: classificacao.label,
          dataRegistro:  serverTimestamp(),
        })

        for (const rec of recomendacoes) {
          await addDoc(collection(db, 'usuarios', uid, 'recomendacoes'), {
            idDiagnostico: diagnosticoRef.id,
            tipo:          rec.tipo,
            descricao:     rec.descricao,
            prioridade:    rec.prioridade,
            dataGerada:    serverTimestamp(),
          })
        }

        const cronogramaRef = await addDoc(collection(db, 'usuarios', uid, 'cronogramas'), {
          idDiagnostico:     diagnosticoRef.id,
          dataInicio:        serverTimestamp(),
          frequenciaLavagem: cronograma.frequenciaLavagem,
        })

        for (const semana of cronograma.semanas) {
          for (const etapa of semana.etapas) {
            await addDoc(collection(db, 'usuarios', uid, 'cronogramas', cronogramaRef.id, 'etapas'), {
              semana:      semana.semana,
              dia:         etapa.dia,
              tipoCuidado: etapa.tipo,
              dataEtapa:   etapa.data,
              concluida:   false,
              pulada:      false,
            })
          }
        }

        await setDoc(
          doc(db, 'usuarios', uid),
          {
            perfilCompleto:           true,
            hairScoreBase:            pontuacao,
            hairScoreAtual:           pontuacao,
            hairScoreAnterior:        pontuacao,
            hairScoreDelta:           0,
            hairScoreAjuste:          0,
            hairScoreClassificacao:   classificacao.label,
            ultimoDiagnosticoId:      diagnosticoRef.id,
            totalDiagnosticos:        1,
            etapasConcluidas:         0,
            atualizadoEm:             serverTimestamp(),
          },
          { merge: true },
        )

        sessionStorage.setItem('lumi_resultado', JSON.stringify({
          pontuacao, classificacao, diagnostico,
          recomendacoes, cronograma, diagnosticoId: diagnosticoRef.id,
        }))

        navigate('/resultado')
      } catch (err) {
        console.error('Erro ao processar diagnóstico:', err)
        navigate('/resultado')
      }
    }, 3200)

    return () => clearTimeout(timer)
  }, [navigate, user])

  const steps = [t('an_step1'), t('an_step2'), t('an_step3')]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F5F1] px-8 py-12">

      {/* Logo */}
      <h1 className="lumi-animate-in mb-14 font-serif text-[32px] italic font-normal text-[#171614]">
        Lumi
      </h1>

      {/* Dots */}
      <div className="mb-11 flex gap-2.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-[#171614]"
            style={{ animation: `lumi-soft-pulse 1.4s ease-in-out ${i * 0.22}s infinite` }}
          />
        ))}
      </div>

      {/* Texto */}
      <div className="mb-11 max-w-[260px] text-center lumi-animate-in" style={{ animationDelay: '.18s' }}>
        <h2 className="mb-2.5 font-heading text-xl font-medium tracking-tight text-[#171614]">
          {t('an_titulo')}
        </h2>
        <p className="font-nunito text-sm leading-relaxed text-[#8A8880]">
          {t('an_sub')}
        </p>
      </div>

      {/* Barra de progresso */}
      <div
        className="mb-10 h-0.5 w-full max-w-[240px] overflow-hidden rounded-full bg-[#EBEBEB] lumi-animate-in"
        style={{ animationDelay: '.3s' }}
      >
        <div
          className="h-full rounded-full bg-[#171614]"
          style={{ animation: 'load 3.2s var(--lumi-ease) forwards', width: 0 }}
        />
      </div>

      {/* Steps */}
      <div
        className="flex w-full max-w-[260px] flex-col gap-2.5 lumi-animate-in"
        style={{ animationDelay: '.45s' }}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/65 px-3.5 py-3 backdrop-blur-xl"
          >
            <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] border-[#171614]">
              <i
                className="fa-solid fa-spinner text-[9px] text-[#171614]"
                style={{ animation: `spin ${1.2 + i * 0.3}s linear infinite` }}
                aria-hidden="true"
              />
            </div>
            <span className="font-nunito text-xs text-[#8A8880]">{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
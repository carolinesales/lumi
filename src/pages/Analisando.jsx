import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, addDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { calcularHairScore, classificarScore, gerarDiagnostico, gerarRecomendacoes, gerarCronograma } from '../lib/motor'

export default function Analisando() {
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const respostas      = JSON.parse(sessionStorage.getItem('lumi_respostas') || '{}')
        const questionarioId = sessionStorage.getItem('lumi_questionario_id')
        const uid            = user.uid

        const pontuacao     = calcularHairScore(respostas)
        const classificacao = classificarScore(pontuacao)
        const diagnostico   = gerarDiagnostico(respostas)
        const recomendacoes = gerarRecomendacoes(diagnostico, respostas)
        const cronograma    = gerarCronograma(diagnostico, respostas)

        // Diagnóstico
        const diagnosticoRef = await addDoc(collection(db, 'usuarios', uid, 'diagnosticos'), {
          idQuestionario:     questionarioId,
          nivelDano:          diagnostico.nivelDano,
          resultadoPrincipal: diagnostico.resultadoPrincipal,
          riscoQueda:         diagnostico.riscoQueda,
          dataDiagnostico:    serverTimestamp(),
        })

        // Hair Score
        await addDoc(collection(db, 'usuarios', uid, 'hair_scores'), {
          idDiagnostico: diagnosticoRef.id,
          pontuacao,
          classificacao:  classificacao.label,
          dataRegistro:   serverTimestamp(),
        })

        // Recomendações
        for (const rec of recomendacoes) {
          await addDoc(collection(db, 'usuarios', uid, 'recomendacoes'), {
            idDiagnostico: diagnosticoRef.id,
            tipo:          rec.tipo,
            descricao:     rec.descricao,
            prioridade:    rec.prioridade,
            dataGerada:    serverTimestamp(),
          })
        }

        // Cronograma com datas reais
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

        // Atualizar flag do usuário
        await setDoc(doc(db, 'usuarios', uid), { perfilCompleto: true }, { merge: true })

        // Guardar resultado no sessionStorage
        sessionStorage.setItem('lumi_resultado', JSON.stringify({
          pontuacao, classificacao, diagnostico, recomendacoes, cronograma,
          diagnosticoId: diagnosticoRef.id,
        }))

        navigate('/resultado')
      } catch (err) {
        console.error('Erro ao processar diagnóstico:', err)
        navigate('/resultado')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate, user])

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.6} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes loading { from{width:0%} to{width:100%} }
      `}</style>

      {/* Logo */}
      <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 32, color: '#1A1A1A', letterSpacing: 1, marginBottom: 48, animation: 'fadeUp .6s ease both' }}>
        Lumi
      </h1>

      {/* Pontos animados */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#1A1A1A', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>

      {/* Texto */}
      <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeUp .6s .2s ease both' }}>
        <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22, fontWeight: 600, color: '#1A1A1A', marginBottom: 10 }}>
          Analisando seu perfil
        </h2>
        <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, maxWidth: 280 }}>
          Identificando padrões e necessidades únicas dos seus fios.
        </p>
      </div>

      {/* Barra de progresso */}
      <div style={{ width: '100%', maxWidth: 280, height: 3, background: '#E0E0E0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#1A1A1A', borderRadius: 99, animation: 'loading 3s ease-out forwards' }} />
      </div>

    </div>
  )
}
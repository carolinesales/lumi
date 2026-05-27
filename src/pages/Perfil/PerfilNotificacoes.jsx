import { useEffect, useState }        from 'react'
import { doc, getDoc, updateDoc }     from 'firebase/firestore'

import { db }        from '@/lib/firebase'
import { useAuth }   from '@/contexts/AuthContext'
import { useIdioma } from '@/contexts/IdiomaContext'
import { PageLayout, Card, SL, SH, Toggle } from './base'

export default function PerfilNotificacoes() {
  const { user } = useAuth()
  const { t }    = useIdioma()

  const [original,     setOriginal]  = useState(null)
  const [notifDiaria,  setND]        = useState(true)
  const [notifSemanal, setNS]        = useState(true)
  const [notifEsp,     setNE]        = useState(false)
  const [salvando,     setSalv]      = useState(false)
  const [sucesso,      setSucesso]   = useState(false)
  const [erro,         setErro]      = useState('')

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'usuarios', user.uid)).then(snap => {
      if (!snap.exists()) return
      const d = snap.data()
      const dados = {
        diaria:       d.notificacoes?.diaria       ?? true,
        semanal:      d.notificacoes?.semanal      ?? true,
        especialista: d.notificacoes?.especialista ?? false,
      }
      setOriginal(dados)
      setND(dados.diaria)
      setNS(dados.semanal)
      setNE(dados.especialista)
    })
  }, [user])

  const modificado = original !== null && (
    notifDiaria  !== original.diaria       ||
    notifSemanal !== original.semanal      ||
    notifEsp     !== original.especialista
  )

  async function salvar() {
    setSalv(true); setErro('')
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), {
        notificacoes: { diaria: notifDiaria, semanal: notifSemanal, especialista: notifEsp },
      })
      setOriginal({ diaria: notifDiaria, semanal: notifSemanal, especialista: notifEsp })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch { setErro(t('erro_generico')) }
    finally { setSalv(false) }
  }

  return (
    <PageLayout
      titulo={t('pn_titulo')}
      onSalvar={salvar}
      salvando={salvando}
      sucesso={sucesso}
      erro={erro}
      modificado={modificado}
    >
      <Card>
        <SL>{t('pn_lembretes')}</SL>
        <SH>{t('pn_lembretes_hint')}</SH>
        <Toggle label={t('pn_diaria')}       desc={t('pn_diaria_desc')}       value={notifDiaria}  onChange={setND} />
        <Toggle label={t('pn_semanal')}      desc={t('pn_semanal_desc')}      value={notifSemanal} onChange={setNS} />
        <Toggle label={t('pn_especialista')} desc={t('pn_especialista_desc')} value={notifEsp}     onChange={setNE} />
      </Card>

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-[14px] border border-lumi-border bg-lumi-bg p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lumi-input">
          <i className="fa-solid fa-circle-info text-sm text-lumi-gray" aria-hidden="true" />
        </div>
        <div>
          <p className="mb-1 font-nunito text-sm font-semibold text-lumi-black">
            {t('pn_info_titulo')}
          </p>
          <p className="font-nunito text-xs leading-relaxed text-lumi-gray">
            {t('pn_info_desc')}
          </p>
        </div>
      </div>
    </PageLayout>
  )
}
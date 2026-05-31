import { useEffect, useState }        from 'react'
import { doc, getDoc, updateDoc }     from 'firebase/firestore'

import { db }        from '@/lib/firebase'
import { useAuth }   from '@/contexts/AuthContext'
import { useIdioma } from '@/contexts/IdiomaContext'
import { cn }        from '@/lib/utils'
import { PageLayout, Card, SL, SH } from './base'

// ─── OptionCard ───────────────────────────────────────────────────────────────

function OptionCard({ icon, title, desc, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'mb-2 flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition last:mb-0',
        selected
          ? 'border-lumi-black bg-lumi-hover'
          : 'border-lumi-border bg-white hover:border-lumi-gray',
      )}
    >
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition',
        selected ? 'bg-lumi-black' : 'bg-lumi-bg',
      )}>
        <i className={cn('fa-solid text-base', icon, selected ? 'text-white' : 'text-lumi-gray')} aria-hidden="true" />
      </div>

      <div className="flex-1">
        <p className="mb-0.5 font-nunito text-sm font-semibold text-lumi-black">{title}</p>
        <p className="font-nunito text-xs text-lumi-gray">{desc}</p>
      </div>

      {/* Radio indicator */}
      <div className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
        selected ? 'border-lumi-black bg-lumi-black' : 'border-lumi-muted bg-transparent',
      )}>
        {selected && <div className="h-2 w-2 rounded-full bg-white" />}
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerfilIdioma() {
  const { user }              = useAuth()
  const { t, setIdiomaApp }   = useIdioma()

  const [original, setOriginal] = useState(null)
  const [idioma,   setIdioma]   = useState('pt')
  const [unidade,  setUnidade]  = useState('cm')
  const [salvando, setSalv]     = useState(false)
  const [sucesso,  setSucesso]  = useState(false)
  const [erro,     setErro]     = useState('')

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'usuarios', user.uid)).then(snap => {
      if (!snap.exists()) return
      const d = snap.data()
      const dados = { idioma: d.idioma ?? 'pt', unidade: d.unidade ?? 'cm' }
      setOriginal(dados)
      setIdioma(dados.idioma)
      setUnidade(dados.unidade)
    })
  }, [user])

  const modificado = original !== null && (
    idioma  !== original.idioma  ||
    unidade !== original.unidade
  )

  async function salvar() {
    setSalv(true); setErro('')
    try {
      await setIdiomaApp(idioma)
      await updateDoc(doc(db, 'usuarios', user.uid), { idioma, unidade })
      setOriginal({ idioma, unidade })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch { setErro(t('erro_generico')) }
    finally { setSalv(false) }
  }

  return (
    <PageLayout
      titulo={t('pi_titulo')}
      onSalvar={salvar}
      salvando={salvando}
      sucesso={sucesso}
      erro={erro}
      modificado={modificado}
    >
      <Card>
        <SL>{t('pi_idioma')}</SL>
        <OptionCard icon="fa-flag"  title={t('pi_pt')} desc={t('pi_pt_desc')} selected={idioma === 'pt'} onClick={() => setIdioma('pt')} />
        <OptionCard icon="fa-flag"  title={t('pi_en')} desc={t('pi_en_desc')} selected={idioma === 'en'} onClick={() => setIdioma('en')} />
      </Card>

      <Card>
        <SL>{t('pi_unidade')}</SL>
        <SH>{t('pi_unidade_hint')}</SH>
        <OptionCard icon="fa-ruler" title={t('pi_cm')}  desc={t('pi_cm_desc')}  selected={unidade === 'cm'}  onClick={() => setUnidade('cm')}  />
        <OptionCard icon="fa-ruler" title={t('pi_pol')} desc={t('pi_pol_desc')} selected={unidade === 'pol'} onClick={() => setUnidade('pol')} />
      </Card>

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-[14px] border border-lumi-border bg-lumi-bg p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lumi-input">
          <i className="fa-solid fa-circle-info text-sm text-lumi-gray" aria-hidden="true" />
        </div>
        <p className="font-nunito text-xs leading-relaxed text-lumi-gray">
          {t('pi_aviso')}
        </p>
      </div>
    </PageLayout>
  )
}
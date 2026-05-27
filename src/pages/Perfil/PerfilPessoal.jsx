import { useEffect, useState }        from 'react'
import { doc, getDoc, updateDoc }     from 'firebase/firestore'
import { updateProfile }              from 'firebase/auth'

import { db }        from '@/lib/firebase'
import { useAuth }   from '@/contexts/AuthContext'
import { useIdioma } from '@/contexts/IdiomaContext'
import { PageLayout, Card, FieldInput, SL, SH } from './base'

export default function PerfilPessoal() {
  const { user } = useAuth()
  const { t }    = useIdioma()

  const [original,  setOriginal]  = useState({})
  const [nome,      setNome]      = useState('')
  const [sobrenome, setSobre]     = useState('')
  const [celular,   setCelular]   = useState('')
  const [cidade,    setCidade]    = useState('')
  const [estado,    setEstado]    = useState('')
  const [salvando,  setSalv]      = useState(false)
  const [sucesso,   setSucesso]   = useState(false)
  const [erro,      setErro]      = useState('')

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'usuarios', user.uid)).then(snap => {
      if (!snap.exists()) return
      const d = snap.data()
      const dados = {
        nome:      d.nome      ?? '',
        sobrenome: d.sobrenome ?? '',
        celular:   d.celular   ?? '',
        cidade:    d.cidade    ?? '',
        estado:    d.estado    ?? '',
      }
      setOriginal(dados)
      setNome(dados.nome)
      setSobre(dados.sobrenome)
      setCelular(dados.celular)
      setCidade(dados.cidade)
      setEstado(dados.estado)
    })
  }, [user])

  const modificado =
    nome      !== original.nome      ||
    sobrenome !== original.sobrenome ||
    celular   !== original.celular   ||
    cidade    !== original.cidade    ||
    estado    !== original.estado

  async function salvar() {
    if (!nome.trim() || !sobrenome.trim()) return setErro(t('obrigatorio'))
    setSalv(true); setErro('')
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), { nome, sobrenome, celular, cidade, estado })
      await updateProfile(user, { displayName: `${nome} ${sobrenome}` })
      setOriginal({ nome, sobrenome, celular, cidade, estado })
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch { setErro(t('erro_generico')) }
    finally { setSalv(false) }
  }

  return (
    <PageLayout
      titulo={t('pp_titulo')}
      onSalvar={salvar}
      salvando={salvando}
      sucesso={sucesso}
      erro={erro}
      modificado={modificado}
    >
      <Card>
        <SL>{t('pp_info_basicas')}</SL>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldInput label={t('pp_nome')}      value={nome}      onChange={setNome}  />
            <FieldInput label={t('pp_sobrenome')} value={sobrenome} onChange={setSobre} />
          </div>
          <FieldInput
            label={t('pp_email')}
            value={user?.email ?? ''}
            disabled
            hint={t('pp_email_hint')}
          />
          <FieldInput
            label={t('pp_celular')}
            value={celular}
            onChange={setCelular}
            placeholder={t('pp_celular_ph')}
          />
        </div>
      </Card>

      <Card>
        <SL>{t('pp_localizacao')}</SL>
        <SH>{t('pp_localizacao_hint')}</SH>
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <FieldInput label={t('pp_cidade')} value={cidade} onChange={setCidade} placeholder={t('pp_cidade_ph')} />
          <FieldInput label={t('pp_estado')} value={estado} onChange={setEstado} placeholder={t('pp_estado_ph')} />
        </div>
      </Card>
    </PageLayout>
  )
}
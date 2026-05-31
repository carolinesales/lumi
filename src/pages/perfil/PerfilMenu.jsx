import { useEffect, useRef, useState } from 'react'
import { useNavigate }                  from 'react-router-dom'
import {
  collection, doc, getDocs, getDoc, limit, orderBy, query,
} from 'firebase/firestore'
import { updateProfile }               from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import { db, storage } from '@/lib/firebase'
import { useAuth }     from '@/contexts/AuthContext'
import { useIdioma }   from '@/contexts/IdiomaContext'
import AppShell        from '@/components/lumi/AppShell'
import ThemeToggle     from '@/components/lumi/ThemeToggle'
import { cn }          from '@/lib/utils'

export default function PerfilMenu() {
  const { user, logout } = useAuth()
  const { t }            = useIdioma()
  const navigate         = useNavigate()

  const [dadosUser, setDadosUser] = useState(null)
  const [hairScore, setHairScore] = useState(null)
  const [fotoURL,   setFotoURL]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const MENU = [
    { icon: 'fa-user',  label: t('perfil_dados'),     desc: t('perfil_dados_desc'),     href: '/app/perfil/pessoal'      },
    { icon: 'fa-bell',  label: t('perfil_notif'),     desc: t('perfil_notif_desc'),     href: '/app/perfil/notificacoes' },
    { icon: 'fa-globe', label: t('perfil_idioma'),    desc: t('perfil_idioma_desc'),    href: '/app/perfil/idioma'       },
    { icon: 'fa-key',   label: t('perfil_seguranca'), desc: t('perfil_seguranca_desc'), href: '/app/perfil/seguranca'    },
  ]

  useEffect(() => {
    if (!user) return
    async function load() {
      const [uSnap, sSnap] = await Promise.all([
        getDoc(doc(db, 'usuarios', user.uid)),
        getDocs(query(
          collection(db, 'usuarios', user.uid, 'hair_scores'),
          orderBy('dataRegistro', 'desc'),
          limit(1),
        )),
      ])
      if (uSnap.exists()) setDadosUser(uSnap.data())
      if (!sSnap.empty)   setHairScore(sSnap.docs[0].data())
      setFotoURL(user.photoURL ?? null)
    }
    load()
  }, [user])

  async function uploadFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `usuarios/${user.uid}/foto`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateProfile(user, { photoURL: url })
      setFotoURL(url)
    } finally { setUploading(false) }
  }

  const nome      = dadosUser?.nome      ?? ''
  const sobrenome = dadosUser?.sobrenome ?? ''
  const iniciais  = `${nome[0] ?? ''}${sobrenome[0] ?? ''}`.toUpperCase() || 'U'
  const score     = hairScore?.pontuacao ?? 0
  const scoreCor  = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-amber-500' : 'text-red-500'

  return (
    <AppShell>
      <main className="mx-auto max-w-[680px] px-5 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-10">

        {/* Título mobile */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <h1 className="font-serif text-2xl italic text-lumi-black">Lumi</h1>
          <p className="font-heading text-[15px] font-semibold text-lumi-black">
            {t('perfil_titulo')}
          </p>
        </div>

        {/* Título desktop */}
        <h2 className="mb-6 hidden font-heading text-xl font-semibold text-lumi-black lg:block">
          {t('perfil_titulo')}
        </h2>

        {/* ── Hero card ── */}
        <div className="mb-3 flex items-center gap-4 rounded-2xl border border-lumi-border bg-white p-6">
          <div className="relative shrink-0">
            <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-lumi-black">
              {fotoURL
                ? <img src={fotoURL} alt="Foto de perfil" className="h-full w-full object-cover" />
                : <span className="font-heading text-2xl font-bold text-white">{iniciais}</span>}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Alterar foto de perfil"
              className="absolute -right-0.5 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border border-lumi-border bg-white transition hover:bg-lumi-bg"
            >
              {uploading
                ? <i className="fa-solid fa-spinner fa-spin text-[10px] text-lumi-gray" aria-hidden="true" />
                : <i className="fa-solid fa-camera text-[10px] text-lumi-black" aria-hidden="true" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadFoto} className="hidden" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-[17px] font-semibold text-lumi-black">
              {nome} {sobrenome}
            </h2>
            <p className="truncate font-nunito text-xs text-lumi-gray">{user?.email}</p>
            {hairScore && (
              <div className="mt-2.5 flex items-center gap-2">
                <span className={cn('font-serif text-2xl italic', scoreCor)}>{score}</span>
                <div>
                  <p className={cn('font-nunito text-[11px] font-bold', scoreCor)}>
                    {hairScore.classificacao}
                  </p>
                  <p className="font-nunito text-[10px] text-lumi-muted">{t('home_hair_score')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Menu ── */}
        <div className="mb-3 overflow-hidden rounded-2xl border border-lumi-border bg-white">
          {MENU.map((item, i) => (
            <button
              key={item.href}
              type="button"
              onClick={() => navigate(item.href)}
              className={cn(
                'flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-lumi-hover',
                i < MENU.length - 1 && 'border-b border-lumi-bg',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lumi-bg">
                <i className={cn('fa-solid text-[15px] text-lumi-gray', item.icon)} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="font-nunito text-sm font-semibold text-lumi-black">{item.label}</p>
                <p className="font-nunito text-xs text-lumi-muted">{item.desc}</p>
              </div>
              <i className="fa-solid fa-chevron-right text-[11px] text-lumi-muted" aria-hidden="true" />
            </button>
          ))}
        </div>

        {/* ── Ações rápidas ── */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/questionario')}
            className="flex flex-col items-start gap-2 rounded-2xl border border-lumi-border bg-white p-4 text-left transition hover:bg-lumi-hover"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-lumi-bg">
              <i className="fa-solid fa-rotate text-[15px] text-lumi-black" aria-hidden="true" />
            </div>
            <p className="font-nunito text-[13px] font-semibold text-lumi-black">
              {t('perfil_novo_diag')}
            </p>
            <p className="font-nunito text-[11px] text-lumi-muted">
              {t('perfil_novo_diag_desc')}
            </p>
          </button>

          {/* Toggle de tema — mobile */}
          <button
            type="button"
            onClick={() => {}}
            className="flex flex-col items-start gap-2 rounded-2xl border border-lumi-border bg-white p-4 text-left transition hover:bg-lumi-hover"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-lumi-bg">
              <ThemeToggle variant="icon" />
            </div>
            <p className="font-nunito text-[13px] font-semibold text-lumi-black">
              Aparência
            </p>
            <p className="font-nunito text-[11px] text-lumi-muted">
              Claro ou escuro
            </p>
          </button>
        </div>

        {/* ── Sair ── */}
        <button
          type="button"
          onClick={logout}
          className="mt-2.5 flex w-full flex-col items-start gap-2 rounded-2xl border border-red-100 bg-[#FCEBEB] p-4 text-left transition hover:bg-red-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-red-100">
            <i className="fa-solid fa-right-from-bracket text-[15px] text-lumi-danger" aria-hidden="true" />
          </div>
          <p className="font-nunito text-[13px] font-semibold text-lumi-danger">
            {t('perfil_sair')}
          </p>
          <p className="font-nunito text-[11px] text-red-300">
            {t('perfil_sair_desc')}
          </p>
        </button>

      </main>
    </AppShell>
  )
}

// src/features/jornada/components/FotoCapilarUpload.jsx
import { useRef, useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { cn }      from '@/lib/utils'

export default function FotoCapilarUpload({
  uid,
  dataId,
  fotoURL,
  onUpload,
  compact = false,
}) {
  const [uploading,   setUploading]   = useState(false)
  const [erro,        setErro]        = useState('')
  const [preview,     setPreview]     = useState(fotoURL ?? null)
  const inputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validação
    if (!file.type.startsWith('image/')) {
      setErro('Selecione uma imagem válida.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 10MB.')
      return
    }

    setErro('')
    setUploading(true)

    // Preview local imediato
    const objectURL = URL.createObjectURL(file)
    setPreview(objectURL)

    try {
      const path       = `usuarios/${uid}/fotos_capilares/${dataId}`
      const storageRef = ref(storage, path)
      await uploadBytes(storageRef, file, { contentType: file.type })
      const url = await getDownloadURL(storageRef)
      setPreview(url)
      onUpload?.(url)
    } catch (err) {
      console.error('Erro no upload:', err)
      setErro('Erro ao enviar foto. Tente novamente.')
      setPreview(fotoURL ?? null)
    } finally {
      setUploading(false)
      URL.revokeObjectURL(objectURL)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Adicionar foto do cabelo"
            className={cn(
              'relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition',
              preview
                ? 'border-transparent'
                : 'border-lumi-border bg-lumi-bg hover:border-lumi-gray',
            )}
          >
            {preview ? (
              <img src={preview} alt="Foto do cabelo" className="h-full w-full object-cover" />
            ) : (
              <i className="fa-solid fa-camera text-xl text-lumi-muted" aria-hidden="true" />
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <i className="fa-solid fa-spinner fa-spin text-sm text-white" aria-hidden="true" />
              </div>
            )}
          </button>

          {/* Texto */}
          <div className="flex-1">
            <p className="font-nunito text-sm font-semibold text-lumi-black">
              {preview ? 'Foto adicionada' : 'Foto do cabelo hoje'}
            </p>
            <p className="font-nunito text-xs text-lumi-gray">
              {preview ? 'Toque para trocar' : 'Opcional — registra sua evolução visual'}
            </p>
            {!preview && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="mt-1.5 font-nunito text-xs font-semibold text-lumi-black underline underline-offset-2 transition hover:opacity-70"
              >
                Adicionar foto
              </button>
            )}
          </div>
        </div>

        {erro && (
          <p className="font-nunito text-xs text-lumi-danger">{erro}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    )
  }

 
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Adicionar ou trocar foto do cabelo"
        className={cn(
          'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed transition',
          preview
            ? 'border-transparent'
            : 'border-lumi-border bg-lumi-bg hover:border-lumi-gray',
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="Foto do cabelo" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 to-transparent pb-4 opacity-0 transition hover:opacity-100">
              <span className="font-nunito text-sm font-semibold text-white">Trocar foto</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-lumi-input">
              <i className="fa-solid fa-camera text-2xl text-lumi-gray" aria-hidden="true" />
            </div>
            <div>
              <p className="font-nunito text-sm font-semibold text-lumi-black">
                Adicionar foto
              </p>
              <p className="mt-1 font-nunito text-xs text-lumi-gray">
                JPG, PNG ou WEBP · máx 10MB
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-2">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-white" aria-hidden="true" />
              <span className="font-nunito text-sm text-white">Enviando...</span>
            </div>
          </div>
        )}
      </button>

      {erro && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
          <i className="fa-solid fa-circle-exclamation text-sm text-lumi-danger" aria-hidden="true" />
          <p className="font-nunito text-sm text-lumi-danger">{erro}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}

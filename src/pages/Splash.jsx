import { useNavigate } from 'react-router-dom'

export default function Splash() {
  return (
    <div className="min-h-screen bg-lumi-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto', position: 'relative', overflow: 'hidden' }}>

      {/* Logo topo */}
      <div className="text-center pt-6 pb-2 z-10">
        <h1 style={{ fontFamily: 'Times New Roman, serif', fontStyle: 'italic', fontSize: 28, color: '#1A1A1A', letterSpacing: 1 }}>
          Lumi
        </h1>
      </div>

      {/* Foto imersiva */}
      <div className="relative w-full" style={{ height: 480 }}>
        <img
          src="hero.jpg"
          alt="Cabelo"
          className="w-full h-full object-cover"
          style={{ borderBottomLeftRadius: '50% 8%', borderBottomRightRadius: '50% 8%' }}
        />
      </div>

      {/* Conteúdo inferior */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-8 pb-12">

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 600, color: '#1A1A1A', textAlign: 'center', marginBottom: 12 }}>
          Crie sua conta
        </h2>

        <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#6B6B6B', textAlign: 'center', lineHeight: 1.6, marginBottom: 32, maxWidth: 280 }}>
          Cuidados feitos para você, que transformam sua rotina e revelam o melhor dos seus fios.
        </p>

        <a href="/cadastro"
          className="w-full flex items-center justify-center font-semibold transition-all active:scale-[.98]"
          style={{ background: '#1A1A1A', color: '#fff', borderRadius: 50, padding: '16px 24px', fontSize: 15, fontFamily: 'Nunito Sans, sans-serif', textDecoration: 'none' }}>
          Criar minha conta
        </a>

        <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, color: '#6B6B6B', marginTop: 20, textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <a href="/login" style={{ color: '#1A1A1A', fontWeight: 700, textDecoration: 'none' }}>
            Acesse por aqui
          </a>
        </p>

      </div>
    </div>
  )
}
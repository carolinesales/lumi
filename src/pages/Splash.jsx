import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const TEXTOS = {
  pt: {
    headline: 'Diagnóstico inteligente para o seu cabelo',
    criar:    'Criar minha conta',
    entrar:   'Já tenho uma conta',
    termos:   'Ao continuar, você aceita nossos',
    link1:    'termos de uso',
    e:        'e',
    link2:    'política de privacidade',
    lang:     'Português',
    modal: {
      termos: {
        titulo: 'Termos de Uso',
        fechar: 'Entendi',
        corpo: [
          { titulo: '1. Aceitação dos Termos', texto: 'Ao criar uma conta e utilizar o Lumi, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize o aplicativo.' },
          { titulo: '2. Sobre o Lumi', texto: 'O Lumi é um aplicativo de monitoramento de cuidados capilares que oferece diagnóstico personalizado, recomendações de tratamentos e acompanhamento da rotina capilar. As informações fornecidas pelo Lumi são de caráter educativo e não substituem a orientação de um profissional especializado.' },
          { titulo: '3. Uso da Conta', texto: 'Você é responsável por manter a confidencialidade das suas credenciais de acesso. É proibido compartilhar sua conta com terceiros ou utilizá-la para fins ilícitos. O Lumi reserva-se o direito de suspender contas que violem estes termos.' },
          { titulo: '4. Dados e Diagnóstico', texto: 'O diagnóstico gerado pelo Lumi é baseado nas respostas fornecidas por você no questionário. A precisão das recomendações depende da veracidade das informações fornecidas. O Lumi não se responsabiliza por resultados decorrentes de informações incorretas.' },
          { titulo: '5. Propriedade Intelectual', texto: 'Todo o conteúdo do Lumi — incluindo textos, design, motor de recomendação e interface — é de propriedade da autora do projeto e está protegido por direitos autorais. É proibida a reprodução sem autorização prévia.' },
          { titulo: '6. Alterações nos Termos', texto: 'O Lumi pode atualizar estes Termos de Uso periodicamente. As alterações serão comunicadas pelo aplicativo. O uso continuado após as alterações implica na aceitação dos novos termos.' },
        ],
      },
      privacidade: {
        titulo: 'Política de Privacidade',
        fechar: 'Entendi',
        corpo: [
          { titulo: '1. Dados Coletados', texto: 'O Lumi coleta os seguintes dados: nome, e-mail, número de celular (opcional), respostas do questionário capilar, registros de cuidados realizados e histórico de diagnósticos. Esses dados são necessários para o funcionamento do aplicativo.' },
          { titulo: '2. Como Usamos seus Dados', texto: 'Seus dados são utilizados exclusivamente para gerar diagnósticos personalizados, criar cronogramas de cuidados e melhorar sua experiência no aplicativo. Não vendemos, alugamos ou compartilhamos suas informações com terceiros para fins comerciais.' },
          { titulo: '3. Armazenamento e Segurança', texto: 'Seus dados são armazenados de forma segura no Firebase (Google Cloud), com criptografia em trânsito e em repouso. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado.' },
          { titulo: '4. Seus Direitos (LGPD)', texto: 'Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), você tem direito a acessar, corrigir, exportar e excluir seus dados a qualquer momento. Para exercer esses direitos, entre em contato pelo e-mail do suporte.' },
          { titulo: '5. Cookies e Rastreamento', texto: 'O Lumi não utiliza cookies de rastreamento para fins publicitários. Utilizamos apenas dados de sessão necessários para manter você autenticado e garantir o funcionamento correto do aplicativo.' },
          { titulo: '6. Retenção de Dados', texto: 'Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir sua conta, todos os dados pessoais serão removidos permanentemente dos nossos servidores em até 30 dias.' },
          { titulo: '7. Contato', texto: 'Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, entre em contato através do e-mail de suporte disponível no aplicativo.' },
        ],
      },
    },
  },
  en: {
    headline: 'Intelligent diagnosis for your hair',
    criar:    'Create my account',
    entrar:   'I already have an account',
    termos:   'By continuing, you agree to our',
    link1:    'terms of use',
    e:        'and',
    link2:    'privacy policy',
    lang:     'English',
    modal: {
      termos: {
        titulo: 'Terms of Use',
        fechar: 'Got it',
        corpo: [
          { titulo: '1. Acceptance of Terms', texto: 'By creating an account and using Lumi, you agree to these Terms of Use. If you do not agree with any part of these terms, please do not use the application.' },
          { titulo: '2. About Lumi', texto: 'Lumi is a hair care monitoring application that offers personalized diagnosis, treatment recommendations and hair routine tracking. The information provided by Lumi is educational and does not replace the guidance of a specialized professional.' },
          { titulo: '3. Account Use', texto: 'You are responsible for maintaining the confidentiality of your access credentials. It is prohibited to share your account with third parties or use it for unlawful purposes. Lumi reserves the right to suspend accounts that violate these terms.' },
          { titulo: '4. Data and Diagnosis', texto: 'The diagnosis generated by Lumi is based on the answers you provide in the questionnaire. The accuracy of the recommendations depends on the truthfulness of the information provided. Lumi is not responsible for results arising from incorrect information.' },
          { titulo: '5. Intellectual Property', texto: 'All Lumi content — including texts, design, recommendation engine and interface — is the property of the project author and is protected by copyright. Reproduction without prior authorization is prohibited.' },
          { titulo: '6. Changes to Terms', texto: 'Lumi may update these Terms of Use periodically. Changes will be communicated through the application. Continued use after changes implies acceptance of the new terms.' },
        ],
      },
      privacidade: {
        titulo: 'Privacy Policy',
        fechar: 'Got it',
        corpo: [
          { titulo: '1. Data Collected', texto: 'Lumi collects the following data: name, email, phone number (optional), hair questionnaire responses, care records and diagnosis history. This data is necessary for the application to function.' },
          { titulo: '2. How We Use Your Data', texto: 'Your data is used exclusively to generate personalized diagnoses, create care schedules and improve your experience in the application. We do not sell, rent or share your information with third parties for commercial purposes.' },
          { titulo: '3. Storage and Security', texto: 'Your data is stored securely on Firebase (Google Cloud), with encryption in transit and at rest. We adopt technical and organizational measures to protect your information against unauthorized access.' },
          { titulo: '4. Your Rights (LGPD)', texto: 'In compliance with the Brazilian General Data Protection Law (LGPD — Law No. 13.709/2018), you have the right to access, correct, export and delete your data at any time. To exercise these rights, contact us via the support email.' },
          { titulo: '5. Cookies and Tracking', texto: 'Lumi does not use tracking cookies for advertising purposes. We only use session data necessary to keep you authenticated and ensure the correct functioning of the application.' },
          { titulo: '6. Data Retention', texto: 'Your data is kept while your account is active. When you delete your account, all personal data will be permanently removed from our servers within 30 days.' },
          { titulo: '7. Contact', texto: 'If you have questions about this Privacy Policy or about the processing of your data, please contact us through the support email available in the application.' },
        ],
      },
    },
  },
}

// ── DRAWER (mobile) ─────────────────────────────────────────────
function Drawer({ conteudo, onClose }) {
  const startY   = useRef(null)
  const currentY = useRef(null)
  const sheetRef = useRef(null)

  function onTouchStart(e) {
    startY.current = e.touches[0].clientY
  }

  function onTouchMove(e) {
    const delta = e.touches[0].clientY - startY.current
    currentY.current = delta
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`
      sheetRef.current.style.transition = 'none'
    }
  }

  function onTouchEnd() {
    if (currentY.current > 120) {
      onClose()
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = 'translateY(0)'
      sheetRef.current.style.transition = 'transform .3s ease'
    }
    currentY.current = null
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
      <style>{`@keyframes drawerUp { from{transform:translateY(100%)} to{transform:translateY(0)} }`}</style>
      <div ref={sheetRef}
        style={{ background: '#fff', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', animation: 'drawerUp .32s cubic-bezier(.32,0,.67,0) forwards' }}>

        {/* Handle — área de drag */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ padding: '16px 0 12px', display: 'flex', justifyContent: 'center', cursor: 'grab' }}>
          <div style={{ width: 36, height: 4, background: '#E0E0E0', borderRadius: 99 }} />
        </div>

        {/* Título */}
        <div style={{ padding: '0 24px 16px', borderBottom: '0.5px solid #F0F0F0' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 17, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            {conteudo.titulo}
          </h2>
        </div>

        {/* Conteúdo scrollável */}
        <div style={{ overflowY: 'auto', padding: '20px 24px 8px', flex: 1 }}>
          {conteudo.corpo.map((secao, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 6px' }}>
                {secao.titulo}
              </h3>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', lineHeight: 1.7, margin: 0 }}>
                {secao.texto}
              </p>
            </div>
          ))}
        </div>

        {/* Botão */}
        <div style={{ padding: '16px 24px 40px', borderTop: '0.5px solid #F0F0F0' }}>
          <button onClick={onClose}
            style={{ width: '100%', height: 48, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 24, fontFamily: 'Nunito Sans, sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            {conteudo.fechar}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── MODAL (desktop) ─────────────────────────────────────────────
function Modal({ conteudo, onClose }) {
  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <style>{`@keyframes modalIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }`}</style>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', animation: 'modalIn .25s ease forwards' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 28px 20px', borderBottom: '0.5px solid #F0F0F0' }}>
          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 18, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
            {conteudo.titulo}
          </h2>
          <button onClick={onClose}
            style={{ width: 32, height: 32, background: '#F5F5F5', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fa-solid fa-xmark" style={{ fontSize: 13, color: '#6B6B6B' }} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ overflowY: 'auto', padding: '24px 28px 8px', flex: 1 }}>
          {conteudo.corpo.map((secao, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 6px' }}>
                {secao.titulo}
              </h3>
              <p style={{ fontFamily: 'Nunito Sans, sans-serif', fontSize: 13, color: '#6B6B6B', lineHeight: 1.7, margin: 0 }}>
                {secao.texto}
              </p>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div style={{ padding: '20px 28px 28px', borderTop: '0.5px solid #F0F0F0' }}>
          <button onClick={onClose}
            style={{ width: '100%', height: 48, background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: 24, fontFamily: 'Nunito Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {conteudo.fechar}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SPLASH ───────────────────────────────────────────────────────
export default function Splash() {
  const navigate = useNavigate()
  const [idioma, setIdioma]     = useState('pt')
  const [langOpen, setLangOpen] = useState(false)
  const [modal, setModal]       = useState(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
  const t = TEXTOS[idioma]

  const conteudoModal = modal === 'termos'
    ? t.modal.termos
    : modal === 'privacidade'
      ? t.modal.privacidade
      : null

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes scaleIn { from{transform:scale(1.06)} to{transform:scale(1)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }

        .bg-img { animation: scaleIn 2s ease forwards }
        .fi  { animation: fadeIn .8s .1s ease both }
        .fu0 { animation: fadeUp .7s .3s ease both }
        .fu1 { animation: fadeUp .7s .5s ease both }
        .fu2 { animation: fadeUp .7s .7s ease both }

        .btn-primary {
          width: 100%; height: 48px;
          background: #fff; color: #000;
          border: none; border-radius: 24px;
          font-family: 'Nunito Sans', sans-serif;
          font-weight: 400; font-size: 16px;
          cursor: pointer; transition: background 150ms ease;
          padding: 14px 24px; box-sizing: border-box;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-primary:hover  { background: #F5F5F5 }
        .btn-primary:active { background: #EAEAEA }

        .btn-ghost {
          width: 100%; height: 48px;
          background: rgba(255,255,255,0.3); color: #fff;
          border: 1px solid rgba(255,255,255,0.2); border-radius: 24px;
          font-family: 'Nunito Sans', sans-serif;
          font-weight: 400; font-size: 16px;
          cursor: pointer; transition: background 150ms ease;
          padding: 14px 24px; box-sizing: border-box;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-ghost:hover  { background: rgba(255,255,255,0.4) }
        .btn-ghost:active { background: rgba(255,255,255,0.5) }

        .lang-trigger {
          background: none; border: none; cursor: pointer;
          font-family: 'Nunito Sans', sans-serif;
          font-size: 16px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          display: flex; align-items: center; gap: 8px;
          padding: 8px 0; transition: color .2s;
        }
        .lang-trigger:hover { color: rgba(255,255,255,0.95) }

        .lang-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: rgba(20,20,18,0.97);
          border: 0.5px solid rgba(255,255,255,0.1);
          border-radius: 14px; overflow: hidden; min-width: 130px; z-index: 99;
        }
        .lang-option {
          display: block; width: 100%; padding: 11px 16px;
          background: none; border: none; cursor: pointer;
          font-family: 'Nunito Sans', sans-serif; font-size: 14px;
          color: rgba(255,255,255,0.65); text-align: left;
          transition: all .15s; box-sizing: border-box;
        }
        .lang-option:hover  { background: rgba(255,255,255,0.06); color: #fff }
        .lang-option.active { color: #fff; font-weight: 700 }

        .termos-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          font-family: 'Nunito Sans', sans-serif; font-size: 14px;
          color: rgba(255,255,255,0.55); text-decoration: underline;
          transition: color .2s;
        }
        .termos-btn:hover { color: rgba(255,255,255,0.9) }

        /* MOBILE */
        .topbar  { padding: 67px 24px 0; display: flex; align-items: center; justify-content: space-between; }
        .logo    { font-family: 'Times New Roman', serif; font-style: italic; font-weight: 400; font-size: 32px; line-height: 1; color: #fff; margin: 0; }
        .content { padding: 0 24px 45px; }
        .headline { font-family: 'Montserrat', sans-serif; font-weight: 500; font-size: 32px; line-height: 1.2; color: #fff; margin: 0 0 24px; }
        .btns    { display: flex; flex-direction: column; gap: 16px; }
        .termos  { font-family: 'Nunito Sans', sans-serif; font-size: 14px; color: rgba(255,255,255,0.38); margin-top: 32px; line-height: 1.7; text-align: center; }

        /* DESKTOP */
        @media (min-width: 1024px) {
          .topbar   { padding: 68px 68px 0; }
          .logo     { font-size: 64px; line-height: 32px; }
          .content  { padding: 0 68px 45px; }
          .headline { font-size: 48px; max-width: 560px; margin: 0 0 24px; }
          .btns     { flex-direction: row; gap: 16px; }
          .btn-primary { width: auto; min-width: 200px; }
          .btn-ghost   { width: auto; min-width: 200px; }
          .termos   { text-align: left; margin-top: 32px; }
        }
      `}</style>

      {/* Foto fundo */}
      <div className="bg-img" style={{ position: 'absolute', inset: 0 }}>
        <img src="/hero.jpg" alt="Lumi"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
      </div>

      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0.90) 100%)' }} />

      {/* Conteúdo */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <div className="topbar fi">
          <h1 className="logo">Lumi</h1>
          <div style={{ position: 'relative' }}>
            <button className="lang-trigger" onClick={() => setLangOpen(o => !o)}>
              {t.lang}
              <i className={`fa-solid ${langOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{ fontSize: 16 }} />
            </button>
            {langOpen && (
              <div className="lang-menu">
                {Object.entries(TEXTOS).map(([key, val]) => (
                  <button key={key} className={`lang-option ${idioma === key ? 'active' : ''}`}
                    onClick={() => { setIdioma(key); setLangOpen(false) }}>
                    {val.lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Rodapé */}
        <div className="content">
          <h2 className="headline fu0">{t.headline}</h2>

          <div className="btns fu1">
            <button className="btn-primary" onClick={() => navigate('/cadastro')}>{t.criar}</button>
            <button className="btn-ghost"   onClick={() => navigate('/login')}>{t.entrar}</button>
          </div>

          <p className="termos fu2">
            {t.termos}{' '}
            <button className="termos-btn" onClick={() => setModal('termos')}>{t.link1}</button>
            {' '}{t.e}{' '}
            <button className="termos-btn" onClick={() => setModal('privacidade')}>{t.link2}</button>.
          </p>
        </div>
      </div>

      {/* Drawer (mobile) ou Modal (desktop) */}
      {conteudoModal && (
        isMobile
          ? <Drawer conteudo={conteudoModal} onClose={() => setModal(null)} />
          : <Modal  conteudo={conteudoModal} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }       from './contexts/AuthContext'
import { IdiomaProvider }     from './contexts/IdiomaContext'
import ProtectedRoute         from './components/ProtectedRoute'
import Splash                 from './pages/Splash'
import Login                  from './pages/Login'
import Cadastro               from './pages/Cadastro'
import VerificarEmail         from './pages/VerificaEmail'
import Questionario           from './pages/Questionario'
import Analisando             from './pages/Analisando'
import Resultado              from './pages/Resultado'
import Home                   from './pages/Home'
import Cronograma             from './pages/Cronograma'
import EtapaDetalhe           from './pages/EtapaDetalhe'
import Analises               from './pages/Analises'
import Reavaliacao            from './pages/Reavaliacao'
import JornadaCapilar         from './pages/JornadaCapilar'
import PerfilMenu             from './pages/perfil/PerfilMenu'
import PerfilPessoal          from './pages/perfil/PerfilPessoal'
import PerfilNotificacoes     from './pages/perfil/PerfilNotificacoes'
import PerfilIdioma           from './pages/perfil/PerfilIdioma'
import PerfilSeguranca        from './pages/perfil/PerfilSeguranca'

export default function App() {
  return (
    <AuthProvider>
      <IdiomaProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Públicas ── */}
            <Route path="/"                element={<Splash />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/cadastro"        element={<Cadastro />} />
            <Route path="/verificar-email" element={<VerificarEmail />} />

            {/* ── Diagnóstico ── */}
            <Route path="/questionario" element={<ProtectedRoute><Questionario /></ProtectedRoute>} />
            <Route path="/analisando"   element={<ProtectedRoute><Analisando /></ProtectedRoute>} />
            <Route path="/resultado"    element={<ProtectedRoute><Resultado /></ProtectedRoute>} />

            {/* ── App ── */}
            <Route path="/app/home"                         element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/app/cronograma"                   element={<ProtectedRoute><Cronograma /></ProtectedRoute>} />
            <Route path="/app/historico"                    element={<ProtectedRoute><Analises /></ProtectedRoute>} />
            <Route path="/app/jornada"                      element={<ProtectedRoute><JornadaCapilar /></ProtectedRoute>} />
            <Route path="/app/reavaliacao"                  element={<ProtectedRoute><Reavaliacao /></ProtectedRoute>} />
            <Route path="/app/etapa/:cronogramaId/:etapaId" element={<ProtectedRoute><EtapaDetalhe /></ProtectedRoute>} />

            {/* ── Perfil ── */}
            <Route path="/app/perfil"              element={<ProtectedRoute><PerfilMenu /></ProtectedRoute>} />
            <Route path="/app/perfil/pessoal"      element={<ProtectedRoute><PerfilPessoal /></ProtectedRoute>} />
            <Route path="/app/perfil/notificacoes" element={<ProtectedRoute><PerfilNotificacoes /></ProtectedRoute>} />
            <Route path="/app/perfil/idioma"       element={<ProtectedRoute><PerfilIdioma /></ProtectedRoute>} />
            <Route path="/app/perfil/seguranca"    element={<ProtectedRoute><PerfilSeguranca /></ProtectedRoute>} />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </IdiomaProvider>
    </AuthProvider>
  )
}

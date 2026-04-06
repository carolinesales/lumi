import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute   from './components/ProtectedRoute'
import Login            from './pages/Login'
import Splash            from './pages/Splash'
import Cadastro         from './pages/Cadastro'
import Questionario     from './pages/Questionario'
import Analisando       from './pages/Analisando'
import Resultado        from './pages/Resultado'
import Home             from './pages/Home'
import VerificarEmail from './pages/VerificaEmail'
import Cronograma   from './pages/Cronograma'
import EtapaDetalhe from './pages/EtapaDetalhe'




export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/cadastro"     element={<Cadastro />} />
          <Route path="/questionario" element={<ProtectedRoute><Questionario /></ProtectedRoute>} />
          <Route path="/analisando"   element={<ProtectedRoute><Analisando /></ProtectedRoute>} />
          <Route path="/resultado"    element={<ProtectedRoute><Resultado /></ProtectedRoute>} />
          <Route path="/app/home"     element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/app/cronograma"              element={<ProtectedRoute><Cronograma /></ProtectedRoute>} />
          <Route path="/app/etapa/:cronogramaId/:etapaId" element={<ProtectedRoute><EtapaDetalhe /></ProtectedRoute>} />        
          <Route path="/"      element={<Splash />} />
          <Route path="*"      element={<Navigate to="/" replace />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
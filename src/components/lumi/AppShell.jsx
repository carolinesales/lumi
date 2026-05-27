import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import AppSidebar from './AppSidebar'
import MobileNavbar from './MobileNavbar'


export default function AppShell({ children, onPrimaryAction }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout?.()
    navigate('/')
  }

  return (
    <div className="lumi-page grid min-h-dvh bg-[#F5F4F5] lg:grid-cols-[256px_minmax(0,1fr)]">
      <AppSidebar user={user} onLogout={handleLogout} />

      <main className="min-w-0 min-h-dvh overflow-x-hidden">
        {children}
      </main>

      <MobileNavbar onPrimaryAction={onPrimaryAction} />
    </div>
  )
}
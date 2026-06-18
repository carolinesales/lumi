import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button }      from '@/components/ui/button'
import { useIdioma }   from '@/contexts/IdiomaContext'
import ThemeToggle     from '@/components/lumi/ThemeToggle'

const NAV = [
  { icon: 'fa-house',         key: 'nav_inicio',   href: '/app/home'      },
  { icon: 'fa-calendar-days', key: 'nav_rotina',   href: '/app/cronograma'},
  { icon: 'fa-chart-line',    key: 'nav_analises', href: '/app/historico' },
  { icon: 'fa-images',        key: 'nav_jornada',  href: '/app/jornada'   },
]

export default function AppSidebar({ user, onLogout }) {
  const location = useLocation()
  const { t } = useIdioma()
  const navigate = useNavigate()

  const nome     = user?.displayName || 'Caroline Sales'
  const email    = user?.email       || ''
  const foto     = user?.photoURL    || ''
  const iniciais = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-black/[0.03] bg-surface px-4 py-5 lg:flex dark:border-white/[0.06]">
      <h1 className="mb-9 font-serif text-[26px] italic tracking-[-0.03em] text-text dark:text-white">
        Lumi
      </h1>

      {/* Navegação */}
      <nav className="flex flex-col gap-5 px-2">
        {NAV.map(item => {
          const active = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={[
                'flex h-8 items-center gap-4 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'text-text dark:text-white'
                  : 'text-text-secondary hover:text-text dark:text-neutral-400 dark:hover:text-white',
              ].join(' ')}
            >
              <i className={`fa-solid ${item.icon} w-[18px] text-center text-sm`} aria-hidden="true" />
              <span>{t(item.key)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="mt-auto flex flex-col gap-2">

        {/* Toggle de tema */}
        <ThemeToggle variant="full" />

        {/* Perfil + dropdown */}
        <DropdownMenu>
          <div className="grid grid-cols-[36px_minmax(0,1fr)_32px] items-center gap-2">
            <div className="grid size-9 place-items-center overflow-hidden rounded-full bg-treatment-reconstruction-soft text-xs font-extrabold text-treatment-reconstruction">
              {foto
                ? <img src={foto} alt={nome} className="size-full object-cover" />
                : <span>{iniciais || 'L'}</span>}
            </div>

            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold leading-tight text-text-secondary dark:text-neutral-200">
                {nome}
              </div>
              <div className="truncate text-[10.5px] leading-tight text-text-tertiary">
                {email}
              </div>
            </div>

            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <i className="fa-solid fa-chevron-right text-[10px]" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
          </div>

          <DropdownMenuContent
            align="end"
            side="right"
            sideOffset={10}
            className="w-40 rounded-2xl border-white/80 bg-surface/95 p-1 shadow-2xl backdrop-blur-xl dark:border-white/10"
          >
            <DropdownMenuItem
              onClick={() => navigate('/app/perfil')}
              className="cursor-pointer rounded-xl font-semibold"
            >
              <i className="fa-regular fa-user mr-2 text-xs text-text-tertiary" aria-hidden="true" />
              {t('nav_perfil')}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer rounded-xl font-semibold text-state-negative focus:text-state-negative"
            >
              <i className="fa-solid fa-arrow-right-from-bracket mr-2 text-xs" aria-hidden="true" />
              {t('perfil_sair')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
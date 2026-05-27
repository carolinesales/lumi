// src/components/lumi/MobileNavbar.jsx
import { Link, useLocation } from 'react-router-dom'
import { Button }            from '@/components/ui/button'
import { cn }                from '@/lib/utils'

const NAV = [
  { icon: 'fa-house',         label: 'Home',    href: '/app/home'      },
  { icon: 'fa-calendar-days', label: 'Rotina',  href: '/app/cronograma'},
  { icon: 'fa-chart-line',    label: 'Análises',href: '/app/historico' },
  { icon: 'fa-user',          label: 'Perfil',  href: '/app/perfil'    },
]

export default function MobileNavbar({ onPrimaryAction }) {
  const { pathname } = useLocation()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto grid h-[86px] max-w-[430px] grid-cols-5 items-center border-t border-white/80 bg-[#F7F6F3]/95 px-1 pb-5 pt-2 backdrop-blur-2xl lg:hidden"
    >
      <NavItem item={NAV[0]} active={pathname === NAV[0].href} />
      <NavItem item={NAV[1]} active={pathname === NAV[1].href} />

      <Button
        size="icon"
        onClick={onPrimaryAction}
        className="mx-auto -mt-7 size-14 shadow-[0_14px_32px_rgba(0,0,0,.18)]"
        aria-label="Registrar cuidado"
      >
        <i className="fa-solid fa-plus text-lg" aria-hidden="true" />
      </Button>

      <NavItem item={NAV[2]} active={pathname === NAV[2].href} />
      <NavItem item={NAV[3]} active={pathname === NAV[3].href} />
    </nav>
  )
}

function NavItem({ item, active }) {
  return (
    <Link
      to={item.href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 font-nunito text-[9px] font-black transition-colors',
        active ? 'text-lumi-black' : 'text-[#BDB8AF]',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <i className={cn('fa-solid text-[17px]', item.icon)} aria-hidden="true" />
      {item.label}
    </Link>
  )
}
'use client'

import { usePathname } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getStoredUser } from '@/lib/auth'
import { NotificationDropdown } from './notification-dropdown'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  produtos: 'Produtos',
  categorias: 'Categorias',
  estoque: 'Estoque',
  compras: 'Compras',
  producao: 'Produção',
  fornecedores: 'Fornecedores',
  clientes: 'Clientes',
  usuarios: 'Usuários',
}

function getBreadcrumb(pathname: string) {
  const segment = pathname.split('/').filter(Boolean)[0] ?? 'dashboard'
  return ROUTE_LABELS[segment] ?? segment
}

export function Topbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null)
  const [date, setDate] = useState('')

  useEffect(() => {
    setUser(getStoredUser())
    setDate(
      new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    )
  }, [])

  const breadcrumb = getBreadcrumb(pathname)

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-surface-300/60 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      <div>
        <p className="text-[11px] font-medium text-brand-400 uppercase tracking-wider">
          SuperPão
        </p>
        <h2 className="text-base font-semibold text-brand-900 capitalize">{breadcrumb}</h2>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-2 text-xs text-brand-400">
          <CalendarDays size={14} className="text-brand-300" />
          <span className="capitalize">{date}</span>
        </div>

        <NotificationDropdown />

        {user && (
          <div className="flex items-center gap-2.5 pl-4 border-l border-surface-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-brand-800">{user.name.split(' ')[0]}</p>
              <p className="text-[10px] text-brand-400 capitalize">{user.role.toLowerCase()}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

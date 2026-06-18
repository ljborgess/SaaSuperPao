'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  Layers,
  Warehouse,
  ShoppingCart,
  Truck,
  Factory,
  Users,
  UserCircle,
  LogOut,
  Wheat,
} from 'lucide-react'
import { clearAuth, getStoredUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const navGroups = [
  {
    label: 'Visão Geral',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/produtos', label: 'Produtos', icon: Package },
      { href: '/categorias', label: 'Categorias', icon: Layers },
    ],
  },
  {
    label: 'Operações',
    items: [
      { href: '/estoque', label: 'Estoque', icon: Warehouse },
      { href: '/compras', label: 'Compras', icon: ShoppingCart },
      { href: '/producao', label: 'Produção', icon: Factory },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { href: '/fornecedores', label: 'Fornecedores', icon: Truck },
      { href: '/clientes', label: 'Clientes', icon: UserCircle },
      { href: '/usuarios', label: 'Usuários', icon: Users },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout')
    } catch {
      /* ignore */
    }
    clearAuth()
    router.push('/login')
  }

  return (
    <aside className="w-[260px] bg-brand-950 flex flex-col h-screen sticky top-0 shadow-sidebar shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/50">
            <Wheat size={20} className="text-accent-cream" strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-accent-cream leading-none tracking-tight">
              SuperPão
            </p>
            <p className="text-[10px] text-brand-400 mt-1 uppercase tracking-[0.15em] font-medium">
              Gestão Empresarial
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold text-brand-500 uppercase tracking-[0.12em]">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
                      active
                        ? 'bg-brand-800/80 text-accent-cream shadow-sm'
                        : 'text-brand-400 hover:bg-white/[0.04] hover:text-brand-200',
                    )}
                  >
                    <Icon
                      size={17}
                      strokeWidth={active ? 2 : 1.75}
                      className={cn(
                        'shrink-0 transition-colors',
                        active ? 'text-accent-gold' : 'text-brand-500 group-hover:text-brand-300',
                      )}
                    />
                    <span>{label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-gold" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.04]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-xs font-bold text-accent-cream shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-200 truncate">{user.name}</p>
              <p className="text-[10px] text-brand-500 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-brand-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}

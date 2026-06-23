'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  Camera,
  X,
  ChevronUp,
} from 'lucide-react'
import { clearAuth, getStoredUser, storeAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { toast } from 'sonner'

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

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
}

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

function resizeImageToBase64(file: File, maxSize = 150): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject
    img.src = url
  })
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  useEffect(() => {
    if (user) setEditName(user.name)
  }, [user])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [profileOpen])

  async function handleLogout() {
    try { await api.post('/api/auth/logout') } catch { /* ignore */ }
    clearAuth()
    router.push('/login')
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await resizeImageToBase64(file)
      await saveProfile(editName, base64)
    } catch {
      toast.error('Erro ao processar imagem.')
    }
    e.target.value = ''
  }

  async function saveProfile(name: string, avatarUrl?: string) {
    setSaving(true)
    try {
      const res = await api.patch('/api/auth/profile', { name, avatarUrl })
      const updated = res.data
      const stored = getStoredUser()
      if (stored) {
        const newUser = { ...stored, name: updated.name, avatarUrl: updated.avatarUrl }
        const accessToken = sessionStorage.getItem('accessToken') ?? ''
        const refreshToken = sessionStorage.getItem('refreshToken') ?? ''
        storeAuth(accessToken, refreshToken, newUser)
        setUser(newUser)
      }
      toast.success('Perfil atualizado!')
    } catch {
      toast.error('Erro ao salvar perfil.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveName() {
    if (!editName.trim() || editName === user?.name) { setProfileOpen(false); return }
    await saveProfile(editName.trim())
    setProfileOpen(false)
  }

  const avatar = user?.avatarUrl

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
          <div className="relative" ref={popoverRef}>
            {/* Profile popover */}
            {profileOpen && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-brand-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Meu perfil</span>
                  <button onClick={() => setProfileOpen(false)} className="text-brand-500 hover:text-brand-300 transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-accent-cream">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={16} className="text-white" />
                    </button>
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-[11px] text-brand-400 hover:text-accent-gold transition-colors"
                  >
                    Alterar foto
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Info */}
                <div className="space-y-1 mb-4 text-center">
                  <p className="text-xs font-semibold text-brand-200">{user.email}</p>
                  <span className="inline-block text-[10px] bg-brand-800 text-brand-300 px-2 py-0.5 rounded-full">
                    {ROLE_LABEL[user.role] ?? user.role}
                  </span>
                </div>

                {/* Edit name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-brand-500 uppercase tracking-wider">Nome</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="w-full bg-brand-800/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-brand-200 placeholder:text-brand-600 focus:outline-none focus:border-accent-gold/40 transition-colors"
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="w-full py-2 bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/20 text-accent-gold text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}

            {/* Clickable user section */}
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] w-full text-left transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-xs font-bold text-accent-cream shrink-0">
                {avatar ? (
                  <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand-200 truncate">{user.name}</p>
                <p className="text-[10px] text-brand-500 truncate">{user.email}</p>
              </div>
              <ChevronUp
                size={13}
                className={cn(
                  'text-brand-600 shrink-0 transition-transform duration-200',
                  profileOpen ? 'rotate-0' : 'rotate-180',
                )}
              />
            </button>
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Package, Layers, Warehouse, ShoppingCart,
  Truck, Factory, Users, UserCircle, LogOut, Wheat, Camera, X, ChevronUp, FileText,
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
      { href: '/notas-fiscais', label: 'Notas Fiscais', icon: FileText },
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

  useEffect(() => { setUser(getStoredUser()) }, [])
  useEffect(() => { if (user) setEditName(user.name) }, [user])

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
    <aside
      className="w-[260px] flex flex-col h-screen sticky top-0 shrink-0"
      style={{ background: '#381B09', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#C4A77D' }}>
            <Wheat size={17} style={{ color: '#381B09' }} strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-none tracking-tight" style={{ color: '#C4A77D' }}>
              SuperPão
            </p>
            <p className="text-[10px] mt-0.5 uppercase tracking-[0.12em] font-medium" style={{ color: '#C4A77D' }}>
              Gestão Empresarial
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p
              className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'rgba(196,167,125,0.45)' }}
            >
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
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                      active
                        ? 'bg-white/[0.07]'
                        : 'hover:bg-white/[0.04]',
                    )}
                    style={{ color: active ? '#C4A77D' : 'rgba(196,167,125,0.6)' }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={active ? 2 : 1.75}
                      style={{ color: active ? '#C4A77D' : 'rgba(196,167,125,0.45)', flexShrink: 0 }}
                    />
                    <span>{label}</span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#C4A77D' }} />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {user && (
          <div className="relative" ref={popoverRef}>
            {/* Profile popover */}
            {profileOpen && (
              <div
                className="absolute bottom-full mb-2 left-0 right-0 rounded-2xl p-4 z-50"
                style={{
                  background: '#4A230E',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 -12px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(196,167,125,0.65)' }}>
                    Meu perfil
                  </span>
                  <button onClick={() => setProfileOpen(false)} style={{ color: 'rgba(196,167,125,0.65)' }}>
                    <X size={14} />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-4">
                  <div className="relative group">
                    <div
                      className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
                      style={{ background: 'rgba(196,167,125,0.15)' }}
                    >
                      {avatar ? (
                        <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold font-display" style={{ color: '#C4A77D' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      <Camera size={16} className="text-white" />
                    </button>
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-[11px] hover:underline"
                    style={{ color: 'rgba(196,167,125,0.65)' }}
                  >
                    Alterar foto
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>

                <div className="space-y-1 mb-4 text-center">
                  <p className="text-xs font-semibold" style={{ color: '#C4A77D' }}>{user.email}</p>
                  <span
                    className="inline-block text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(196,167,125,0.12)', color: '#C4A77D' }}
                  >
                    {ROLE_LABEL[user.role] ?? user.role}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(196,167,125,0.55)' }}>Nome</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      color: '#FAF8F3',
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(196,167,125,0.4)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)' }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="w-full py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                    style={{
                      background: 'rgba(196,167,125,0.12)',
                      border: '1px solid rgba(196,167,125,0.2)',
                      color: '#C4A77D',
                    }}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            )}

            {/* Clickable user section */}
            <button
              onClick={() => setProfileOpen((v) => !v)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 mb-1.5 rounded-xl w-full text-left transition-colors',
                profileOpen ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]',
              )}
            >
              <div
                className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'rgba(196,167,125,0.18)', color: '#C4A77D' }}
              >
                {avatar ? (
                  <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#C4A77D' }}>{user.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(196,167,125,0.65)' }}>{user.email}</p>
              </div>
              <ChevronUp
                size={13}
                className={cn('shrink-0 transition-transform duration-200', profileOpen ? 'rotate-0' : 'rotate-180')}
                style={{ color: 'rgba(196,167,125,0.5)' }}
              />
            </button>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
          style={{ color: 'rgba(196,167,125,0.55)' }}
        >
          <LogOut size={15} strokeWidth={1.75} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}

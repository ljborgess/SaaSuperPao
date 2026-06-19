'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  UserCog,
  Users,
  ShieldCheck,
  UserCheck,
  Search,
  Loader2,
} from 'lucide-react'
import type { UserDto, UserRole, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

/* ── Mapa de estilos por role ────────────────────────────────────────────── */
const ROLE_CONFIG: Record<string, {
  label: string
  variant: 'danger' | 'gold' | 'info'
  bg: string
  dot: string
}> = {
  ADMIN:    { label: 'Admin',    variant: 'danger', bg: 'bg-red-50',     dot: 'bg-red-400' },
  MANAGER:  { label: 'Gerente',  variant: 'gold',   bg: 'bg-amber-50',   dot: 'bg-amber-400' },
  OPERATOR: { label: 'Operador', variant: 'info',   bg: 'bg-brand-50',   dot: 'bg-brand-400' },
}

const AVATAR_GRADIENTS = [
  'from-brand-500 to-brand-700',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-700',
  'from-rose-500 to-pink-600',
]

type FormState = { name: string; email: string; password: string; role: UserRole }
const EMPTY: FormState = { name: '', email: '', password: '', role: 'OPERATOR' }

/* ── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-card p-5 flex items-center gap-4">
      <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', accent)}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-brand-900 font-display leading-none mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ── User row ────────────────────────────────────────────────────────────── */
function UserRow({
  u,
  index,
  isLast,
  onEdit,
  onDelete,
}: {
  u: UserDto
  index: number
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const role = ROLE_CONFIG[u.role] ?? { label: u.role, variant: 'neutral' as const, bg: 'bg-surface-100', dot: 'bg-surface-400' }
  const initial = u.name?.charAt(0).toUpperCase() ?? '?'
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]

  return (
    <tr className={cn('group transition-colors hover:bg-surface-50/80', !isLast && 'border-b border-surface-100')}>
      {/* Nome */}
      <td className="table-cell">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm', gradient)}>
            {initial}
          </div>
          <div>
            <p className="font-semibold text-brand-900 text-sm leading-none">{u.name}</p>
            <p className="text-[11px] text-brand-400 mt-0.5">{u.email}</p>
          </div>
        </div>
      </td>

      {/* Perfil */}
      <td className="table-cell">
        <div className={cn('inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold', role.bg)}>
          <div className={cn('w-1.5 h-1.5 rounded-full', role.dot)} />
          {role.label}
        </div>
      </td>

      {/* Status */}
      <td className="table-cell">
        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
          {u.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
        </Badge>
      </td>

      {/* Data */}
      <td className="table-cell text-xs text-brand-400">
        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
      </td>

      {/* Ações */}
      <td className="table-cell">
        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="icon" size="icon" onClick={onEdit} aria-label="Editar">
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={onDelete}
            className="hover:text-red-500 hover:bg-red-50"
            aria-label="Excluir"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </td>
    </tr>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function UsuariosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)

  const { data, isLoading } = useQuery<PaginatedResponse<UserDto>>({
    queryKey: ['users', page, search],
    queryFn: () =>
      api.get('/api/users', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<FormState>) =>
      editing
        ? api.patch(`/api/users/${editing.id}`, payload)
        : api.post('/api/users', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success(editing ? 'Usuário atualizado.' : 'Usuário criado.')
      closeForm()
    },
    onError: (err: any) => {
      const d = err?.response?.data
      const msg = d?.error?.message ?? d?.message ?? d?.error ?? 'Erro ao salvar usuário.'
      toast.error(typeof msg === 'string' ? msg : 'Erro ao salvar usuário.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Usuário removido.')
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        'Erro ao remover usuário.'
      toast.error(typeof msg === 'string' ? msg : 'Erro ao remover usuário.')
    },
  })

  function openForm(user?: UserDto) {
    setEditing(user ?? null)
    setForm(
      user ? { name: user.name, email: user.email, password: '', role: user.role } : EMPTY,
    )
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Partial<FormState> = { name: form.name, email: form.email, role: form.role }
    if (!editing) payload.password = form.password
    saveMutation.mutate(payload)
  }

  const users = data?.data ?? []
  const total = data?.total ?? 0
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length
  const adminCount = users.filter((u) => u.role === 'ADMIN').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        description="Controle de acesso e permissões do sistema"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Novo usuário
          </Button>
        }
      />

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total de usuários"
          value={total}
          accent="bg-gradient-to-br from-brand-500 to-brand-700"
        />
        <StatCard
          icon={UserCheck}
          label="Usuários ativos"
          value={activeCount}
          accent="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={ShieldCheck}
          label="Administradores"
          value={adminCount}
          accent="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* ── Drawer de formulário ─────────────────────────────────────── */}
      <Drawer
        open={showForm}
        onClose={closeForm}
        title={editing ? 'Editar usuário' : 'Novo usuário'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
          <div>
            <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
              Nome completo *
            </label>
            <input
              required
              className="input-base w-full"
              placeholder="Ex: João da Silva"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
              E-mail *
            </label>
            <input
              required
              type="email"
              className="input-base w-full"
              placeholder="email@superpao.com.br"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          {!editing && (
            <div>
              <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
                Senha *
              </label>
              <input
                required
                type="password"
                className="input-base w-full"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5">
              Perfil de acesso
            </label>
            <select
              className="input-base w-full"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="OPERATOR">Operador — acesso padrão</option>
              <option value="MANAGER">Gerente — acesso ampliado</option>
              <option value="ADMIN">Admin — acesso total</option>
            </select>
          </div>

          <div className="mt-auto pt-4 flex gap-2 justify-end border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </>
              ) : editing ? (
                'Salvar alterações'
              ) : (
                'Criar usuário'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* ── Tabela ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-surface-200 shadow-card overflow-hidden">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-3.5 py-2.5 text-sm text-brand-900 bg-surface-50 border border-surface-200
                         rounded-xl placeholder:text-brand-300 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="text-xs text-brand-400 hover:text-brand-600 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-2xl flex items-center justify-center">
              <Loader2 size={20} className="text-brand-400 animate-spin" />
            </div>
            <p className="text-sm text-brand-400">Carregando usuários...</p>
          </div>
        ) : !users.length ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 bg-brand-50 rounded-3xl flex items-center justify-center">
              <UserCog size={26} className="text-brand-300" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-brand-600 mb-1">Nenhum usuário encontrado</p>
              <p className="text-sm text-brand-400">
                {search ? 'Tente outra busca ou' : 'Adicione usuários para'} controlar o acesso ao sistema.
              </p>
            </div>
            <Button size="sm" onClick={() => openForm()}>
              <Plus size={14} />
              Novo usuário
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50/60">
                    <th className="table-head">Usuário</th>
                    <th className="table-head">Perfil</th>
                    <th className="table-head">Status</th>
                    <th className="table-head">Desde</th>
                    <th className="table-head w-20" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <UserRow
                      key={u.id}
                      u={u}
                      index={i}
                      isLast={i === users.length - 1}
                      onEdit={() => openForm(u)}
                      onDelete={() => deleteMutation.mutate(u.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {(data?.totalPages ?? 0) > 1 && (
              <Pagination
                page={page}
                totalPages={data!.totalPages}
                total={data!.total}
                label="usuários"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

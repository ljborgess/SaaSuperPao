'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, UserCog } from 'lucide-react'
import type { UserDto, UserRole, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const ROLE_STYLES: Record<string, { label: string; variant: 'danger' | 'gold' | 'info' }> = {
  ADMIN: { label: 'Admin', variant: 'danger' },
  MANAGER: { label: 'Gerente', variant: 'gold' },
  OPERATOR: { label: 'Operador', variant: 'info' },
}

type FormState = { name: string; email: string; password: string; role: UserRole }
const EMPTY: FormState = { name: '', email: '', password: '', role: 'OPERATOR' }

export default function UsuariosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)

  const { data, isLoading } = useQuery<PaginatedResponse<UserDto>>({
    queryKey: ['users', page, search],
    queryFn: () => api.get('/api/users', { params: { page, limit: 20, search } }).then((r) => r.data),
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
      const msg = err?.response?.data?.error?.message ?? err?.response?.data?.message ?? 'Erro ao remover usuário.'
      toast.error(typeof msg === 'string' ? msg : 'Erro ao remover usuário.')
    },
  })

  function openForm(user?: UserDto) {
    setEditing(user ?? null)
    setForm(user ? { name: user.name, email: user.email, password: '', role: user.role } : EMPTY)
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

  return (
    <div>
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

      <Drawer open={showForm} onClose={closeForm} title={editing ? 'Editar usuário' : 'Novo usuário'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Nome *</label>
            <input required className="input-base w-full" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">E-mail *</label>
            <input required type="email" className="input-base w-full" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          {!editing && (
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">Senha *</label>
              <input required type="password" className="input-base w-full" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Perfil</label>
            <select className="input-base w-full" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
              <option value="OPERATOR">Operador</option>
              <option value="MANAGER">Gerente</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="mt-auto pt-4 flex gap-2 justify-end border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
          </div>
        </form>
      </Drawer>

      <Card>
        <div className="px-6 py-4 border-b border-surface-200">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Buscar usuário..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={UserCog} message="Carregando usuários..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={UserCog}
            title="Nenhum usuário encontrado"
            description="Adicione usuários para controlar o acesso ao sistema."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Nome</th>
                    <th className="table-head">E-mail</th>
                    <th className="table-head text-center">Perfil</th>
                    <th className="table-head text-center">Status</th>
                    <th className="table-head">Desde</th>
                    <th className="table-head w-20" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((u, i) => {
                    const roleStyle = ROLE_STYLES[u.role] ?? { label: u.role, variant: 'neutral' as const }
                    const initial = u.name?.charAt(0).toUpperCase() ?? '?'
                    return (
                      <tr
                        key={u.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors group',
                          i < data.data.length - 1 && 'border-b border-surface-100',
                        )}
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {initial}
                            </div>
                            <span className="font-semibold">{u.name}</span>
                          </div>
                        </td>
                        <td className="table-cell text-brand-500 text-xs">{u.email}</td>
                        <td className="table-cell text-center">
                          <Badge variant={roleStyle.variant}>{roleStyle.label}</Badge>
                        </td>
                        <td className="table-cell text-center">
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {u.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="table-cell text-xs text-brand-400">
                          {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="icon" size="icon" onClick={() => openForm(u)} aria-label="Editar">
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="icon"
                              size="icon"
                              onClick={() => deleteMutation.mutate(u.id)}
                              className="hover:text-red-500 hover:bg-red-50"
                              aria-label="Excluir"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={data.totalPages}
                total={data.total}
                label="usuários"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

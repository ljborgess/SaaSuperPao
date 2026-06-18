'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, UserCircle } from 'lucide-react'
import type { ClientDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

type FormState = { name: string; email: string; phone: string; whatsapp: string; cpfCnpj: string; address: string }
const EMPTY: FormState = { name: '', email: '', phone: '', whatsapp: '', cpfCnpj: '', address: '' }

export default function ClientesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ClientDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)

  const { data, isLoading } = useQuery<PaginatedResponse<ClientDto>>({
    queryKey: ['clients', page, search],
    queryFn: () => api.get('/api/clients', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<FormState>) =>
      editing
        ? api.patch(`/api/clients/${editing.id}`, payload)
        : api.post('/api/clients', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success(editing ? 'Cliente atualizado.' : 'Cliente criado.')
      closeForm()
    },
    onError: () => toast.error('Erro ao salvar cliente.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/clients/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente removido.')
    },
    onError: () => toast.error('Erro ao remover cliente.'),
  })

  function openForm(client?: ClientDto) {
    setEditing(client ?? null)
    setForm(client ? {
      name: client.name,
      email: client.email ?? '',
      phone: client.phone ?? '',
      whatsapp: client.whatsapp ?? '',
      cpfCnpj: client.cpfCnpj ?? '',
      address: client.address ?? '',
    } : EMPTY)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setForm(EMPTY)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Partial<FormState> = { name: form.name }
    if (form.email) payload.email = form.email
    if (form.phone) payload.phone = form.phone
    if (form.whatsapp) payload.whatsapp = form.whatsapp
    if (form.cpfCnpj) payload.cpfCnpj = form.cpfCnpj
    if (form.address) payload.address = form.address
    saveMutation.mutate(payload)
  }

  function field(key: keyof FormState) {
    return { value: form[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })) }
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro e relacionamento com clientes"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Novo cliente
          </Button>
        }
      />

      {showForm && (
        <Card padding className="mb-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-brand-900 mb-4">
            {editing ? 'Editar cliente' : 'Novo cliente'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Nome *" className="input-base" {...field('name')} />
              <input placeholder="E-mail" type="email" className="input-base" {...field('email')} />
              <input placeholder="Telefone" className="input-base" {...field('phone')} />
              <input placeholder="WhatsApp" className="input-base" {...field('whatsapp')} />
              <input placeholder="CPF / CNPJ" className="input-base" {...field('cpfCnpj')} />
              <input placeholder="Endereço" className="input-base" {...field('address')} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-surface-200">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Buscar cliente..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={UserCircle} message="Carregando clientes..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={UserCircle}
            title="Nenhum cliente cadastrado"
            description="Cadastre clientes para gerenciar seu relacionamento."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Nome</th>
                    <th className="table-head">E-mail</th>
                    <th className="table-head">Telefone</th>
                    <th className="table-head">CPF/CNPJ</th>
                    <th className="table-head text-center">Tipo</th>
                    <th className="table-head w-20" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((c, i) => (
                    <tr
                      key={c.id}
                      className={cn(
                        'hover:bg-surface-50/80 transition-colors group',
                        i < data.data.length - 1 && 'border-b border-surface-100',
                      )}
                    >
                      <td className="table-cell font-semibold">{c.name}</td>
                      <td className="table-cell text-brand-500 text-xs">
                        {c.email ?? <span className="text-brand-300">—</span>}
                      </td>
                      <td className="table-cell text-brand-500 text-xs">
                        {c.phone ?? <span className="text-brand-300">—</span>}
                      </td>
                      <td className="table-cell text-brand-500 text-xs font-mono">
                        {c.cpfCnpj ?? <span className="text-brand-300">—</span>}
                      </td>
                      <td className="table-cell text-center">
                        <Badge variant="info">
                          {c.cpfCnpj && c.cpfCnpj.replace(/\D/g, '').length > 11 ? 'PJ' : 'PF'}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="icon" size="icon" onClick={() => openForm(c)} aria-label="Editar">
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => deleteMutation.mutate(c.id)}
                            className="hover:text-red-500 hover:bg-red-50"
                            aria-label="Excluir"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={data.totalPages}
                total={data.total}
                label="clientes"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

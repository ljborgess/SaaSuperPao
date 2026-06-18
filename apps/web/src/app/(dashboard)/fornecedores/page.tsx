'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import type { SupplierDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

type FormState = { razaoSocial: string; nomeFantasia: string; cnpj: string; contact: string; phone: string; email: string; address: string }
const EMPTY: FormState = { razaoSocial: '', nomeFantasia: '', cnpj: '', contact: '', phone: '', email: '', address: '' }

export default function FornecedoresPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<SupplierDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)

  const { data, isLoading } = useQuery<PaginatedResponse<SupplierDto>>({
    queryKey: ['suppliers', page, search],
    queryFn: () => api.get('/api/suppliers', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<FormState>) =>
      editing
        ? api.patch(`/api/suppliers/${editing.id}`, payload)
        : api.post('/api/suppliers', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success(editing ? 'Fornecedor atualizado.' : 'Fornecedor criado.')
      closeForm()
    },
    onError: () => toast.error('Erro ao salvar fornecedor.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/suppliers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Fornecedor removido.')
    },
    onError: () => toast.error('Erro ao remover fornecedor.'),
  })

  function openForm(supplier?: SupplierDto) {
    setEditing(supplier ?? null)
    setForm(supplier ? {
      razaoSocial: supplier.razaoSocial,
      nomeFantasia: supplier.nomeFantasia ?? '',
      cnpj: supplier.cnpj ?? '',
      contact: supplier.contact ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
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
    const payload: Partial<FormState> = { razaoSocial: form.razaoSocial }
    if (form.nomeFantasia) payload.nomeFantasia = form.nomeFantasia
    if (form.cnpj) payload.cnpj = form.cnpj
    if (form.contact) payload.contact = form.contact
    if (form.phone) payload.phone = form.phone
    if (form.email) payload.email = form.email
    if (form.address) payload.address = form.address
    saveMutation.mutate(payload)
  }

  function field(key: keyof FormState) {
    return { value: form[key], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })) }
  }

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        description="Cadastro e gestão de fornecedores parceiros"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Novo fornecedor
          </Button>
        }
      />

      {showForm && (
        <Card padding className="mb-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-brand-900 mb-4">
            {editing ? 'Editar fornecedor' : 'Novo fornecedor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input required placeholder="Razão social *" className="input-base" {...field('razaoSocial')} />
              <input placeholder="Nome fantasia" className="input-base" {...field('nomeFantasia')} />
              <input placeholder="CNPJ" className="input-base" {...field('cnpj')} />
              <input placeholder="Contato" className="input-base" {...field('contact')} />
              <input placeholder="Telefone" className="input-base" {...field('phone')} />
              <input placeholder="E-mail" type="email" className="input-base" {...field('email')} />
              <input placeholder="Endereço" className="input-base col-span-full" {...field('address')} />
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
            placeholder="Buscar fornecedor..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={Truck} message="Carregando fornecedores..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={Truck}
            title="Nenhum fornecedor cadastrado"
            description="Adicione fornecedores para gerenciar suas compras."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Nome</th>
                    <th className="table-head">Contato</th>
                    <th className="table-head">E-mail</th>
                    <th className="table-head">Telefone</th>
                    <th className="table-head w-20" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((s, i) => (
                    <tr
                      key={s.id}
                      className={cn(
                        'hover:bg-surface-50/80 transition-colors group',
                        i < data.data.length - 1 && 'border-b border-surface-100',
                      )}
                    >
                      <td className="table-cell font-semibold">{s.razaoSocial}</td>
                      <td className="table-cell text-brand-500">
                        {s.contact ?? <span className="text-brand-300">—</span>}
                      </td>
                      <td className="table-cell text-brand-500 text-xs">
                        {s.email ?? <span className="text-brand-300">—</span>}
                      </td>
                      <td className="table-cell text-brand-500 text-xs">
                        {s.phone ?? <span className="text-brand-300">—</span>}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="icon" size="icon" onClick={() => openForm(s)} aria-label="Editar">
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => deleteMutation.mutate(s.id)}
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
                label="fornecedores"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

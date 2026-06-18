'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { formatCurrency } from '@superpao/shared-utils'
import type { ProductDto, ProductUnit, CategoryDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

type FormState = { name: string; code: string; categoryId: string; unit: ProductUnit; costPrice: string; salePrice: string; minStock: string }
const EMPTY: FormState = { name: '', code: '', categoryId: '', unit: 'UN', costPrice: '', salePrice: '', minStock: '' }
const UNITS: ProductUnit[] = ['UN', 'KG', 'G', 'L', 'ML', 'CX', 'PCT']

export default function ProdutosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ProductDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)

  const { data, isLoading } = useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products', page, search],
    queryFn: () => api.get('/api/products', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const { data: categories } = useQuery<PaginatedResponse<CategoryDto>>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories', { params: { page: 1, limit: 100 } }).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: object) =>
      editing
        ? api.patch(`/api/products/${editing.id}`, payload)
        : api.post('/api/products', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(editing ? 'Produto atualizado.' : 'Produto criado.')
      closeForm()
    },
    onError: () => toast.error('Erro ao salvar produto.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Produto removido.')
    },
    onError: () => toast.error('Erro ao remover produto.'),
  })

  function openForm(product?: ProductDto) {
    setEditing(product ?? null)
    setForm(product ? {
      name: product.name,
      code: product.code,
      categoryId: product.category?.id ?? '',
      unit: product.unit,
      costPrice: String(product.costPrice),
      salePrice: String(product.salePrice),
      minStock: String(product.minStock),
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
    const payload: Record<string, unknown> = {
      name: form.name,
      code: form.code,
      unit: form.unit,
      costPrice: parseFloat(form.costPrice),
      salePrice: parseFloat(form.salePrice),
    }
    if (form.categoryId) payload.categoryId = form.categoryId
    if (form.minStock) payload.minStock = parseInt(form.minStock, 10)
    saveMutation.mutate(payload)
  }

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Gerencie o catálogo completo de produtos da padaria"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Novo produto
          </Button>
        }
      />

      {showForm && (
        <Card padding className="mb-6 animate-slide-up">
          <h3 className="text-sm font-semibold text-brand-900 mb-4">
            {editing ? 'Editar produto' : 'Novo produto'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                required
                placeholder="Nome *"
                className="input-base sm:col-span-2"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              />
              <input
                required
                placeholder="Código *"
                className="input-base"
                value={form.code}
                onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
              />
              <select
                className="input-base"
                value={form.categoryId}
                onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Sem categoria</option>
                {categories?.data.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                className="input-base"
                value={form.unit}
                onChange={(e) => setForm(f => ({ ...f, unit: e.target.value as ProductUnit }))}
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="Estoque mínimo"
                className="input-base"
                value={form.minStock}
                onChange={(e) => setForm(f => ({ ...f, minStock: e.target.value }))}
              />
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="Preço de custo *"
                className="input-base"
                value={form.costPrice}
                onChange={(e) => setForm(f => ({ ...f, costPrice: e.target.value }))}
              />
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="Preço de venda *"
                className="input-base"
                value={form.salePrice}
                onChange={(e) => setForm(f => ({ ...f, salePrice: e.target.value }))}
              />
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
            placeholder="Buscar por nome ou código..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={Package} message="Carregando produtos..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description="Cadastre seu primeiro produto para começar."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Código</th>
                    <th className="table-head">Nome</th>
                    <th className="table-head">Categoria</th>
                    <th className="table-head text-right">Custo</th>
                    <th className="table-head text-right">Venda</th>
                    <th className="table-head text-right">Estoque</th>
                    <th className="table-head text-center">Status</th>
                    <th className="table-head w-20" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p, i) => (
                    <tr
                      key={p.id}
                      className={cn(
                        'hover:bg-surface-50/80 transition-colors group',
                        i < data.data.length - 1 && 'border-b border-surface-100',
                      )}
                    >
                      <td className="table-cell text-xs text-brand-400 font-mono">{p.code}</td>
                      <td className="table-cell font-semibold">{p.name}</td>
                      <td className="table-cell">
                        {p.category ? (
                          <Badge variant="neutral">{p.category.name}</Badge>
                        ) : (
                          <span className="text-brand-300">—</span>
                        )}
                      </td>
                      <td className="table-cell text-right text-brand-500 text-xs">
                        {formatCurrency(p.costPrice)}
                      </td>
                      <td className="table-cell text-right font-semibold">
                        {formatCurrency(p.salePrice)}
                      </td>
                      <td className="table-cell text-right">
                        <span
                          className={cn(
                            'font-semibold',
                            p.currentStock <= p.minStock ? 'text-red-500' : 'text-brand-800',
                          )}
                        >
                          {p.currentStock}
                        </span>
                        <span className="text-xs text-brand-400 ml-1">{p.unit}</span>
                      </td>
                      <td className="table-cell text-center">
                        <Badge variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {p.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="icon" size="icon" onClick={() => openForm(p)} aria-label="Editar">
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="icon"
                            size="icon"
                            onClick={() => deleteMutation.mutate(p.id)}
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
                label={`produto${data.total !== 1 ? 's' : ''}`}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { Factory, Plus, X } from 'lucide-react'
import type { ProductionOrderDto, ProductDto, UserDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, { label: string; variant: 'warning' | 'info' | 'success' | 'neutral' }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  IN_PROGRESS: { label: 'Em andamento', variant: 'info' },
  COMPLETED: { label: 'Concluída', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'neutral' },
}

export default function ProducaoPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [responsibleId, setResponsibleId] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse<ProductionOrderDto>>({
    queryKey: ['production-orders', page, search],
    queryFn: () =>
      api.get('/api/production', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const { data: products } = useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/api/products', { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: showForm,
  })

  const { data: users } = useQuery<PaginatedResponse<UserDto>>({
    queryKey: ['users-all'],
    queryFn: () => api.get('/api/users', { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: showForm,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: object) => api.post('/api/production', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-orders'] })
      closeForm()
    },
    onError: () => alert('Erro ao criar ordem de produção.'),
  })

  function closeForm() {
    setShowForm(false)
    setProductId('')
    setQuantity('')
    setScheduledDate('')
    setResponsibleId('')
    setNotes('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMutation.mutate({
      productId,
      quantity: parseFloat(quantity),
      scheduledDate: scheduledDate || undefined,
      responsibleId,
      notes: notes || undefined,
    })
  }

  return (
    <div>
      <PageHeader
        title="Produção"
        description="Ordens de produção e controle de fabricação"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Nova ordem
          </Button>
        }
      />

      {showForm && (
        <Card padding className="mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-900">Nova ordem de produção</h3>
            <Button type="button" variant="icon" size="icon" onClick={closeForm} aria-label="Fechar">
              <X size={16} />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                required
                className="input-base"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Produto *</option>
                {products?.data.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                required
                type="number"
                step="0.001"
                min="0"
                placeholder="Quantidade *"
                className="input-base"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <input
                type="date"
                placeholder="Data prevista"
                className="input-base"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <select
                required
                className="input-base"
                value={responsibleId}
                onChange={(e) => setResponsibleId(e.target.value)}
              >
                <option value="">Responsável *</option>
                {users?.data.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <input
                placeholder="Observações"
                className="input-base sm:col-span-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Criar ordem'}
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
            placeholder="Buscar ordem..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={Factory} message="Carregando ordens..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={Factory}
            title="Nenhuma ordem de produção"
            description="Crie ordens de produção para iniciar a fabricação."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Nº</th>
                    <th className="table-head">Produto</th>
                    <th className="table-head text-right">Qtd. planejada</th>
                    <th className="table-head text-right">Qtd. produzida</th>
                    <th className="table-head">Data</th>
                    <th className="table-head text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((o, i) => {
                    const style = STATUS_STYLES[o.status] ?? { label: o.status, variant: 'neutral' as const }
                    return (
                      <tr
                        key={o.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors',
                          i < data.data.length - 1 && 'border-b border-surface-100',
                        )}
                      >
                        <td className="table-cell text-xs text-brand-400 font-mono">
                          {o.id.slice(0, 8)}
                        </td>
                        <td className="table-cell font-medium">{o.product?.name ?? '—'}</td>
                        <td className="table-cell text-right text-brand-600">{o.quantity}</td>
                        <td className="table-cell text-right font-semibold">
                          {o.status === 'COMPLETED' ? o.quantity : '—'}
                        </td>
                        <td className="table-cell text-xs text-brand-400">
                          {new Date(o.scheduledDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="table-cell text-center">
                          <Badge variant={style.variant}>{style.label}</Badge>
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
                label="ordens"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

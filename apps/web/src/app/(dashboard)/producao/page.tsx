'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Factory, Plus, X, Pencil, CheckCircle2, XCircle } from 'lucide-react'
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

const EDITABLE_STATUSES = ['PENDING', 'IN_PROGRESS']

export default function ProducaoPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingOrder, setEditingOrder] = useState<ProductionOrderDto | null>(null)

  // Create form fields
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [responsibleId, setResponsibleId] = useState('')
  const [mode, setMode] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC')

  // Shared fields (create + edit)
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse<ProductionOrderDto>>({
    queryKey: ['production-orders', page, search],
    queryFn: () => api.get('/api/production', { params: { page, limit: 20, search } }).then(r => r.data),
  })

  const { data: products } = useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/api/products', { params: { page: 1, limit: 200 } }).then(r => r.data),
    enabled: showForm && !editingOrder,
  })

  const { data: users } = useQuery<PaginatedResponse<UserDto>>({
    queryKey: ['users-all'],
    queryFn: () => api.get('/api/users', { params: { page: 1, limit: 200 } }).then(r => r.data),
    enabled: showForm && !editingOrder,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: object) =>
      editingOrder
        ? api.patch(`/api/production/${editingOrder.id}`, payload)
        : api.post('/api/production', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-orders'] })
      toast.success(editingOrder ? 'Ordem atualizada.' : 'Ordem de produção criada.')
      closeForm()
    },
    onError: () => toast.error('Erro ao salvar ordem de produção.'),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/production/${id}/complete`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-orders'] })
      toast.success('Ordem concluída. Estoque atualizado.')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Erro ao concluir ordem.'),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/production/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production-orders'] })
      toast.success('Ordem cancelada.')
    },
    onError: () => toast.error('Erro ao cancelar ordem.'),
  })

  function closeForm() {
    setShowForm(false)
    setEditingOrder(null)
    setProductId('')
    setQuantity('')
    setScheduledDate('')
    setResponsibleId('')
    setNotes('')
    setMode('AUTOMATIC')
  }

  function openEdit(o: ProductionOrderDto) {
    setEditingOrder(o)
    setScheduledDate(o.scheduledDate ? o.scheduledDate.slice(0, 10) : '')
    setNotes(o.notes ?? '')
    setShowForm(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingOrder) {
      saveMutation.mutate({
        scheduledDate: scheduledDate || undefined,
        notes: notes || undefined,
      })
    } else {
      saveMutation.mutate({
        productId,
        quantity: parseFloat(quantity),
        scheduledDate: scheduledDate || undefined,
        responsibleId,
        mode,
        notes: notes || undefined,
      })
    }
  }

  return (
    <div>
      <PageHeader
        title="Produção"
        description="Ordens de produção e controle de fabricação"
        action={
          <Button onClick={() => { setEditingOrder(null); setShowForm(true) }}>
            <Plus size={16} />
            Nova ordem
          </Button>
        }
      />

      {showForm && (
        <Card padding className="mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-900">
              {editingOrder ? 'Editar ordem' : 'Nova ordem de produção'}
            </h3>
            <Button type="button" variant="icon" size="icon" onClick={closeForm} aria-label="Fechar">
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {!editingOrder && (
              <>
                {/* Mode toggle */}
                <div>
                  <p className="text-xs text-brand-500 mb-1.5 font-medium">Modo de produção</p>
                  <div className="flex rounded-xl border border-surface-200 overflow-hidden w-fit">
                    {(['AUTOMATIC', 'MANUAL'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                          'px-5 py-2 text-sm font-semibold transition-colors',
                          mode === m ? 'bg-brand-600 text-white' : 'text-brand-400 hover:bg-surface-50',
                        )}
                      >
                        {m === 'AUTOMATIC' ? 'Automático' : 'Manual'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-brand-400 mt-1">
                    {mode === 'AUTOMATIC'
                      ? 'Deduz os ingredientes conforme a receita ao concluir.'
                      : 'Você informa o consumo real de cada ingrediente antes de concluir.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select required className="input-base" value={productId} onChange={e => setProductId(e.target.value)}>
                    <option value="">Produto *</option>
                    {products?.data.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input
                    required
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Quantidade *"
                    className="input-base"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                  />
                  <select required className="input-base" value={responsibleId} onChange={e => setResponsibleId(e.target.value)}>
                    <option value="">Responsável *</option>
                    {users?.data.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="date"
                placeholder="Data prevista"
                className="input-base"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
              />
              <input
                placeholder="Observações"
                className={cn('input-base', !editingOrder && 'sm:col-span-1')}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : editingOrder ? 'Salvar' : 'Criar ordem'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-surface-200">
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Buscar ordem..." />
        </div>

        {isLoading ? (
          <LoadingState icon={Factory} message="Carregando ordens..." />
        ) : !data?.data.length ? (
          <EmptyState icon={Factory} title="Nenhuma ordem de produção" description="Crie ordens de produção para iniciar a fabricação." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Nº</th>
                    <th className="table-head">Produto</th>
                    <th className="table-head text-right">Quantidade</th>
                    <th className="table-head">Data</th>
                    <th className="table-head text-center">Modo</th>
                    <th className="table-head text-center">Status</th>
                    <th className="table-head w-32" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((o, i) => {
                    const style = STATUS_STYLES[o.status] ?? { label: o.status, variant: 'neutral' as const }
                    const canEdit = EDITABLE_STATUSES.includes(o.status)
                    const isPending = completeMutation.isPending || cancelMutation.isPending
                    return (
                      <tr
                        key={o.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors group',
                          i < data.data.length - 1 && 'border-b border-surface-100',
                        )}
                      >
                        <td className="table-cell text-xs text-brand-400 font-mono">{o.id.slice(0, 8)}</td>
                        <td className="table-cell font-medium">{o.product?.name ?? '—'}</td>
                        <td className="table-cell text-right font-semibold text-brand-700">{o.quantity}</td>
                        <td className="table-cell text-xs text-brand-400">
                          {new Date(o.scheduledDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="table-cell text-center">
                          <Badge variant={o.mode === 'MANUAL' ? 'info' : 'neutral'}>
                            {o.mode === 'MANUAL' ? 'Manual' : 'Auto'}
                          </Badge>
                        </td>
                        <td className="table-cell text-center">
                          <Badge variant={style.variant}>{style.label}</Badge>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-0.5">
                            {canEdit && (
                              <Button
                                variant="icon"
                                size="icon"
                                onClick={() => openEdit(o)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Editar"
                              >
                                <Pencil size={14} />
                              </Button>
                            )}
                            {canEdit && (
                              <Button
                                variant="ghost"
                                onClick={() => completeMutation.mutate(o.id)}
                                disabled={isPending}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Concluir"
                              >
                                <CheckCircle2 size={14} />
                                Concluir
                              </Button>
                            )}
                            {canEdit && (
                              <Button
                                variant="icon"
                                size="icon"
                                onClick={() => cancelMutation.mutate(o.id)}
                                disabled={isPending}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50"
                                aria-label="Cancelar"
                              >
                                <XCircle size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <Pagination page={page} totalPages={data.totalPages} total={data.total} label="ordens" onPageChange={setPage} />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

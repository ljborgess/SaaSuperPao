'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { ShoppingCart, Plus, Trash2, X, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@superpao/shared-utils'
import type { PurchaseDto, SupplierDto, IngredientDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, { label: string; variant: 'warning' | 'success' | 'neutral' }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  RECEIVED: { label: 'Recebida', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'neutral' },
}

type ItemLine = { ingredientId: string; quantity: string; unitPrice: string }
const EMPTY_ITEM: ItemLine = { ingredientId: '', quantity: '', unitPrice: '' }

export default function ComprasPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [supplierId, setSupplierId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ItemLine[]>([{ ...EMPTY_ITEM }])

  const { data, isLoading } = useQuery<PaginatedResponse<PurchaseDto>>({
    queryKey: ['purchases', page, search],
    queryFn: () => api.get('/api/purchases', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const { data: suppliers } = useQuery<PaginatedResponse<SupplierDto>>({
    queryKey: ['suppliers-all'],
    queryFn: () => api.get('/api/suppliers', { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: showForm,
  })

  const { data: ingredients } = useQuery<PaginatedResponse<IngredientDto>>({
    queryKey: ['ingredients-all'],
    queryFn: () => api.get('/api/inventory/ingredients', { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: showForm,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: object) => api.post('/api/purchases', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      closeForm()
    },
    onError: () => alert('Erro ao registrar compra.'),
  })

  const receiveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/purchases/${id}/receive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
    onError: () => alert('Erro ao receber compra.'),
  })

  function closeForm() {
    setShowForm(false)
    setSupplierId('')
    setPurchaseDate('')
    setInvoiceNumber('')
    setNotes('')
    setItems([{ ...EMPTY_ITEM }])
  }

  function updateItem(index: number, field: keyof ItemLine, value: string) {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it))
  }

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM }])
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      supplierId,
      purchaseDate: purchaseDate || undefined,
      invoiceNumber: invoiceNumber || undefined,
      notes: notes || undefined,
      items: items
        .filter(it => it.ingredientId && it.quantity && it.unitPrice)
        .map(it => ({
          ingredientId: it.ingredientId,
          quantity: parseFloat(it.quantity),
          unitPrice: parseFloat(it.unitPrice),
        })),
    }
    saveMutation.mutate(payload)
  }

  const itemsTotal = items.reduce((sum, it) => {
    const q = parseFloat(it.quantity) || 0
    const p = parseFloat(it.unitPrice) || 0
    return sum + q * p
  }, 0)

  return (
    <div>
      <PageHeader
        title="Compras"
        description="Pedidos de compra e recebimento de fornecedores"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Nova compra
          </Button>
        }
      />

      {showForm && (
        <Card padding className="mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-900">Nova compra</h3>
            <Button type="button" variant="icon" size="icon" onClick={closeForm} aria-label="Fechar">
              <X size={16} />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                required
                className="input-base"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Fornecedor *</option>
                {suppliers?.data.map((s) => (
                  <option key={s.id} value={s.id}>{s.razaoSocial}</option>
                ))}
              </select>
              <input
                type="date"
                className="input-base"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
              <input
                placeholder="Nº da nota fiscal"
                className="input-base"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
              <input
                placeholder="Observações"
                className="input-base sm:col-span-3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="border border-surface-200 rounded-xl overflow-hidden">
              <div className="bg-surface-50 px-4 py-2 border-b border-surface-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600">Itens da compra</span>
                <Button type="button" variant="ghost" onClick={addItem}>
                  <Plus size={14} />
                  Adicionar item
                </Button>
              </div>
              <div className="divide-y divide-surface-100">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center px-4 py-2">
                    <select
                      required
                      className="input-base flex-1"
                      value={item.ingredientId}
                      onChange={(e) => updateItem(idx, 'ingredientId', e.target.value)}
                    >
                      <option value="">Ingrediente *</option>
                      {ingredients?.data.map((ing) => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                      ))}
                    </select>
                    <input
                      required
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Quantidade *"
                      className="input-base w-32"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                    />
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Preço unit. *"
                      className="input-base w-32"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                    />
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="icon"
                        size="icon"
                        onClick={() => removeItem(idx)}
                        className="hover:text-red-500 hover:bg-red-50 shrink-0"
                        aria-label="Remover item"
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {itemsTotal > 0 && (
                <div className="px-4 py-2 bg-surface-50 border-t border-surface-200 text-right">
                  <span className="text-xs text-brand-500">Total: </span>
                  <span className="text-sm font-bold text-brand-900">{formatCurrency(itemsTotal)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Salvando...' : 'Registrar compra'}
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
            placeholder="Buscar compra..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={ShoppingCart} message="Carregando compras..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={ShoppingCart}
            title="Nenhuma compra encontrada"
            description="Registre pedidos de compra para seus fornecedores."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Nº</th>
                    <th className="table-head">Fornecedor</th>
                    <th className="table-head">Data</th>
                    <th className="table-head text-right">Total</th>
                    <th className="table-head text-center">Status</th>
                    <th className="table-head" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p, i) => {
                    const style = STATUS_STYLES[p.status] ?? { label: p.status, variant: 'neutral' as const }
                    return (
                      <tr
                        key={p.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors',
                          i < data.data.length - 1 && 'border-b border-surface-100',
                        )}
                      >
                        <td className="table-cell text-xs text-brand-400 font-mono">
                          {p.id.slice(0, 8)}
                        </td>
                        <td className="table-cell font-medium">
                          {p.supplier?.razaoSocial ?? '—'}
                        </td>
                        <td className="table-cell text-xs text-brand-500">
                          {new Date(p.purchaseDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="table-cell text-right font-semibold">
                          {formatCurrency(p.totalValue)}
                        </td>
                        <td className="table-cell text-center">
                          <Badge variant={style.variant}>{style.label}</Badge>
                        </td>
                        <td className="table-cell text-center">
                          {p.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              onClick={() => receiveMutation.mutate(p.id)}
                              disabled={receiveMutation.isPending}
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs"
                            >
                              <CheckCircle2 size={14} />
                              Receber
                            </Button>
                          )}
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
                label="compras"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

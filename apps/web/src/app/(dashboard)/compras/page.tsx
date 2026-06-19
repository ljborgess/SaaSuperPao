'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { ShoppingCart, Plus, Trash2, CheckCircle2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@superpao/shared-utils'
import type { PurchaseDto, SupplierDto, IngredientDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
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
  const [editingPurchase, setEditingPurchase] = useState<PurchaseDto | null>(null)
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
    mutationFn: (payload: object) =>
      editingPurchase
        ? api.patch(`/api/purchases/${editingPurchase.id}`, payload)
        : api.post('/api/purchases', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(editingPurchase ? 'Compra atualizada.' : 'Compra registrada.')
      closeForm()
    },
    onError: () => toast.error('Erro ao salvar compra.'),
  })

  const receiveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/purchases/${id}/receive`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success('Compra recebida. Estoque atualizado.')
    },
    onError: () => toast.error('Erro ao receber compra.'),
  })

  function closeForm() {
    setShowForm(false)
    setEditingPurchase(null)
    setSupplierId('')
    setPurchaseDate('')
    setInvoiceNumber('')
    setNotes('')
    setItems([{ ...EMPTY_ITEM }])
  }

  function openEdit(p: PurchaseDto) {
    setEditingPurchase(p)
    setPurchaseDate(p.purchaseDate ? p.purchaseDate.slice(0, 10) : '')
    setInvoiceNumber(p.invoiceNumber ?? '')
    setNotes(p.notes ?? '')
    setShowForm(true)
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
    if (editingPurchase) {
      saveMutation.mutate({
        purchaseDate: purchaseDate || undefined,
        invoiceNumber: invoiceNumber || undefined,
        notes: notes || undefined,
      })
    } else {
      saveMutation.mutate({
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
      })
    }
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

      <Drawer open={showForm} onClose={closeForm} title={editingPurchase ? 'Editar compra' : 'Nova compra'} width="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          {!editingPurchase && (
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">Fornecedor *</label>
              <select required className="input-base w-full" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">Selecionar...</option>
                {suppliers?.data.map((s) => <option key={s.id} value={s.id}>{s.razaoSocial}</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">Data</label>
              <input type="date" className="input-base w-full" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">Nº nota fiscal</label>
              <input className="input-base w-full" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Observações</label>
            <input className="input-base w-full" placeholder="Opcional" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {!editingPurchase && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-brand-500">Itens da compra</label>
                <Button type="button" variant="ghost" onClick={addItem}>
                  <Plus size={14} />
                  Adicionar item
                </Button>
              </div>
              <div className="border border-surface-200 rounded-xl overflow-hidden divide-y divide-surface-100">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center px-3 py-2">
                    <select required className="input-base flex-1 min-w-0" value={item.ingredientId} onChange={(e) => updateItem(idx, 'ingredientId', e.target.value)}>
                      <option value="">Ingrediente *</option>
                      {ingredients?.data.map((ing) => <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>)}
                    </select>
                    <input required type="number" step="0.001" min="0" placeholder="Qtd" className="input-base w-20 shrink-0" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                    <input required type="number" step="0.01" min="0" placeholder="R$ unit." className="input-base w-24 shrink-0" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} />
                    {items.length > 1 && (
                      <Button type="button" variant="icon" size="icon" onClick={() => removeItem(idx)} className="hover:text-red-500 hover:bg-red-50 shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {itemsTotal > 0 && (
                <div className="text-right mt-1.5">
                  <span className="text-xs text-brand-500">Total: </span>
                  <span className="text-sm font-bold text-brand-900">{formatCurrency(itemsTotal)}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 flex gap-2 justify-end border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : editingPurchase ? 'Salvar alterações' : 'Registrar compra'}
            </Button>
          </div>
        </form>
      </Drawer>

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
                    <th className="table-head w-28" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p, i) => {
                    const style = STATUS_STYLES[p.status] ?? { label: p.status, variant: 'neutral' as const }
                    return (
                      <tr
                        key={p.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors group',
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
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-1">
                            {p.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="icon"
                                  size="icon"
                                  onClick={() => openEdit(p)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label="Editar"
                                >
                                  <Pencil size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => receiveMutation.mutate(p.id)}
                                  disabled={receiveMutation.isPending}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs"
                                >
                                  <CheckCircle2 size={14} />
                                  Receber
                                </Button>
                              </>
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

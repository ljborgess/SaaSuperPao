'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { Boxes, TrendingDown, TrendingUp, ArrowLeftRight, Plus, X } from 'lucide-react'
import type {
  StockMovementDto,
  PaginatedResponse,
  IngredientDto,
  ProductDto,
  CreateStockMovementDto,
  MovementType,
  MovementReason,
} from '@superpao/shared-types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' }> = {
  IN: { label: 'Entrada', variant: 'success' },
  OUT: { label: 'Saída', variant: 'danger' },
  ADJUSTMENT: { label: 'Ajuste', variant: 'warning' },
}

const REASON_LABELS: Record<string, string> = {
  PURCHASE: 'Compra',
  PRODUCTION: 'Produção',
  SALE: 'Venda',
  LOSS: 'Perda',
  INTERNAL_USE: 'Uso interno',
  MANUAL_ADJUSTMENT: 'Ajuste manual',
  INITIAL_STOCK: 'Estoque inicial',
}

const REASONS_BY_TYPE: Record<MovementType, { value: MovementReason; label: string }[]> = {
  IN: [
    { value: 'INITIAL_STOCK', label: 'Estoque inicial' },
    { value: 'MANUAL_ADJUSTMENT', label: 'Ajuste manual' },
  ],
  OUT: [
    { value: 'SALE', label: 'Venda' },
    { value: 'LOSS', label: 'Perda' },
    { value: 'INTERNAL_USE', label: 'Uso interno' },
    { value: 'MANUAL_ADJUSTMENT', label: 'Ajuste manual' },
  ],
  ADJUSTMENT: [
    { value: 'MANUAL_ADJUSTMENT', label: 'Ajuste manual' },
  ],
}

function getItemName(m: StockMovementDto) {
  return m.ingredient?.name ?? m.product?.name ?? '—'
}

function getUnit(m: StockMovementDto) {
  return m.ingredient?.unit ?? m.product?.unit ?? ''
}

const EMPTY_FORM = {
  type: 'IN' as MovementType,
  itemType: 'ingredient' as 'ingredient' | 'product',
  itemId: '',
  quantity: '',
  reason: 'INITIAL_STOCK' as MovementReason,
  notes: '',
}

export default function EstoquePage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })

  const { data, isLoading } = useQuery<PaginatedResponse<StockMovementDto>>({
    queryKey: ['stock-movements', page, search],
    queryFn: () =>
      api.get('/api/inventory/movements', { params: { page, limit: 25, search } }).then((r) => r.data),
  })

  const { data: ingredients } = useQuery<PaginatedResponse<IngredientDto>>({
    queryKey: ['ingredients-all'],
    queryFn: () =>
      api.get('/api/inventory/ingredients', { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: showForm && form.itemType === 'ingredient',
  })

  const { data: products } = useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products-all'],
    queryFn: () =>
      api.get('/api/products', { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: showForm && form.itemType === 'product',
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateStockMovementDto) =>
      api.post('/api/inventory/movements', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-movements'] })
      closeForm()
    },
    onError: () => alert('Erro ao registrar movimentação.'),
  })

  function closeForm() {
    setShowForm(false)
    setForm({ ...EMPTY_FORM })
  }

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'type') {
        next.reason = REASONS_BY_TYPE[value as MovementType][0].value
        next.itemId = ''
      }
      if (key === 'itemType') next.itemId = ''
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CreateStockMovementDto = {
      type: form.type,
      reason: form.reason,
      quantity: parseFloat(form.quantity),
      notes: form.notes || undefined,
      ...(form.itemType === 'ingredient'
        ? { ingredientId: form.itemId }
        : { productId: form.itemId }),
    }
    createMutation.mutate(payload)
  }

  const itemList =
    form.itemType === 'ingredient'
      ? (ingredients?.data ?? [])
      : (products?.data ?? [])

  const reasons = REASONS_BY_TYPE[form.type]

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Histórico de movimentações e controle de saldo"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Nova movimentação
          </Button>
        }
      />

      {showForm && (
        <Card padding className="mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-brand-900">Registrar movimentação</h3>
            <Button type="button" variant="icon" size="icon" onClick={closeForm} aria-label="Fechar">
              <X size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type toggle */}
            <div className="flex rounded-xl border border-surface-200 overflow-hidden w-fit">
              {(['IN', 'OUT', 'ADJUSTMENT'] as MovementType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setField('type', t)}
                  className={cn(
                    'px-5 py-2 text-sm font-semibold transition-colors',
                    form.type === t
                      ? t === 'IN'
                        ? 'bg-emerald-500 text-white'
                        : t === 'OUT'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-400 text-white'
                      : 'text-brand-400 hover:bg-surface-50',
                  )}
                >
                  {t === 'IN' ? 'Entrada' : t === 'OUT' ? 'Saída' : 'Ajuste'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Item type */}
              <select
                className="input-base"
                value={form.itemType}
                onChange={(e) => setField('itemType', e.target.value as 'ingredient' | 'product')}
              >
                <option value="ingredient">Ingrediente</option>
                <option value="product">Produto</option>
              </select>

              {/* Item */}
              <select
                required
                className="input-base sm:col-span-2"
                value={form.itemId}
                onChange={(e) => setField('itemId', e.target.value)}
              >
                <option value="">
                  {form.itemType === 'ingredient' ? 'Selecione o ingrediente *' : 'Selecione o produto *'}
                </option>
                {(itemList as Array<{ id: string; name: string; unit: string }>).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.unit})
                  </option>
                ))}
              </select>

              {/* Quantity */}
              <input
                required
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Quantidade *"
                className="input-base"
                value={form.quantity}
                onChange={(e) => setField('quantity', e.target.value)}
              />

              {/* Reason */}
              <select
                required
                className="input-base"
                value={form.reason}
                onChange={(e) => setField('reason', e.target.value as MovementReason)}
              >
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              {/* Notes */}
              <input
                placeholder="Observações (opcional)"
                className="input-base"
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Salvando...' : 'Registrar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-surface-200">
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            placeholder="Buscar movimentação..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={Boxes} message="Carregando movimentações..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Nenhuma movimentação encontrada"
            description="As movimentações de estoque aparecerão aqui."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Data</th>
                    <th className="table-head">Tipo</th>
                    <th className="table-head">Item</th>
                    <th className="table-head text-right">Quantidade</th>
                    <th className="table-head text-right">Saldo</th>
                    <th className="table-head">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((m, i) => {
                    const style = TYPE_STYLES[m.type] ?? { label: m.type, variant: 'warning' as const }
                    const isIn = m.type === 'IN'
                    const unit = getUnit(m)
                    return (
                      <tr
                        key={m.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors',
                          i < data.data.length - 1 && 'border-b border-surface-100',
                        )}
                      >
                        <td className="table-cell text-xs text-brand-400">
                          {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="table-cell">
                          <Badge variant={style.variant}>{style.label}</Badge>
                        </td>
                        <td className="table-cell font-medium">{getItemName(m)}</td>
                        <td className="table-cell text-right">
                          <span
                            className={cn(
                              'font-semibold inline-flex items-center gap-1',
                              isIn ? 'text-emerald-600' : 'text-red-500',
                            )}
                          >
                            {isIn ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {isIn ? '+' : '-'}
                            {Math.abs(m.quantity)} {unit}
                          </span>
                        </td>
                        <td className="table-cell text-right font-medium">
                          {m.newStock} {unit}
                        </td>
                        <td className="table-cell text-xs text-brand-400">
                          {REASON_LABELS[m.reason] ?? m.reason}
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
                label="movimentações"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

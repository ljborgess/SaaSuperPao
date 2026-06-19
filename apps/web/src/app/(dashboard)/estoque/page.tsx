'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Boxes, TrendingDown, TrendingUp, ArrowLeftRight, Plus, X, Pencil } from 'lucide-react'
import type {
  StockMovementDto,
  PaginatedResponse,
  IngredientDto,
  ProductDto,
  CreateStockMovementDto,
  CreateIngredientDto,
  UpdateIngredientDto,
  MovementType,
  MovementReason,
  IngredientUnit,
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

const UNITS: IngredientUnit[] = ['KG', 'G', 'L', 'ML', 'UN', 'PCT', 'CX']

const EMPTY_MOVEMENT = {
  type: 'IN' as MovementType,
  itemType: 'ingredient' as 'ingredient' | 'product',
  itemId: '',
  quantity: '',
  reason: 'INITIAL_STOCK' as MovementReason,
  notes: '',
}

type IngredientForm = { name: string; unit: IngredientUnit; costPrice: string; minStock: string; supplierId: string }
const EMPTY_INGREDIENT: IngredientForm = { name: '', unit: 'KG', costPrice: '', minStock: '', supplierId: '' }

function getItemName(m: StockMovementDto) {
  return m.ingredient?.name ?? m.product?.name ?? '—'
}
function getUnit(m: StockMovementDto) {
  return m.ingredient?.unit ?? m.product?.unit ?? ''
}

export default function EstoquePage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'ingredientes' | 'movimentacoes'>('ingredientes')

  // Movimentações state
  const [movSearch, setMovSearch] = useState('')
  const [movPage, setMovPage] = useState(1)
  const [showMovForm, setShowMovForm] = useState(false)
  const [movForm, setMovForm] = useState({ ...EMPTY_MOVEMENT })

  // Ingredientes state
  const [ingSearch, setIngSearch] = useState('')
  const [ingPage, setIngPage] = useState(1)
  const [showIngForm, setShowIngForm] = useState(false)
  const [editingIng, setEditingIng] = useState<IngredientDto | null>(null)
  const [ingForm, setIngForm] = useState<IngredientForm>({ ...EMPTY_INGREDIENT })

  // Queries
  const { data: movements, isLoading: movLoading } = useQuery<PaginatedResponse<StockMovementDto>>({
    queryKey: ['stock-movements', movPage, movSearch],
    queryFn: () => api.get('/api/inventory/movements', { params: { page: movPage, limit: 25, search: movSearch } }).then(r => r.data),
    enabled: tab === 'movimentacoes',
  })

  const { data: ingredients, isLoading: ingLoading } = useQuery<PaginatedResponse<IngredientDto>>({
    queryKey: ['ingredients', ingPage, ingSearch],
    queryFn: () => api.get('/api/inventory/ingredients', { params: { page: ingPage, limit: 20, search: ingSearch } }).then(r => r.data),
    enabled: tab === 'ingredientes',
  })

  const { data: ingredientsAll } = useQuery<PaginatedResponse<IngredientDto>>({
    queryKey: ['ingredients-all'],
    queryFn: () => api.get('/api/inventory/ingredients', { params: { page: 1, limit: 200 } }).then(r => r.data),
    enabled: showMovForm && movForm.itemType === 'ingredient',
  })

  const { data: productsAll } = useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products-all'],
    queryFn: () => api.get('/api/products', { params: { page: 1, limit: 200 } }).then(r => r.data),
    enabled: showMovForm && movForm.itemType === 'product',
  })

  // Mutations
  const movMutation = useMutation({
    mutationFn: (payload: CreateStockMovementDto) => api.post('/api/inventory/movements', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-movements'] })
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Movimentação registrada.')
      setShowMovForm(false)
      setMovForm({ ...EMPTY_MOVEMENT })
    },
    onError: () => toast.error('Erro ao registrar movimentação.'),
  })

  const ingMutation = useMutation({
    mutationFn: (payload: CreateIngredientDto | UpdateIngredientDto) =>
      editingIng
        ? api.patch(`/api/inventory/ingredients/${editingIng.id}`, payload)
        : api.post('/api/inventory/ingredients', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      qc.invalidateQueries({ queryKey: ['ingredients-all'] })
      toast.success(editingIng ? 'Ingrediente atualizado.' : 'Ingrediente criado.')
      closeIngForm()
    },
    onError: () => toast.error('Erro ao salvar ingrediente.'),
  })

  function closeIngForm() {
    setShowIngForm(false)
    setEditingIng(null)
    setIngForm({ ...EMPTY_INGREDIENT })
  }

  function openIngForm(ing?: IngredientDto) {
    setEditingIng(ing ?? null)
    setIngForm(ing ? {
      name: ing.name,
      unit: ing.unit,
      costPrice: String(ing.costPrice),
      minStock: String(ing.minStock),
      supplierId: ing.supplier?.id ?? '',
    } : { ...EMPTY_INGREDIENT })
    setShowIngForm(true)
  }

  function handleMovSubmit(e: React.FormEvent) {
    e.preventDefault()
    movMutation.mutate({
      type: movForm.type,
      reason: movForm.reason,
      quantity: parseFloat(movForm.quantity),
      notes: movForm.notes || undefined,
      ...(movForm.itemType === 'ingredient' ? { ingredientId: movForm.itemId } : { productId: movForm.itemId }),
    })
  }

  function handleIngSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: CreateIngredientDto = {
      name: ingForm.name,
      unit: ingForm.unit,
      costPrice: parseFloat(ingForm.costPrice) || 0,
      minStock: ingForm.minStock ? parseFloat(ingForm.minStock) : undefined,
      supplierId: ingForm.supplierId || undefined,
    }
    ingMutation.mutate(payload)
  }

  function setMovField<K extends keyof typeof EMPTY_MOVEMENT>(key: K, value: (typeof EMPTY_MOVEMENT)[K]) {
    setMovForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'type') { next.reason = REASONS_BY_TYPE[value as MovementType][0].value; next.itemId = '' }
      if (key === 'itemType') next.itemId = ''
      return next
    })
  }

  const movItemList = movForm.itemType === 'ingredient' ? (ingredientsAll?.data ?? []) : (productsAll?.data ?? [])
  const movReasons = REASONS_BY_TYPE[movForm.type]

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Ingredientes e histórico de movimentações"
        action={
          tab === 'ingredientes'
            ? <Button onClick={() => openIngForm()}><Plus size={16} />Novo ingrediente</Button>
            : <Button onClick={() => setShowMovForm(true)}><Plus size={16} />Nova movimentação</Button>
        }
      />

      {/* Tab toggle */}
      <div className="flex rounded-xl border border-surface-200 overflow-hidden w-fit mb-6">
        {(['ingredientes', 'movimentacoes'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 text-sm font-semibold transition-colors capitalize',
              tab === t ? 'bg-brand-600 text-white' : 'text-brand-400 hover:bg-surface-50',
            )}
          >
            {t === 'ingredientes' ? 'Ingredientes' : 'Movimentações'}
          </button>
        ))}
      </div>

      {/* ── INGREDIENTES TAB ── */}
      {tab === 'ingredientes' && (
        <>
          {showIngForm && (
            <Card padding className="mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-brand-900">
                  {editingIng ? 'Editar ingrediente' : 'Novo ingrediente'}
                </h3>
                <Button type="button" variant="icon" size="icon" onClick={closeIngForm} aria-label="Fechar">
                  <X size={16} />
                </Button>
              </div>
              <form onSubmit={handleIngSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    required
                    placeholder="Nome *"
                    className="input-base sm:col-span-2"
                    value={ingForm.name}
                    onChange={e => setIngForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <select
                    required
                    className="input-base"
                    value={ingForm.unit}
                    onChange={e => setIngForm(f => ({ ...f, unit: e.target.value as IngredientUnit }))}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preço de custo *"
                    className="input-base"
                    value={ingForm.costPrice}
                    onChange={e => setIngForm(f => ({ ...f, costPrice: e.target.value }))}
                  />
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Estoque mínimo"
                    className="input-base"
                    value={ingForm.minStock}
                    onChange={e => setIngForm(f => ({ ...f, minStock: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={closeIngForm}>Cancelar</Button>
                  <Button type="submit" disabled={ingMutation.isPending}>
                    {ingMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <div className="px-6 py-4 border-b border-surface-200">
              <SearchInput
                value={ingSearch}
                onChange={v => { setIngSearch(v); setIngPage(1) }}
                placeholder="Buscar ingrediente..."
              />
            </div>
            {ingLoading ? (
              <LoadingState icon={Boxes} message="Carregando ingredientes..." />
            ) : !ingredients?.data.length ? (
              <EmptyState icon={Boxes} title="Nenhum ingrediente cadastrado" description="Adicione ingredientes para gerenciar seu estoque." />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-200 bg-surface-50/50">
                        <th className="table-head">Nome</th>
                        <th className="table-head">Unidade</th>
                        <th className="table-head text-right">Estoque atual</th>
                        <th className="table-head text-right">Estoque mínimo</th>
                        <th className="table-head text-right">Custo unit.</th>
                        <th className="table-head w-16" />
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.data.map((ing, i) => {
                        const low = ing.minStock > 0 && ing.currentStock <= ing.minStock
                        return (
                          <tr
                            key={ing.id}
                            className={cn(
                              'hover:bg-surface-50/80 transition-colors group',
                              i < ingredients.data.length - 1 && 'border-b border-surface-100',
                            )}
                          >
                            <td className="table-cell font-medium">{ing.name}</td>
                            <td className="table-cell text-brand-500 text-xs">{ing.unit}</td>
                            <td className={cn('table-cell text-right font-semibold', low ? 'text-red-500' : 'text-brand-700')}>
                              {Number(ing.currentStock).toLocaleString('pt-BR')} {ing.unit}
                            </td>
                            <td className="table-cell text-right text-brand-400 text-xs">
                              {ing.minStock > 0 ? `${Number(ing.minStock).toLocaleString('pt-BR')} ${ing.unit}` : '—'}
                            </td>
                            <td className="table-cell text-right text-brand-500 text-xs">
                              R$ {Number(ing.costPrice).toFixed(2)}
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="icon" size="icon" onClick={() => openIngForm(ing)} aria-label="Editar">
                                  <Pencil size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {ingredients.totalPages > 1 && (
                  <Pagination page={ingPage} totalPages={ingredients.totalPages} total={ingredients.total} label="ingredientes" onPageChange={setIngPage} />
                )}
              </>
            )}
          </Card>
        </>
      )}

      {/* ── MOVIMENTAÇÕES TAB ── */}
      {tab === 'movimentacoes' && (
        <>
          {showMovForm && (
            <Card padding className="mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-brand-900">Registrar movimentação</h3>
                <Button type="button" variant="icon" size="icon" onClick={() => setShowMovForm(false)} aria-label="Fechar">
                  <X size={16} />
                </Button>
              </div>
              <form onSubmit={handleMovSubmit} className="space-y-4">
                <div className="flex rounded-xl border border-surface-200 overflow-hidden w-fit">
                  {(['IN', 'OUT', 'ADJUSTMENT'] as MovementType[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMovField('type', t)}
                      className={cn(
                        'px-5 py-2 text-sm font-semibold transition-colors',
                        movForm.type === t
                          ? t === 'IN' ? 'bg-emerald-500 text-white' : t === 'OUT' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'
                          : 'text-brand-400 hover:bg-surface-50',
                      )}
                    >
                      {t === 'IN' ? 'Entrada' : t === 'OUT' ? 'Saída' : 'Ajuste'}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select className="input-base" value={movForm.itemType} onChange={e => setMovField('itemType', e.target.value as 'ingredient' | 'product')}>
                    <option value="ingredient">Ingrediente</option>
                    <option value="product">Produto</option>
                  </select>
                  <select required className="input-base sm:col-span-2" value={movForm.itemId} onChange={e => setMovField('itemId', e.target.value)}>
                    <option value="">{movForm.itemType === 'ingredient' ? 'Selecione o ingrediente *' : 'Selecione o produto *'}</option>
                    {(movItemList as Array<{ id: string; name: string; unit: string }>).map(item => (
                      <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                    ))}
                  </select>
                  <input required type="number" step="0.001" min="0.001" placeholder="Quantidade *" className="input-base" value={movForm.quantity} onChange={e => setMovField('quantity', e.target.value)} />
                  <select required className="input-base" value={movForm.reason} onChange={e => setMovField('reason', e.target.value as MovementReason)}>
                    {movReasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <input placeholder="Observações (opcional)" className="input-base" value={movForm.notes} onChange={e => setMovField('notes', e.target.value)} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setShowMovForm(false)}>Cancelar</Button>
                  <Button type="submit" disabled={movMutation.isPending}>{movMutation.isPending ? 'Salvando...' : 'Registrar'}</Button>
                </div>
              </form>
            </Card>
          )}

          <Card>
            <div className="px-6 py-4 border-b border-surface-200">
              <SearchInput value={movSearch} onChange={v => { setMovSearch(v); setMovPage(1) }} placeholder="Buscar movimentação..." />
            </div>
            {movLoading ? (
              <LoadingState icon={Boxes} message="Carregando movimentações..." />
            ) : !movements?.data.length ? (
              <EmptyState icon={ArrowLeftRight} title="Nenhuma movimentação encontrada" description="As movimentações de estoque aparecerão aqui." />
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
                      {movements.data.map((m, i) => {
                        const style = TYPE_STYLES[m.type] ?? { label: m.type, variant: 'warning' as const }
                        const isIn = m.type === 'IN'
                        const unit = getUnit(m)
                        return (
                          <tr key={m.id} className={cn('hover:bg-surface-50/80 transition-colors', i < movements.data.length - 1 && 'border-b border-surface-100')}>
                            <td className="table-cell text-xs text-brand-400">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</td>
                            <td className="table-cell"><Badge variant={style.variant}>{style.label}</Badge></td>
                            <td className="table-cell font-medium">{getItemName(m)}</td>
                            <td className="table-cell text-right">
                              <span className={cn('font-semibold inline-flex items-center gap-1', isIn ? 'text-emerald-600' : 'text-red-500')}>
                                {isIn ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {isIn ? '+' : '-'}{Math.abs(m.quantity)} {unit}
                              </span>
                            </td>
                            <td className="table-cell text-right font-medium">{m.newStock} {unit}</td>
                            <td className="table-cell text-xs text-brand-400">{REASON_LABELS[m.reason] ?? m.reason}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                {movements.totalPages > 1 && (
                  <Pagination page={movPage} totalPages={movements.totalPages} total={movements.total} label="movimentações" onPageChange={setMovPage} />
                )}
              </>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

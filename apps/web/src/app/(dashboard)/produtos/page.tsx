'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Package, ChefHat, ChevronDown, ChevronUp, X } from 'lucide-react'
import { formatCurrency } from '@superpao/shared-utils'
import type { ProductDto, ProductUnit, CategoryDto, PaginatedResponse } from '@superpao/shared-types'
import type { RecipeDto, CreateRecipeDto, CreateRecipeItemDto } from '@superpao/shared-types'
import type { IngredientDto } from '@superpao/shared-types'
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

type RecipeItemForm = { ingredientId: string; quantity: string; unit: string }
const EMPTY_ITEM: RecipeItemForm = { ingredientId: '', quantity: '', unit: '' }

function RecipePanel({ product }: { product: ProductDto }) {
  const qc = useQueryClient()
  const [showNewItemForm, setShowNewItemForm] = useState(false)
  const [newItem, setNewItem] = useState<RecipeItemForm>(EMPTY_ITEM)
  const [recipeForm, setRecipeForm] = useState<{ yieldQty: string; yieldUnit: string; instructions: string } | null>(null)
  const [createForm, setCreateForm] = useState<{ yieldQty: string; yieldUnit: string; instructions: string } | null>(null)

  const { data: recipe, isLoading } = useQuery<RecipeDto | null>({
    queryKey: ['recipe', product.id],
    queryFn: () =>
      api.get(`/api/recipes/by-product/${product.id}`)
        .then((r) => r.data)
        .catch(() => null),
  })

  const { data: ingredientsData } = useQuery<{ data: IngredientDto[] }>({
    queryKey: ['ingredients-list'],
    queryFn: () => api.get('/api/inventory/ingredients', { params: { page: 1, limit: 200 } }).then((r) => r.data),
  })
  const ingredients = ingredientsData?.data ?? []

  const createRecipeMutation = useMutation({
    mutationFn: (dto: CreateRecipeDto) => api.post('/api/recipes', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', product.id] })
      toast.success('Receita criada.')
      setCreateForm(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erro ao criar receita.'),
  })

  const updateRecipeMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: object }) => api.patch(`/api/recipes/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', product.id] })
      toast.success('Receita atualizada.')
      setRecipeForm(null)
    },
    onError: () => toast.error('Erro ao atualizar receita.'),
  })

  const deleteRecipeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/recipes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', product.id] })
      toast.success('Receita removida.')
    },
    onError: () => toast.error('Erro ao remover receita.'),
  })

  const addItemMutation = useMutation({
    mutationFn: ({ recipeId, dto }: { recipeId: string; dto: CreateRecipeItemDto }) =>
      api.post(`/api/recipes/${recipeId}/items`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', product.id] })
      toast.success('Ingrediente adicionado.')
      setShowNewItemForm(false)
      setNewItem(EMPTY_ITEM)
    },
    onError: () => toast.error('Erro ao adicionar ingrediente.'),
  })

  const removeItemMutation = useMutation({
    mutationFn: ({ recipeId, itemId }: { recipeId: string; itemId: string }) =>
      api.delete(`/api/recipes/${recipeId}/items/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe', product.id] })
      toast.success('Ingrediente removido.')
    },
    onError: () => toast.error('Erro ao remover ingrediente.'),
  })

  const applyToCostMutation = useMutation({
    mutationFn: ({ costPrice }: { costPrice: number }) =>
      api.patch(`/api/products/${product.id}`, { costPrice }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Preço de custo atualizado a partir da receita.')
    },
    onError: () => toast.error('Erro ao atualizar preço de custo.'),
  })

  if (isLoading) return <div className="px-6 py-4 text-sm text-brand-400">Carregando receita...</div>

  const calculatedCost = recipe
    ? recipe.items.reduce((sum, item) => {
        return sum + (Number(item.ingredient.costPrice) * Number(item.quantity)) / Number(recipe.yieldQty)
      }, 0)
    : 0

  if (!recipe && !createForm) {
    return (
      <div className="px-6 py-5 bg-surface-50 border-t border-surface-100">
        <div className="flex items-center justify-between">
          <p className="text-sm text-brand-400">Este produto não possui receita cadastrada.</p>
          <Button
            size="sm"
            onClick={() => setCreateForm({ yieldQty: '1', yieldUnit: product.unit, instructions: '' })}
          >
            <Plus size={14} />
            Criar receita
          </Button>
        </div>
      </div>
    )
  }

  if (createForm) {
    return (
      <div className="px-6 py-5 bg-surface-50 border-t border-surface-100">
        <h4 className="text-sm font-semibold text-brand-900 mb-3">Nova receita para {product.name}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Rendimento *"
            className="input-base"
            value={createForm.yieldQty}
            onChange={(e) => setCreateForm(f => f && ({ ...f, yieldQty: e.target.value }))}
          />
          <input
            placeholder="Unidade do rendimento *"
            className="input-base"
            value={createForm.yieldUnit}
            onChange={(e) => setCreateForm(f => f && ({ ...f, yieldUnit: e.target.value }))}
          />
          <input
            placeholder="Instruções (opcional)"
            className="input-base sm:col-span-1"
            value={createForm.instructions}
            onChange={(e) => setCreateForm(f => f && ({ ...f, instructions: e.target.value }))}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={() => setCreateForm(null)}>Cancelar</Button>
          <Button
            size="sm"
            disabled={createRecipeMutation.isPending}
            onClick={() => createRecipeMutation.mutate({
              productId: product.id,
              yieldQty: parseFloat(createForm.yieldQty),
              yieldUnit: createForm.yieldUnit,
              instructions: createForm.instructions || undefined,
              items: [],
            })}
          >
            {createRecipeMutation.isPending ? 'Criando...' : 'Criar'}
          </Button>
        </div>
      </div>
    )
  }

  if (!recipe) return null

  return (
    <div className="bg-surface-50 border-t border-surface-100">
      <div className="px-6 py-4">
        {recipeForm ? (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-brand-900 mb-3">Editar receita</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Rendimento"
                className="input-base"
                value={recipeForm.yieldQty}
                onChange={(e) => setRecipeForm(f => f && ({ ...f, yieldQty: e.target.value }))}
              />
              <input
                placeholder="Unidade"
                className="input-base"
                value={recipeForm.yieldUnit}
                onChange={(e) => setRecipeForm(f => f && ({ ...f, yieldUnit: e.target.value }))}
              />
              <input
                placeholder="Instruções"
                className="input-base"
                value={recipeForm.instructions}
                onChange={(e) => setRecipeForm(f => f && ({ ...f, instructions: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setRecipeForm(null)}>Cancelar</Button>
              <Button
                size="sm"
                disabled={updateRecipeMutation.isPending}
                onClick={() => updateRecipeMutation.mutate({
                  id: recipe.id,
                  dto: { yieldQty: parseFloat(recipeForm.yieldQty), yieldUnit: recipeForm.yieldUnit, instructions: recipeForm.instructions || undefined },
                })}
              >
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-brand-600">
                <span className="font-medium">Rendimento:</span> {recipe.yieldQty} {recipe.yieldUnit}
              </p>
              {recipe.instructions && (
                <p className="text-xs text-brand-400 mt-0.5">{recipe.instructions}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-500 font-medium">
                Custo calculado: <span className="text-brand-900 font-semibold">{formatCurrency(calculatedCost)}</span>/{recipe.yieldUnit}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={calculatedCost === 0 || applyToCostMutation.isPending}
                onClick={() => applyToCostMutation.mutate({ costPrice: calculatedCost })}
              >
                Aplicar ao produto
              </Button>
              <Button
                variant="icon"
                size="icon"
                onClick={() => setRecipeForm({ yieldQty: String(recipe.yieldQty), yieldUnit: recipe.yieldUnit, instructions: recipe.instructions ?? '' })}
              >
                <Pencil size={13} />
              </Button>
              <Button
                variant="icon"
                size="icon"
                className="hover:text-red-500 hover:bg-red-50"
                onClick={() => deleteRecipeMutation.mutate(recipe.id)}
                disabled={deleteRecipeMutation.isPending}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        )}

        <table className="w-full text-sm mb-3">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left py-1.5 text-xs font-medium text-brand-500">Ingrediente</th>
              <th className="text-right py-1.5 text-xs font-medium text-brand-500">Qtd</th>
              <th className="text-left py-1.5 text-xs font-medium text-brand-500 pl-2">Un.</th>
              <th className="text-right py-1.5 text-xs font-medium text-brand-500">Custo/un.</th>
              <th className="text-right py-1.5 text-xs font-medium text-brand-500">Custo total</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {recipe.items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-3 text-center text-xs text-brand-400">Nenhum ingrediente. Adicione abaixo.</td>
              </tr>
            )}
            {recipe.items.map((item) => (
              <tr key={item.id} className="border-b border-surface-100 group">
                <td className="py-2 text-brand-800">{item.ingredient.name}</td>
                <td className="py-2 text-right">{Number(item.quantity)}</td>
                <td className="py-2 pl-2 text-brand-500">{item.unit}</td>
                <td className="py-2 text-right text-brand-500">{formatCurrency(Number(item.ingredient.costPrice))}</td>
                <td className="py-2 text-right font-medium">
                  {formatCurrency(Number(item.ingredient.costPrice) * Number(item.quantity))}
                </td>
                <td className="py-2">
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 transition-all"
                    onClick={() => removeItemMutation.mutate({ recipeId: recipe.id, itemId: item.id })}
                  >
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showNewItemForm ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 items-end">
            <select
              className="input-base sm:col-span-2"
              value={newItem.ingredientId}
              onChange={(e) => {
                const ing = ingredients.find((i) => i.id === e.target.value)
                setNewItem(f => ({ ...f, ingredientId: e.target.value, unit: ing?.unit ?? f.unit }))
              }}
            >
              <option value="">Selecionar ingrediente...</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
              ))}
            </select>
            <input
              type="number"
              min="0.001"
              step="0.001"
              placeholder="Quantidade"
              className="input-base"
              value={newItem.quantity}
              onChange={(e) => setNewItem(f => ({ ...f, quantity: e.target.value }))}
            />
            <input
              placeholder="Unidade"
              className="input-base"
              value={newItem.unit}
              onChange={(e) => setNewItem(f => ({ ...f, unit: e.target.value }))}
            />
            <div className="flex gap-2 col-span-3 sm:col-span-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowNewItemForm(false); setNewItem(EMPTY_ITEM) }}>Cancelar</Button>
              <Button
                size="sm"
                disabled={!newItem.ingredientId || !newItem.quantity || addItemMutation.isPending}
                onClick={() => addItemMutation.mutate({
                  recipeId: recipe.id,
                  dto: { ingredientId: newItem.ingredientId, quantity: parseFloat(newItem.quantity), unit: newItem.unit },
                })}
              >
                {addItemMutation.isPending ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setShowNewItemForm(true)}>
            <Plus size={13} />
            Adicionar ingrediente
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ProdutosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ProductDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null)

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

  function toggleRecipe(productId: string) {
    setExpandedRecipe(prev => prev === productId ? null : productId)
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
                    <th className="table-head w-28" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((p, i) => (
                    <>
                      <tr
                        key={p.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors group',
                          expandedRecipe !== p.id && i < data.data.length - 1 && 'border-b border-surface-100',
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
                            <Button
                              variant="icon"
                              size="icon"
                              onClick={() => toggleRecipe(p.id)}
                              aria-label="Receita"
                              className={cn(expandedRecipe === p.id && 'text-brand-600 bg-brand-50')}
                            >
                              {expandedRecipe === p.id ? <ChevronUp size={14} /> : <ChefHat size={14} />}
                            </Button>
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
                      {expandedRecipe === p.id && (
                        <tr key={`recipe-${p.id}`} className={cn(i < data.data.length - 1 && 'border-b border-surface-100')}>
                          <td colSpan={8} className="p-0">
                            <RecipePanel product={p} />
                          </td>
                        </tr>
                      )}
                    </>
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

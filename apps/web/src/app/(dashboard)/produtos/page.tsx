'use client'

import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import {
  Plus, Pencil, Trash2, Package, ChefHat, ChevronDown, ChevronUp,
  X, AlertTriangle, Lock, Settings2,
} from 'lucide-react'
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
      qc.invalidateQueries({ queryKey: ['recipes-product-ids'] })
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
      qc.invalidateQueries({ queryKey: ['recipes-product-ids'] })
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
      qc.invalidateQueries({ queryKey: ['products-all'] })
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
          <Button size="sm" onClick={() => setCreateForm({ yieldQty: '1', yieldUnit: product.unit, instructions: '' })}>
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
          <input type="number" min="0.01" step="0.01" placeholder="Rendimento *" className="input-base" value={createForm.yieldQty} onChange={(e) => setCreateForm(f => f && ({ ...f, yieldQty: e.target.value }))} />
          <input placeholder="Unidade do rendimento *" className="input-base" value={createForm.yieldUnit} onChange={(e) => setCreateForm(f => f && ({ ...f, yieldUnit: e.target.value }))} />
          <input placeholder="Instruções (opcional)" className="input-base sm:col-span-1" value={createForm.instructions} onChange={(e) => setCreateForm(f => f && ({ ...f, instructions: e.target.value }))} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={() => setCreateForm(null)}>Cancelar</Button>
          <Button size="sm" disabled={createRecipeMutation.isPending} onClick={() => createRecipeMutation.mutate({ productId: product.id, yieldQty: parseFloat(createForm.yieldQty), yieldUnit: createForm.yieldUnit, instructions: createForm.instructions || undefined, items: [] })}>
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
              <input type="number" min="0.01" step="0.01" placeholder="Rendimento" className="input-base" value={recipeForm.yieldQty} onChange={(e) => setRecipeForm(f => f && ({ ...f, yieldQty: e.target.value }))} />
              <input placeholder="Unidade" className="input-base" value={recipeForm.yieldUnit} onChange={(e) => setRecipeForm(f => f && ({ ...f, yieldUnit: e.target.value }))} />
              <input placeholder="Instruções" className="input-base" value={recipeForm.instructions} onChange={(e) => setRecipeForm(f => f && ({ ...f, instructions: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setRecipeForm(null)}>Cancelar</Button>
              <Button size="sm" disabled={updateRecipeMutation.isPending} onClick={() => updateRecipeMutation.mutate({ id: recipe.id, dto: { yieldQty: parseFloat(recipeForm.yieldQty), yieldUnit: recipeForm.yieldUnit, instructions: recipeForm.instructions || undefined } })}>
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
              {recipe.instructions && <p className="text-xs text-brand-400 mt-0.5">{recipe.instructions}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-500 font-medium">
                Custo calculado: <span className="text-brand-900 font-semibold">{formatCurrency(calculatedCost)}</span>/{recipe.yieldUnit}
              </span>
              <Button size="sm" variant="ghost" disabled={calculatedCost === 0 || applyToCostMutation.isPending} onClick={() => applyToCostMutation.mutate({ costPrice: calculatedCost })}>
                Aplicar ao produto
              </Button>
              <Button variant="icon" size="icon" onClick={() => setRecipeForm({ yieldQty: String(recipe.yieldQty), yieldUnit: recipe.yieldUnit, instructions: recipe.instructions ?? '' })}>
                <Pencil size={13} />
              </Button>
              <Button variant="icon" size="icon" className="hover:text-red-500 hover:bg-red-50" onClick={() => deleteRecipeMutation.mutate(recipe.id)} disabled={deleteRecipeMutation.isPending}>
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
              <tr><td colSpan={6} className="py-3 text-center text-xs text-brand-400">Nenhum ingrediente. Adicione abaixo.</td></tr>
            )}
            {recipe.items.map((item) => (
              <tr key={item.id} className="border-b border-surface-100 group">
                <td className="py-2 text-brand-800">{item.ingredient.name}</td>
                <td className="py-2 text-right">{Number(item.quantity)}</td>
                <td className="py-2 pl-2 text-brand-500">{item.unit}</td>
                <td className="py-2 text-right text-brand-500">{formatCurrency(Number(item.ingredient.costPrice))}</td>
                <td className="py-2 text-right font-medium">{formatCurrency(Number(item.ingredient.costPrice) * Number(item.quantity))}</td>
                <td className="py-2">
                  <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 transition-all" onClick={() => removeItemMutation.mutate({ recipeId: recipe.id, itemId: item.id })}>
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showNewItemForm ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 items-end">
            <select className="input-base sm:col-span-2" value={newItem.ingredientId} onChange={(e) => { const ing = ingredients.find((i) => i.id === e.target.value); setNewItem(f => ({ ...f, ingredientId: e.target.value, unit: ing?.unit ?? f.unit })) }}>
              <option value="">Selecionar ingrediente...</option>
              {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
            </select>
            <input type="number" min="0.001" step="0.001" placeholder="Quantidade" className="input-base" value={newItem.quantity} onChange={(e) => setNewItem(f => ({ ...f, quantity: e.target.value }))} />
            <input placeholder="Unidade" className="input-base" value={newItem.unit} onChange={(e) => setNewItem(f => ({ ...f, unit: e.target.value }))} />
            <div className="flex gap-2 col-span-3 sm:col-span-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => { setShowNewItemForm(false); setNewItem(EMPTY_ITEM) }}>Cancelar</Button>
              <Button size="sm" disabled={!newItem.ingredientId || !newItem.quantity || addItemMutation.isPending} onClick={() => addItemMutation.mutate({ recipeId: recipe.id, dto: { ingredientId: newItem.ingredientId, quantity: parseFloat(newItem.quantity), unit: newItem.unit } })}>
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

type CategoryGroup = { id: string | null; name: string; products: ProductDto[] }

export default function ProdutosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ProductDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const { data, isLoading } = useQuery<PaginatedResponse<ProductDto>>({
    queryKey: ['products-all', search],
    queryFn: () => api.get('/api/products', { params: { page: 1, limit: 500, search } }).then((r) => r.data),
  })

  const { data: categories } = useQuery<PaginatedResponse<CategoryDto>>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories', { params: { page: 1, limit: 100 } }).then((r) => r.data),
  })

  const { data: recipeProductIds } = useQuery<string[]>({
    queryKey: ['recipes-product-ids'],
    queryFn: () => api.get('/api/recipes/product-ids').then((r) => r.data),
  })

  const recipesSet = useMemo(() => new Set<string>(recipeProductIds ?? []), [recipeProductIds])

  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const products = data?.data ?? []
    const map = new Map<string, CategoryGroup>()
    for (const p of products) {
      const key = p.category?.id ?? '__none__'
      if (!map.has(key)) map.set(key, { id: p.category?.id ?? null, name: p.category?.name ?? 'Sem categoria', products: [] })
      map.get(key)!.products.push(p)
    }
    const groups = Array.from(map.values())
    const none = groups.find(g => g.id === null)
    const rest = groups.filter(g => g.id !== null).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    return none ? [...rest, none] : rest
  }, [data])

  const saveMutation = useMutation({
    mutationFn: (payload: object) =>
      editing ? api.patch(`/api/products/${editing.id}`, payload) : api.post('/api/products', payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['products-all'] })
      if (!editing) {
        const newId: string = res.data?.id
        toast.success('Produto criado. Cadastre a receita para liberar o produto.')
        closeForm()
        if (newId) setExpandedRecipe(newId)
      } else {
        toast.success('Produto atualizado.')
        closeForm()
      }
    },
    onError: () => toast.error('Erro ao salvar produto.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products-all'] })
      toast.success('Produto removido.')
    },
    onError: () => toast.error('Erro ao remover produto.'),
  })

  function openForm(product?: ProductDto) {
    setEditing(product ?? null)
    setForm(product ? {
      name: product.name, code: product.code, categoryId: product.category?.id ?? '',
      unit: product.unit, costPrice: String(product.costPrice), salePrice: String(product.salePrice), minStock: String(product.minStock),
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
      name: form.name, code: form.code, unit: form.unit,
      costPrice: parseFloat(form.costPrice), salePrice: parseFloat(form.salePrice),
    }
    if (form.categoryId) payload.categoryId = form.categoryId
    if (form.minStock) payload.minStock = parseInt(form.minStock, 10)
    saveMutation.mutate(payload)
  }

  function toggleRecipe(productId: string) {
    setExpandedRecipe(prev => prev === productId ? null : productId)
  }

  function toggleCategory(catKey: string) {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      next.has(catKey) ? next.delete(catKey) : next.add(catKey)
      return next
    })
  }

  const totalProducts = data?.total ?? 0

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

      {/* Drawer overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30 backdrop-blur-[1px]" onClick={closeForm} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-left h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200">
              <h3 className="text-base font-semibold text-brand-900">
                {editing ? 'Editar produto' : 'Novo produto'}
              </h3>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-surface-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 py-5 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-500 mb-1.5">Nome *</label>
                <input required placeholder="Ex: Pão Francês" className="input-base w-full" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-brand-500 mb-1.5">Código *</label>
                  <input required placeholder="Ex: PAO-001" className="input-base w-full" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-500 mb-1.5">Unidade</label>
                  <select className="input-base w-full" value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value as ProductUnit }))}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-500 mb-1.5">Categoria</label>
                <select className="input-base w-full" value={form.categoryId} onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Sem categoria</option>
                  {categories?.data.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-brand-500 mb-1.5">Custo *</label>
                  <input required type="number" step="0.01" min="0" placeholder="0,00" className="input-base w-full" value={form.costPrice} onChange={(e) => setForm(f => ({ ...f, costPrice: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-500 mb-1.5">Venda *</label>
                  <input required type="number" step="0.01" min="0" placeholder="0,00" className="input-base w-full" value={form.salePrice} onChange={(e) => setForm(f => ({ ...f, salePrice: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-500 mb-1.5">Estoque mín.</label>
                  <input type="number" step="1" min="0" placeholder="0" className="input-base w-full" value={form.minStock} onChange={(e) => setForm(f => ({ ...f, minStock: e.target.value }))} />
                </div>
              </div>
              <div className="mt-auto pt-4 flex gap-2 justify-end border-t border-surface-100">
                <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar produto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <div className="px-6 py-4 border-b border-surface-200 flex items-center gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou código..." />
          {totalProducts > 0 && (
            <span className="text-xs text-brand-400 shrink-0">{totalProducts} produto{totalProducts !== 1 ? 's' : ''}</span>
          )}
        </div>

        {isLoading ? (
          <LoadingState icon={Package} message="Carregando produtos..." />
        ) : categoryGroups.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum produto encontrado" description="Cadastre seu primeiro produto para começar." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50/60">
                  <th className="table-head text-xs">Código</th>
                  <th className="table-head text-xs">Nome</th>
                  <th className="table-head text-xs text-right">Custo</th>
                  <th className="table-head text-xs text-right">Venda</th>
                  <th className="table-head text-xs text-right">Estoque</th>
                  <th className="table-head text-xs text-center">Status</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {categoryGroups.map((group) => {
                  const catKey = group.id ?? '__none__'
                  const collapsed = collapsedCategories.has(catKey)
                  const missingRecipes = group.products.filter(p => !recipesSet.has(p.id)).length

                  return (
                    <React.Fragment key={catKey}>
                      {/* Category separator row */}
                      <tr
                        className="bg-surface-50 border-y border-surface-200 cursor-pointer hover:bg-surface-100/80 transition-colors"
                        onClick={() => toggleCategory(catKey)}
                      >
                        <td colSpan={7} className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">{group.name}</span>
                            <span className="text-xs text-brand-400">{group.products.length} produto{group.products.length !== 1 ? 's' : ''}</span>
                            {missingRecipes > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                                <AlertTriangle size={10} />{missingRecipes} sem receita
                              </span>
                            )}
                            <span className="ml-auto text-brand-400">
                              {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Product rows */}
                      {!collapsed && group.products.map((p) => {
                        const hasRecipe = recipesSet.has(p.id)
                        return (
                          <React.Fragment key={p.id}>
                            <tr className="hover:bg-surface-50/80 transition-colors group border-b border-surface-100">
                              <td className="table-cell text-xs text-brand-400 font-mono">{p.code}</td>
                              <td className="table-cell font-semibold">{p.name}</td>
                              <td className="table-cell text-right text-brand-500 text-xs">{formatCurrency(p.costPrice)}</td>
                              <td className="table-cell text-right font-semibold">{formatCurrency(p.salePrice)}</td>
                              <td className="table-cell text-right">
                                <span className={cn('font-semibold', p.currentStock <= p.minStock ? 'text-red-500' : 'text-brand-800')}>
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
                                <div className="flex items-center gap-0.5 justify-end">
                                  <Button
                                    variant="icon" size="icon"
                                    onClick={() => toggleRecipe(p.id)}
                                    title={!hasRecipe ? 'Receita pendente — clique para cadastrar' : 'Receita'}
                                    className={cn(
                                      'opacity-0 group-hover:opacity-100 transition-opacity',
                                      expandedRecipe === p.id && 'text-brand-600 bg-brand-50 !opacity-100',
                                      !hasRecipe && 'text-amber-500 !opacity-100',
                                    )}
                                  >
                                    {expandedRecipe === p.id ? <ChevronUp size={14} /> : <ChefHat size={14} />}
                                  </Button>
                                  <Button
                                    variant="icon" size="icon"
                                    onClick={() => openForm(p)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Settings2 size={14} />
                                  </Button>
                                  <Button
                                    variant="icon" size="icon"
                                    onClick={() => hasRecipe && deleteMutation.mutate(p.id)}
                                    title={hasRecipe ? undefined : 'Cadastre a receita primeiro'}
                                    className={cn(
                                      'opacity-0 group-hover:opacity-100 transition-opacity',
                                      hasRecipe ? 'hover:text-red-500 hover:bg-red-50' : 'opacity-30 cursor-not-allowed',
                                    )}
                                  >
                                    {hasRecipe ? <Trash2 size={14} /> : <Lock size={14} />}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            {expandedRecipe === p.id && (
                              <tr className="border-b border-surface-100">
                                <td colSpan={7} className="p-0">
                                  <RecipePanel product={p} />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

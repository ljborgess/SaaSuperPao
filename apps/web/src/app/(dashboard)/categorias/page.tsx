'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import type { CategoryDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Drawer } from '@/components/ui/drawer'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

export default function CategoriasPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CategoryDto | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse<CategoryDto>>({
    queryKey: ['categories'],
    queryFn: () => api.get('/api/categories', { params: { page: 1, limit: 100 } }).then((r) => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      editing
        ? api.patch(`/api/categories/${editing.id}`, payload)
        : api.post('/api/categories', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success(editing ? 'Categoria atualizada.' : 'Categoria criada.')
      closeForm()
    },
    onError: () => toast.error('Erro ao salvar categoria.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Categoria removida.')
    },
    onError: () => toast.error('Erro ao remover categoria.'),
  })

  function openForm(cat?: CategoryDto) {
    setEditing(cat ?? null)
    setName(cat?.name ?? '')
    setDescription(cat?.description ?? '')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
    setName('')
    setDescription('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveMutation.mutate({ name, description: description || undefined })
  }

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Organize e classifique os produtos por categoria"
        action={
          <Button onClick={() => openForm()}>
            <Plus size={16} />
            Nova categoria
          </Button>
        }
      />

      <Drawer open={showForm} onClose={closeForm} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Nome *</label>
            <input required className="input-base w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Descrição</label>
            <input className="input-base w-full" placeholder="Opcional" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="mt-auto pt-4 flex gap-2 justify-end border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar categoria'}
            </Button>
          </div>
        </form>
      </Drawer>

      <Card>
        {isLoading ? (
          <LoadingState icon={Tag} message="Carregando categorias..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={Tag}
            title="Nenhuma categoria cadastrada"
            description="Crie categorias para organizar seus produtos."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50/50">
                  <th className="table-head">Nome</th>
                  <th className="table-head">Descrição</th>
                  <th className="table-head">Criado em</th>
                  <th className="table-head w-20" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((cat, i) => (
                  <tr
                    key={cat.id}
                    className={cn(
                      'hover:bg-surface-50/80 transition-colors group',
                      i < data.data.length - 1 && 'border-b border-surface-100',
                    )}
                  >
                    <td className="table-cell font-semibold">{cat.name}</td>
                    <td className="table-cell text-brand-500">
                      {cat.description ?? <span className="text-brand-300">—</span>}
                    </td>
                    <td className="table-cell text-xs text-brand-400">
                      {new Date(cat.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="icon" size="icon" onClick={() => openForm(cat)} aria-label="Editar">
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="icon"
                          size="icon"
                          onClick={() => deleteMutation.mutate(cat.id)}
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
        )}
      </Card>
    </div>
  )
}

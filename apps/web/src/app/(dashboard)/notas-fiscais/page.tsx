'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/layout/page-header'
import { FileText, Plus, XCircle, Download } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@superpao/shared-utils'
import type { jsPDF as JsPDFType } from 'jspdf'
import type { NotaFiscalDto, ClientDto, PaginatedResponse } from '@superpao/shared-types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Drawer } from '@/components/ui/drawer'
import { SearchInput } from '@/components/ui/search-input'
import { LoadingState } from '@/components/ui/loading-state'
import { EmptyState } from '@/components/ui/empty-state'
import { Pagination } from '@/components/ui/pagination'
import { cn } from '@/lib/utils'

async function downloadNotaPDF(n: NotaFiscalDto) {
  const { jsPDF } = await import('jspdf') as { jsPDF: typeof JsPDFType }
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210
  const margin = 20
  let y = 20

  // Header
  doc.setFillColor(56, 27, 9)
  doc.rect(0, 0, W, 28, 'F')
  doc.setTextColor(196, 167, 125)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('SuperPão', margin, 16)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Nota Fiscal de Serviço — NFS-e', margin, 23)
  y = 40

  // Número e status
  doc.setTextColor(40, 20, 5)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`NFS-e ${n.nfseNumber ? `Nº ${n.nfseNumber}` : '(em processamento)'}`, margin, y)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 90, 60)
  doc.text(`Status: ${n.status === 'ISSUED' ? 'Emitida' : n.status === 'PENDING' ? 'Pendente' : n.status === 'CANCELLED' ? 'Cancelada' : 'Erro'}`, W - margin, y, { align: 'right' })
  y += 8

  doc.setDrawColor(196, 167, 125)
  doc.setLineWidth(0.4)
  doc.line(margin, y, W - margin, y)
  y += 8

  // Seção Tomador
  const field = (label: string, value: string | undefined, xLabel: number, xValue: number, yy: number) => {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(120, 90, 60)
    doc.text(label, xLabel, yy)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(40, 20, 5)
    doc.text(value || '—', xValue, yy)
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(56, 27, 9)
  doc.text('Tomador do Serviço', margin, y)
  y += 6

  field('Nome:', n.clientName, margin, margin + 22, y); y += 6
  if (n.clientCpfCnpj) { field('CPF/CNPJ:', n.clientCpfCnpj, margin, margin + 22, y); y += 6 }
  if (n.clientEmail) { field('E-mail:', n.clientEmail, margin, margin + 22, y); y += 6 }
  y += 4

  doc.line(margin, y, W - margin, y)
  y += 8

  // Seção Serviço
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(56, 27, 9)
  doc.text('Serviço Prestado', margin, y)
  y += 6

  field('Descrição:', '', margin, margin, y); y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 20, 5)
  doc.setFontSize(9)
  const lines = doc.splitTextToSize(n.serviceDescription, W - margin * 2) as string[]
  doc.text(lines, margin, y)
  y += lines.length * 5 + 2

  if (n.serviceCode) { field('Código do serviço:', n.serviceCode, margin, margin + 36, y); y += 6 }
  y += 2

  doc.line(margin, y, W - margin, y)
  y += 8

  // Valor
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(56, 27, 9)
  doc.text('Valor Total', margin, y)
  doc.setTextColor(40, 120, 60)
  doc.text(formatCurrency(n.value), W - margin, y, { align: 'right' })
  y += 10

  doc.line(margin, y, W - margin, y)
  y += 8

  // Datas
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 90, 60)
  const emissao = n.issuedAt ? new Date(n.issuedAt).toLocaleDateString('pt-BR') : new Date(n.createdAt).toLocaleDateString('pt-BR')
  doc.text(`Data de emissão: ${emissao}`, margin, y)
  if (n.externalId) { doc.text(`ID externo: ${n.externalId}`, W - margin, y, { align: 'right' }) }
  y += 10

  // Footer
  doc.setFillColor(245, 240, 230)
  doc.rect(margin, y, W - margin * 2, 10, 'F')
  doc.setFontSize(7.5)
  doc.setTextColor(120, 90, 60)
  doc.text('Documento gerado pelo sistema SuperPão — uso interno', W / 2, y + 6, { align: 'center' })

  doc.save(`nfse-${n.nfseNumber ?? n.id.slice(0, 8)}.pdf`)
}

type BadgeVariant = 'warning' | 'success' | 'neutral' | 'danger'
const STATUS_STYLES: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING:   { label: 'Pendente',  variant: 'warning' },
  ISSUED:    { label: 'Emitida',   variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'neutral' },
  ERROR:     { label: 'Erro',      variant: 'danger' },
}

export default function NotasFiscaisPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [showCancel, setShowCancel] = useState<NotaFiscalDto | null>(null)
  const [motivo, setMotivo] = useState('')

  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientCpfCnpj, setClientCpfCnpj] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [serviceCode, setServiceCode] = useState('')
  const [value, setValue] = useState('')

  const { data, isLoading } = useQuery<PaginatedResponse<NotaFiscalDto>>({
    queryKey: ['notas-fiscais', page, search],
    queryFn: () => api.get('/api/nota-fiscal', { params: { page, limit: 20, search } }).then((r) => r.data),
  })

  const { data: clients } = useQuery<PaginatedResponse<ClientDto>>({
    queryKey: ['clients-all'],
    queryFn: () => api.get('/api/clients', { params: { page: 1, limit: 200 } }).then((r) => r.data),
    enabled: showForm,
  })

  const emitirMutation = useMutation({
    mutationFn: (payload: object) => api.post('/api/nota-fiscal', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais'] })
      toast.success('NFS-e emitida com sucesso.')
      closeForm()
    },
    onError: () => toast.error('Erro ao emitir nota fiscal.'),
  })

  const cancelarMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) =>
      api.post(`/api/nota-fiscal/${id}/cancelar`, { motivo }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais'] })
      toast.success('Nota fiscal cancelada.')
      setShowCancel(null)
      setMotivo('')
    },
    onError: () => toast.error('Erro ao cancelar nota fiscal.'),
  })

  function closeForm() {
    setShowForm(false)
    setClientId('')
    setClientName('')
    setClientCpfCnpj('')
    setClientEmail('')
    setServiceDescription('')
    setServiceCode('')
    setValue('')
  }

  function handleClientSelect(id: string) {
    setClientId(id)
    if (!id) { setClientName(''); return }
    const found = clients?.data.find((c) => c.id === id)
    if (found) {
      setClientName(found.name)
      if (found.cpfCnpj) setClientCpfCnpj(found.cpfCnpj)
      if (found.email) setClientEmail(found.email)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    emitirMutation.mutate({
      clientId: clientId || undefined,
      clientName,
      clientCpfCnpj: clientCpfCnpj || undefined,
      clientEmail: clientEmail || undefined,
      serviceDescription,
      serviceCode: serviceCode || undefined,
      value: parseFloat(value),
    })
  }

  return (
    <div>
      <PageHeader
        title="Notas Fiscais"
        description="Emissão de NFS-e para serviços prestados via GerandoNotaFacil"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Emitir NFS-e
          </Button>
        }
      />

      {/* Formulário de emissão */}
      <Drawer open={showForm} onClose={closeForm} title="Emitir NFS-e" width="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Cliente cadastrado</label>
            <select
              className="input-base w-full"
              value={clientId}
              onChange={(e) => handleClientSelect(e.target.value)}
            >
              <option value="">Nenhum (preencher manualmente)</option>
              {clients?.data.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">Nome do tomador *</label>
              <input
                required
                className="input-base w-full"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome completo ou razão social"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">CPF / CNPJ</label>
              <input
                className="input-base w-full"
                value={clientCpfCnpj}
                onChange={(e) => setClientCpfCnpj(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">E-mail do tomador</label>
            <input
              type="email"
              className="input-base w-full"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Descrição do serviço *</label>
            <textarea
              required
              rows={3}
              className="input-base w-full resize-none"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Ex: Serviço de catering para evento de 50 pessoas"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">Código do serviço</label>
              <input
                className="input-base w-full"
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                placeholder="Ex: 17.06"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-500 mb-1.5">Valor (R$) *</label>
              <input
                required
                type="number"
                step="0.01"
                min="0.01"
                className="input-base w-full"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="mt-auto pt-4 flex gap-2 justify-end border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={closeForm}>Cancelar</Button>
            <Button type="submit" disabled={emitirMutation.isPending}>
              {emitirMutation.isPending ? 'Emitindo...' : 'Emitir nota fiscal'}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Modal de cancelamento */}
      <Drawer
        open={!!showCancel}
        onClose={() => { setShowCancel(null); setMotivo('') }}
        title="Cancelar nota fiscal"
        width="max-w-md"
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="text-sm text-brand-600">
            Informe o motivo do cancelamento da NFS-e{' '}
            <span className="font-semibold">#{showCancel?.nfseNumber}</span>.
          </p>
          <div>
            <label className="block text-xs font-medium text-brand-500 mb-1.5">Motivo *</label>
            <textarea
              rows={3}
              className="input-base w-full resize-none"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo do cancelamento"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setShowCancel(null); setMotivo('') }}>Voltar</Button>
            <Button
              variant="danger"
              disabled={!motivo.trim() || cancelarMutation.isPending}
              onClick={() => showCancel && cancelarMutation.mutate({ id: showCancel.id, motivo })}
            >
              {cancelarMutation.isPending ? 'Cancelando...' : 'Confirmar cancelamento'}
            </Button>
          </div>
        </div>
      </Drawer>

      <Card>
        <div className="px-6 py-4 border-b border-surface-200">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1) }}
            placeholder="Buscar nota fiscal..."
          />
        </div>

        {isLoading ? (
          <LoadingState icon={FileText} message="Carregando notas fiscais..." />
        ) : !data?.data.length ? (
          <EmptyState
            icon={FileText}
            title="Nenhuma nota fiscal emitida"
            description="Emita NFS-e para serviços prestados a clientes."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/50">
                    <th className="table-head">Nº NFS-e</th>
                    <th className="table-head">Tomador</th>
                    <th className="table-head">Serviço</th>
                    <th className="table-head text-right">Valor</th>
                    <th className="table-head text-center">Status</th>
                    <th className="table-head text-right">Data</th>
                    <th className="table-head w-24" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((n, i) => {
                    const style = STATUS_STYLES[n.status] ?? { label: n.status, variant: 'neutral' as const }
                    return (
                      <tr
                        key={n.id}
                        className={cn(
                          'hover:bg-surface-50/80 transition-colors group',
                          i < data.data.length - 1 && 'border-b border-surface-100',
                        )}
                      >
                        <td className="table-cell text-xs text-brand-400 font-mono">
                          {n.nfseNumber ?? n.id.slice(0, 8)}
                        </td>
                        <td className="table-cell font-medium">
                          {n.clientName}
                        </td>
                        <td className="table-cell text-xs text-brand-500 max-w-[200px] truncate">
                          {n.serviceDescription}
                        </td>
                        <td className="table-cell text-right font-semibold">
                          {formatCurrency(n.value)}
                        </td>
                        <td className="table-cell text-center">
                          <Badge variant={style.variant}>{style.label}</Badge>
                        </td>
                        <td className="table-cell text-right text-xs text-brand-500">
                          {n.issuedAt
                            ? new Date(n.issuedAt).toLocaleDateString('pt-BR')
                            : new Date(n.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="table-cell">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="icon"
                              size="icon"
                              onClick={() => downloadNotaPDF(n)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-600 hover:bg-emerald-50"
                              aria-label="Baixar PDF"
                            >
                              <Download size={14} />
                            </Button>
                            {n.status === 'ISSUED' && (
                              <Button
                                variant="icon"
                                size="icon"
                                onClick={() => setShowCancel(n)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50"
                                aria-label="Cancelar nota"
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
              <Pagination
                page={page}
                totalPages={data.totalPages}
                total={data.total}
                label="notas fiscais"
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

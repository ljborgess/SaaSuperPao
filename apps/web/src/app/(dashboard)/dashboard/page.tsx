'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { formatCurrency } from '@superpao/shared-utils'
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Factory,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
  ChevronRight,
  Truck,
} from 'lucide-react'
import { getStoredUser } from '@/lib/auth'
import type {
  DashboardStats,
  LowStockItem,
  TopProducedProduct,
  DashboardActivity,
} from '@superpao/shared-types'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    RECEIVED: 'Recebida',
    CANCELLED: 'Cancelada',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluída',
  }
  return map[s] ?? s
}

function statusVariant(s: string): 'neutral' | 'success' | 'danger' | 'gold' | 'info' {
  if (s === 'RECEIVED' || s === 'COMPLETED') return 'success'
  if (s === 'PENDING') return 'gold'
  if (s === 'IN_PROGRESS') return 'info'
  if (s === 'CANCELLED') return 'danger'
  return 'neutral'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function DashboardPage() {
  const [user, setUser] = useState<ReturnType<typeof getStoredUser>>(null)
  useEffect(() => { setUser(getStoredUser()) }, [])

  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/api/dashboard/stats').then((r) => r.data),
    refetchInterval: 30_000,
  })

  const { data: lowStock = [], isLoading: loadingLow } = useQuery<LowStockItem[]>({
    queryKey: ['dashboard-low-stock'],
    queryFn: () => api.get('/api/dashboard/low-stock').then((r) => r.data),
    refetchInterval: 60_000,
  })

  const { data: topProducts = [] } = useQuery<TopProducedProduct[]>({
    queryKey: ['dashboard-top-products'],
    queryFn: () => api.get('/api/dashboard/top-products').then((r) => r.data),
    refetchInterval: 60_000,
  })

  const { data: activity } = useQuery<DashboardActivity>({
    queryKey: ['dashboard-activity'],
    queryFn: () => api.get('/api/dashboard/activity').then((r) => r.data),
    refetchInterval: 30_000,
  })

  const totalLowStock = (stats?.lowStockIngredients ?? 0) + (stats?.lowStockProducts ?? 0)

  const kpiCards = [
    {
      label: 'Produtos ativos',
      value: loadingStats ? null : (stats?.totalProducts ?? '—'),
      sub: `${stats?.totalIngredients ?? '—'} ingredientes`,
      icon: Package,
      href: '/produtos',
      leftBorder: 'border-l-brand-400',
      iconColor: 'text-brand-600',
      iconBg: 'bg-brand-100',
      valueColor: 'text-brand-900',
    },
    {
      label: 'Alertas de estoque',
      value: loadingStats ? null : totalLowStock,
      sub: `${stats?.lowStockIngredients ?? 0} ing. · ${stats?.lowStockProducts ?? 0} prod.`,
      icon: AlertTriangle,
      href: '#estoque-critico',
      leftBorder: totalLowStock > 0 ? 'border-l-red-400' : 'border-l-emerald-400',
      iconColor: totalLowStock > 0 ? 'text-red-500' : 'text-emerald-500',
      iconBg: totalLowStock > 0 ? 'bg-red-50' : 'bg-emerald-50',
      valueColor: totalLowStock > 0 ? 'text-red-600' : 'text-emerald-600',
    },
    {
      label: 'Compras no mês',
      value: loadingStats ? null : formatCurrency(stats?.purchasesValueThisMonth ?? 0),
      sub: `${stats?.purchasesThisMonth ?? 0} pedidos · ${stats?.pendingPurchases ?? 0} pendentes`,
      icon: ShoppingCart,
      href: '/compras',
      leftBorder: 'border-l-emerald-400',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valueColor: 'text-brand-900',
    },
    {
      label: 'Produção hoje',
      value: loadingStats ? null : (stats?.productionToday ?? '—'),
      sub: `${stats?.activeProdOrders ?? 0} ativas · ${stats?.productionThisMonth ?? 0} no mês`,
      icon: Factory,
      href: '/producao',
      leftBorder: 'border-l-amber-400',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      valueColor: 'text-brand-900',
    },
  ]

  const quickStats = [
    { icon: Users, label: 'Clientes', value: stats?.totalClients, href: '/clientes' },
    { icon: Truck, label: 'Fornecedores', value: stats?.totalSuppliers, href: '/fornecedores' },
    { icon: ShoppingCart, label: 'Compras pendentes', value: stats?.pendingPurchases, href: '/compras' },
    { icon: Factory, label: 'Produções ativas', value: stats?.activeProdOrders, href: '/producao' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-slide-up">
        <div>
          <p className="text-sm font-medium text-brand-400 mb-0.5">{getGreeting()},</p>
          <h1 className="text-3xl font-bold text-brand-900 tracking-tight" suppressHydrationWarning>
            {user?.name.split(' ')[0] ?? '...'}
          </h1>
          <p className="text-sm text-brand-400 mt-1">
            Resumo operacional em tempo real da sua padaria.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-brand-400 bg-surface-50 border border-surface-200 rounded-full px-3 py-1.5 mt-2 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
          Ao vivo
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              'group relative bg-white rounded-2xl border border-surface-200 border-l-4 p-5 shadow-card overflow-hidden',
              'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-slide-up',
              card.leftBorder,
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', card.iconBg)}>
                <card.icon size={18} className={card.iconColor} strokeWidth={1.75} />
              </div>
              <ChevronRight
                size={14}
                className="text-brand-200 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all mt-1"
              />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-brand-400 uppercase tracking-wide">{card.label}</p>
              <p
                className={cn(
                  'text-2xl font-bold mt-1 tracking-tight',
                  card.value === null ? 'text-brand-200 animate-pulse' : card.valueColor,
                )}
              >
                {card.value === null ? '...' : card.value}
              </p>
              {card.sub && <p className="text-xs text-brand-300 mt-1">{card.sub}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickStats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group bg-white rounded-xl border border-surface-200 px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-brand-200 transition-all"
          >
            <item.icon size={15} className="text-brand-300 group-hover:text-brand-500 transition-colors shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-brand-400 truncate">{item.label}</p>
              <p className={cn('text-lg font-bold', loadingStats ? 'text-brand-200 animate-pulse' : 'text-brand-900')}>
                {loadingStats ? '—' : (item.value ?? '—')}
              </p>
            </div>
            <ChevronRight size={12} className="text-brand-200 group-hover:text-brand-400 shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Top produzidos — wider */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
              <TrendingUp size={15} className="text-brand-600" />
            </div>
            <CardTitle>Top produzidos no mês</CardTitle>
          </CardHeader>
          {topProducts.length === 0 ? (
            <EmptyState icon={TrendingUp} title="Sem produções concluídas" description="Nenhuma produção finalizada este mês." />
          ) : (
            <div className="divide-y divide-surface-100 pb-1">
              {topProducts.map((p, i) => {
                const max = topProducts[0]?.totalQty ?? 1
                const pct = Math.round((p.totalQty / max) * 100)
                return (
                  <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-sm font-bold text-brand-200 w-5 shrink-0 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-900 truncate">{p.name}</p>
                      <div className="mt-1.5 h-1.5 w-full bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-700 shrink-0 tabular-nums">{p.totalQty}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Compras + Produções — stacked */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Compras recentes */}
          <Card>
            <CardHeader>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <ShoppingCart size={15} className="text-emerald-600" />
              </div>
              <CardTitle>Compras recentes</CardTitle>
              <Link
                href="/compras"
                className="ml-auto flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 transition-colors"
              >
                Ver todas <ChevronRight size={12} />
              </Link>
            </CardHeader>
            {!activity?.recentPurchases?.length ? (
              <p className="px-5 pb-4 text-sm text-brand-400">Nenhuma compra este mês.</p>
            ) : (
              <div className="divide-y divide-surface-100">
                {activity.recentPurchases.map((p) => (
                  <div key={p.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brand-900 truncate">{p.supplierName}</p>
                      <p className="text-xs text-brand-400">
                        {formatDate(p.purchaseDate)}
                        {p.invoiceNumber ? ` · NF ${p.invoiceNumber}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-brand-800 tabular-nums">{formatCurrency(p.totalValue)}</span>
                      <Badge variant={statusVariant(p.status)}>{statusLabel(p.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Produções em aberto */}
          <Card>
            <CardHeader>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Factory size={15} className="text-amber-600" />
              </div>
              <CardTitle>Produções em aberto</CardTitle>
              {(activity?.activeProdOrders?.length ?? 0) > 0 && (
                <Badge variant="gold" className="ml-1">
                  {activity!.activeProdOrders.length}
                </Badge>
              )}
              <Link
                href="/producao"
                className="ml-auto flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 transition-colors"
              >
                Ver todas <ChevronRight size={12} />
              </Link>
            </CardHeader>
            {!activity?.activeProdOrders?.length ? (
              <p className="px-5 pb-4 text-sm text-brand-400">Nenhuma produção ativa.</p>
            ) : (
              <div className="divide-y divide-surface-100">
                {activity.activeProdOrders.map((o) => (
                  <div key={o.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {o.status === 'IN_PROGRESS' ? (
                        <Loader2 size={13} className="text-blue-500 shrink-0 animate-spin" />
                      ) : (
                        <Clock size={13} className="text-brand-300 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-900 truncate">{o.productName}</p>
                        <p className="text-xs text-brand-400">{formatDate(o.scheduledDate)} · {o.quantity} un</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(o.status)}>{statusLabel(o.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Alertas de estoque baixo */}
      <Card id="estoque-critico">
        <CardHeader>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', totalLowStock > 0 ? 'bg-red-50' : 'bg-emerald-50')}>
            <AlertTriangle size={15} className={totalLowStock > 0 ? 'text-red-500' : 'text-emerald-500'} />
          </div>
          <CardTitle>Estoque crítico</CardTitle>
          {totalLowStock > 0 && (
            <Badge variant="danger" className="ml-1">
              {totalLowStock} {totalLowStock === 1 ? 'item' : 'itens'}
            </Badge>
          )}
          <Link
            href="/estoque"
            className="ml-auto flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 transition-colors"
          >
            Gerenciar <ChevronRight size={12} />
          </Link>
        </CardHeader>

        {loadingLow ? (
          <div className="flex items-center justify-center py-10 text-brand-300 gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Verificando estoques…</span>
          </div>
        ) : lowStock.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Estoque em ordem" description="Nenhum item abaixo do nível mínimo." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-surface-100 border-t border-surface-100">
            {lowStock.map((item) => {
              const pct = item.minStock > 0 ? (item.currentStock / item.minStock) * 100 : 0
              const deficit = item.minStock - item.currentStock
              const severity = pct === 0 ? 'zero' : pct < 50 ? 'critical' : 'low'
              return (
                <div key={item.id} className="bg-white px-5 py-4 hover:bg-surface-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-brand-900 truncate">{item.name}</p>
                      <p className="text-xs text-brand-400 mt-0.5">
                        <Badge variant={item.type === 'ingredient' ? 'gold' : 'info'} className="text-[10px] py-0 px-1.5">
                          {item.type === 'ingredient' ? 'Ingrediente' : 'Produto'}
                        </Badge>
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                        severity === 'zero'
                          ? 'bg-red-100 text-red-700'
                          : severity === 'critical'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-amber-50 text-amber-600',
                      )}
                    >
                      {severity === 'zero' ? 'Zerado' : `${Math.round(pct)}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        severity === 'zero'
                          ? 'bg-red-500'
                          : severity === 'critical'
                            ? 'bg-red-400'
                            : 'bg-amber-400',
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-brand-400">
                    <span>
                      Atual: <span className="font-semibold text-brand-700">{item.currentStock} {item.unit}</span>
                    </span>
                    <span>
                      Faltam: <span className="font-semibold text-red-500">{deficit > 0 ? deficit : 0} {item.unit}</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

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
  TrendingDown,
  CheckCircle2,
  Clock,
  Loader2,
  Users,
  ChevronRight,
  Truck,
  Minus,
} from 'lucide-react'
import { getStoredUser } from '@/lib/auth'
import type {
  DashboardStats,
  LowStockItem,
  TopProducedProduct,
  DashboardActivity,
  DashboardTrends,
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
    PENDING: 'Pendente', RECEIVED: 'Recebida', CANCELLED: 'Cancelada',
    IN_PROGRESS: 'Em andamento', COMPLETED: 'Concluída',
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

/* ── Purchase bar chart ──────────────────────────────────────────────────── */
function PurchaseChart({ data }: { data: DashboardTrends['monthlyPurchases'] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="px-5 pb-5">
      <div className="flex gap-2 h-36">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100
          const isCurrent = i === data.length - 1
          return (
            <div key={`${d.month}-${d.year}`} className="flex-1 flex flex-col items-center gap-1.5 group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-900 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {formatCurrency(d.value)}
                <br />
                <span className="text-brand-400 font-normal">{d.count} pedido{d.count !== 1 ? 's' : ''}</span>
              </div>

              {/* Bar */}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-500 cursor-pointer',
                    isCurrent
                      ? 'bg-gradient-to-t from-brand-600 to-brand-400 shadow-sm'
                      : 'bg-gradient-to-t from-surface-300 to-surface-200 group-hover:from-brand-200 group-hover:to-brand-100',
                  )}
                  style={{ height: `${Math.max(pct, 3)}%` }}
                />
              </div>

              <span className={cn('text-[10px] font-semibold', isCurrent ? 'text-brand-600' : 'text-brand-300')}>
                {d.month}
              </span>
            </div>
          )
        })}
      </div>

      <div className="h-px bg-surface-200 -mt-px mb-3" />

      <div className="flex items-center justify-between text-xs text-brand-400">
        <span>Últimos 6 meses</span>
        <span className="font-semibold text-brand-700">
          Total: {formatCurrency(data.reduce((s, d) => s + d.value, 0))}
        </span>
      </div>
    </div>
  )
}

/* ── Growth card ─────────────────────────────────────────────────────────── */
function GrowthCard({
  icon: Icon,
  label,
  stat,
  href,
}: {
  icon: React.ElementType
  label: string
  stat: DashboardTrends['clientsGrowth'] | null
  href: string
}) {
  const pct = stat?.growthPct ?? 0
  const isUp = pct > 0
  const isFlat = pct === 0
  const TrendIcon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown
  const trendColor = isFlat ? 'text-brand-400' : isUp ? 'text-emerald-600' : 'text-red-500'
  const trendBg = isFlat ? 'bg-brand-50' : isUp ? 'bg-emerald-50' : 'bg-red-50'

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-surface-200 p-5 shadow-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
            <Icon size={16} className="text-brand-500" />
          </div>
          <span className="text-xs font-semibold text-brand-500 uppercase tracking-wide">{label}</span>
        </div>
        <ChevronRight size={14} className="text-brand-200 group-hover:text-brand-400 transition-colors" />
      </div>

      {stat ? (
        <>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-brand-900 font-display leading-none">{stat.total}</p>
            <div className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold', trendBg, trendColor)}>
              <TrendIcon size={12} />
              {isFlat ? 'Estável' : `${Math.abs(pct)}%`}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-surface-100">
            <div className="flex justify-between text-xs">
              <span className="text-brand-400">Novos este mês</span>
              <span className="font-semibold text-brand-700">{stat.newThisMonth}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-brand-400">Mês anterior</span>
              <span className="font-semibold text-brand-500">{stat.newLastMonth}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="h-20 flex items-center justify-center">
          <Loader2 size={18} className="text-brand-200 animate-spin" />
        </div>
      )}
    </Link>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
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

  const { data: trends } = useQuery<DashboardTrends>({
    queryKey: ['dashboard-trends'],
    queryFn: () => api.get('/api/dashboard/trends').then((r) => r.data),
    refetchInterval: 120_000,
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
      iconColor: 'text-brand-600', iconBg: 'bg-brand-100', valueColor: 'text-brand-900',
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
      iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', valueColor: 'text-brand-900',
    },
    {
      label: 'Produção hoje',
      value: loadingStats ? null : (stats?.productionToday ?? '—'),
      sub: `${stats?.activeProdOrders ?? 0} ativas · ${stats?.productionThisMonth ?? 0} no mês`,
      icon: Factory,
      href: '/producao',
      leftBorder: 'border-l-amber-400',
      iconColor: 'text-amber-600', iconBg: 'bg-amber-50', valueColor: 'text-brand-900',
    },
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
          <p className="text-sm text-brand-400 mt-1">Resumo operacional em tempo real da sua padaria.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-brand-400 bg-surface-50 border border-surface-200 rounded-full px-3 py-1.5 mt-2 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" />
          Ao vivo
        </div>
      </div>

      {/* KPI cards */}
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
              <ChevronRight size={14} className="text-brand-200 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all mt-1" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-brand-400 uppercase tracking-wide">{card.label}</p>
              <p className={cn('text-2xl font-bold mt-1 tracking-tight', card.value === null ? 'text-brand-200 animate-pulse' : card.valueColor)}>
                {card.value === null ? '...' : card.value}
              </p>
              {card.sub && <p className="text-xs text-brand-300 mt-1">{card.sub}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* Charts + Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                <ShoppingCart size={15} className="text-brand-600" />
              </div>
              <CardTitle>Compras por mês</CardTitle>
              <span className="ml-auto text-xs text-brand-300">últimos 6 meses</span>
            </CardHeader>
            {!trends ? (
              <div className="flex items-center justify-center py-14">
                <Loader2 size={20} className="text-brand-200 animate-spin" />
              </div>
            ) : trends.monthlyPurchases.every((m) => m.value === 0) ? (
              <EmptyState icon={ShoppingCart} title="Sem compras registradas" description="Nenhuma compra nos últimos 6 meses." />
            ) : (
              <PurchaseChart data={trends.monthlyPurchases} />
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <GrowthCard icon={Users} label="Clientes" stat={trends?.clientsGrowth ?? null} href="/clientes" />
          <GrowthCard icon={Truck} label="Fornecedores" stat={trends?.suppliersGrowth ?? null} href="/fornecedores" />
        </div>
      </div>

      {/* Top produtos + atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
                        <div className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-700 shrink-0 tabular-nums">{p.totalQty}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <ShoppingCart size={15} className="text-emerald-600" />
              </div>
              <CardTitle>Compras recentes</CardTitle>
              <Link href="/compras" className="ml-auto flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 transition-colors">
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
                      <p className="text-xs text-brand-400">{formatDate(p.purchaseDate)}{p.invoiceNumber ? ` · NF ${p.invoiceNumber}` : ''}</p>
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

          <Card>
            <CardHeader>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Factory size={15} className="text-amber-600" />
              </div>
              <CardTitle>Produções em aberto</CardTitle>
              {(activity?.activeProdOrders?.length ?? 0) > 0 && (
                <Badge variant="gold" className="ml-1">{activity!.activeProdOrders.length}</Badge>
              )}
              <Link href="/producao" className="ml-auto flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 transition-colors">
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
                      {o.status === 'IN_PROGRESS'
                        ? <Loader2 size={13} className="text-blue-500 shrink-0 animate-spin" />
                        : <Clock size={13} className="text-brand-300 shrink-0" />
                      }
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

      {/* Estoque crítico */}
      <Card id="estoque-critico">
        <CardHeader>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', totalLowStock > 0 ? 'bg-red-50' : 'bg-emerald-50')}>
            <AlertTriangle size={15} className={totalLowStock > 0 ? 'text-red-500' : 'text-emerald-500'} />
          </div>
          <CardTitle>Estoque crítico</CardTitle>
          {totalLowStock > 0 && (
            <Badge variant="danger" className="ml-1">{totalLowStock} {totalLowStock === 1 ? 'item' : 'itens'}</Badge>
          )}
          <Link href="/estoque" className="ml-auto flex items-center gap-1 text-xs text-brand-400 hover:text-brand-700 transition-colors">
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
                    <span className={cn(
                      'text-xs font-bold px-2 py-0.5 rounded-full shrink-0',
                      severity === 'zero' ? 'bg-red-100 text-red-700'
                        : severity === 'critical' ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-600',
                    )}>
                      {severity === 'zero' ? 'Zerado' : `${Math.round(pct)}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden mb-2">
                    <div
                      className={cn('h-full rounded-full transition-all',
                        severity === 'zero' ? 'bg-red-500' : severity === 'critical' ? 'bg-red-400' : 'bg-amber-400'
                      )}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-400">
                    <span>Atual: <span className="font-semibold text-brand-700">{item.currentStock} {item.unit}</span></span>
                    <span>Faltam: <span className="font-semibold text-red-500">{deficit > 0 ? deficit : 0} {item.unit}</span></span>
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

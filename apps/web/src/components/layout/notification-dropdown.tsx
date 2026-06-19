'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Bell, AlertTriangle, CheckCircle, Package, ShoppingCart, X } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { NotificationsDto, NotificationDto, NotificationType } from '@superpao/shared-types'

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}

function notificationIcon(type: NotificationType) {
  switch (type) {
    case 'LOW_STOCK_INGREDIENT':
    case 'LOW_STOCK_PRODUCT':
      return <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
    case 'PURCHASE_RECEIVED':
      return <ShoppingCart size={14} className="text-blue-500 shrink-0 mt-0.5" />
    case 'PRODUCTION_COMPLETED':
      return <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
    default:
      return <Package size={14} className="text-brand-400 shrink-0 mt-0.5" />
  }
}

function notificationHref(type: NotificationType): string {
  switch (type) {
    case 'LOW_STOCK_INGREDIENT':
    case 'LOW_STOCK_PRODUCT':
      return '/dashboard#estoque-critico'
    case 'PURCHASE_RECEIVED':
      return '/compras'
    case 'PRODUCTION_COMPLETED':
      return '/producao'
    default:
      return '/dashboard'
  }
}

function NotificationItem({ n, onClose }: { n: NotificationDto; onClose: () => void }) {
  const router = useRouter()

  function handleClick() {
    const href = notificationHref(n.type)
    onClose()
    if (href.includes('#')) {
      const [path, hash] = href.split('#')
      router.push(path)
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    } else {
      router.push(href)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex gap-2.5 px-4 py-3 hover:bg-surface-50 transition-colors"
    >
      {notificationIcon(n.type)}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-brand-800 leading-tight">{n.title}</p>
        <p className="text-[11px] text-brand-400 mt-0.5 leading-snug">{n.description}</p>
      </div>
      <span className="text-[10px] text-brand-300 shrink-0 mt-0.5 whitespace-nowrap">
        {formatRelativeTime(n.occurredAt)}
      </span>
    </button>
  )
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'alerts' | 'activity'>('alerts')
  const ref = useRef<HTMLDivElement>(null)

  const { data } = useQuery<NotificationsDto>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/api/dashboard/notifications').then((r) => r.data),
    refetchInterval: 60_000,
    retry: false,
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const alertCount = data?.alerts.length ?? 0
  const activityCount = data?.activity.length ?? 0
  const totalUnread = alertCount + activityCount
  const items = tab === 'alerts' ? data?.alerts ?? [] : data?.activity ?? []

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-brand-400 hover:bg-surface-100 hover:text-brand-600 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} strokeWidth={1.75} />
        {totalUnread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white leading-none">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-200/80 z-50 overflow-hidden animate-slide-up">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h3 className="text-sm font-semibold text-brand-900">Notificações</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-brand-300 hover:text-brand-600 hover:bg-surface-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex border-b border-surface-200 px-4">
            <button
              onClick={() => setTab('alerts')}
              className={cn(
                'text-xs font-medium py-2 mr-4 border-b-2 transition-colors',
                tab === 'alerts'
                  ? 'border-brand-600 text-brand-800'
                  : 'border-transparent text-brand-400 hover:text-brand-600',
              )}
            >
              Alertas
              {alertCount > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {alertCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('activity')}
              className={cn(
                'text-xs font-medium py-2 border-b-2 transition-colors',
                tab === 'activity'
                  ? 'border-brand-600 text-brand-800'
                  : 'border-transparent text-brand-400 hover:text-brand-600',
              )}
            >
              Atividade recente
              {activityCount > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {activityCount}
                </span>
              )}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-surface-100">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-brand-400">
                  {tab === 'alerts' ? 'Nenhum alerta no momento.' : 'Nenhuma ação recente.'}
                </p>
              </div>
            ) : (
              items.map((n) => <NotificationItem key={n.id} n={n} onClose={() => setOpen(false)} />)
            )}
          </div>

          {tab === 'alerts' && alertCount === 0 && (
            <div className="px-4 py-2 border-t border-surface-100">
              <p className="text-[11px] text-brand-300 text-center">Todos os estoques estão OK</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

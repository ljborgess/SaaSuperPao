'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Bell, AlertTriangle, X } from 'lucide-react'
import { api } from '@/lib/api'
import type { NotificationsDto, NotificationDto, NotificationType } from '@superpao/shared-types'

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

function NotificationItem({ n, onClose }: { n: NotificationDto; onClose: () => void }) {
  const router = useRouter()

  function handleClick() {
    onClose()
    const href = n.type === 'LOW_STOCK_INGREDIENT' || n.type === 'LOW_STOCK_PRODUCT'
      ? '/estoque'
      : n.type === 'PURCHASE_RECEIVED' ? '/compras'
      : n.type === 'PRODUCTION_COMPLETED' ? '/producao'
      : '/dashboard'
    router.push(href)
  }

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex gap-3 px-4 py-3.5 transition-colors hover:bg-red-500/[0.04] border-b last:border-b-0"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(239,68,68,0.12)' }}>
        <AlertTriangle size={13} className="text-red-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold leading-tight" style={{ color: '#C4A77D' }}>{n.title}</p>
        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'rgba(196,167,125,0.5)' }}>{n.description}</p>
      </div>
      <span className="text-[10px] shrink-0 mt-0.5 whitespace-nowrap" style={{ color: 'rgba(196,167,125,0.35)' }}>
        {formatRelativeTime(n.occurredAt)}
      </span>
    </button>
  )
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
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

  const alerts = [...(data?.alerts ?? []), ...(data?.activity ?? [])]
  const count  = alerts.length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl transition-colors hover:bg-white/[0.05]"
        style={{ color: 'rgba(196,167,125,0.6)' }}
        aria-label="Notificações"
      >
        <Bell size={17} strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white leading-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl z-50 overflow-hidden"
          style={{
            background: '#2C1508',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-red-400" />
              <h3 className="text-xs font-semibold" style={{ color: '#C4A77D' }}>Alertas</h3>
              {count > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">
                  {count}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg transition-colors hover:bg-white/[0.05]"
              style={{ color: 'rgba(196,167,125,0.5)' }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.08)' }}>
                  <Bell size={16} style={{ color: 'rgba(196,167,125,0.3)' }} />
                </div>
                <p className="text-xs font-medium" style={{ color: 'rgba(196,167,125,0.4)' }}>Nenhum alerta no momento</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(196,167,125,0.25)' }}>Todos os estoques estão OK</p>
              </div>
            ) : (
              alerts.map((n) => <NotificationItem key={n.id} n={n} onClose={() => setOpen(false)} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

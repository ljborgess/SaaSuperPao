'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export function Drawer({ open, onClose, title, children, width = 'max-w-md' }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-[1px]" onClick={onClose} />
      <div className={cn('w-full bg-white shadow-2xl flex flex-col animate-slide-left h-full overflow-y-auto', width)}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-200 shrink-0">
          <h3 className="text-base font-semibold text-brand-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-400 hover:text-brand-700 hover:bg-surface-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

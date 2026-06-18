'use client'
import * as React from 'react'
import { cn } from '../utils'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4', className)}>
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
          <button onClick={onClose} className="ml-auto p-1 rounded hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

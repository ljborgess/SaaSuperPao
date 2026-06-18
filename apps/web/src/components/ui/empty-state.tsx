import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('py-20 flex flex-col items-center gap-3 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center">
        <Icon size={24} className="text-brand-300" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-brand-600">{title}</p>
        {description && (
          <p className="text-xs text-brand-400 mt-1 max-w-xs">{description}</p>
        )}
      </div>
    </div>
  )
}

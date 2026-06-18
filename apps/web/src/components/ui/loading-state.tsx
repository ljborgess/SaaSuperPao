import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface LoadingStateProps {
  icon?: LucideIcon
  message?: string
  className?: string
}

export function LoadingState({ icon: Icon, message = 'Carregando...', className }: LoadingStateProps) {
  return (
    <div className={cn('py-20 flex flex-col items-center gap-4', className)}>
      {Icon && (
        <div className="relative">
          <Icon size={32} className="text-brand-200" strokeWidth={1.5} />
          <div className="absolute inset-0 animate-pulse">
            <Icon size={32} className="text-brand-400/40" strokeWidth={1.5} />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-brand-400 font-medium">{message}</p>
      </div>
    </div>
  )
}

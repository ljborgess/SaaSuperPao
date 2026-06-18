import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ className, padding = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-surface-300/80 shadow-card overflow-hidden',
        padding && 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-surface-200 flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-brand-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
}

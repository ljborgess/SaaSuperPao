interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-brand-900 tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-brand-400 mt-1 max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

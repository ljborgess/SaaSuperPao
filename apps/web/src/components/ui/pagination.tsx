import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  label: string
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, label, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const showEllipsis = totalPages > 7

  function visiblePages() {
    if (!showEllipsis) return pages
    if (page <= 4) return [...pages.slice(0, 5), '...', totalPages]
    if (page >= totalPages - 3) return [1, '...', ...pages.slice(totalPages - 5)]
    return [1, '...', page - 1, page, page + 1, '...', totalPages]
  }

  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-t border-surface-200 bg-surface-50/50">
      <p className="text-xs text-brand-400 font-medium">
        {total} {label}
      </p>
      <div className="flex items-center gap-1">
        {visiblePages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-brand-300 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all duration-150',
                page === p
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-brand-500 hover:bg-surface-200',
              )}
            >
              {p}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

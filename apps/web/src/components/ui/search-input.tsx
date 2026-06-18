import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className }: SearchInputProps) {
  return (
    <div className={cn('relative max-w-sm', className)}>
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-300 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-10 bg-surface-50 border-surface-200"
      />
    </div>
  )
}

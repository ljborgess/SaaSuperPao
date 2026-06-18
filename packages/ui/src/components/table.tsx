import * as React from 'react'
import { cn } from '../utils'

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full text-sm', className)} {...props} />
    </div>
  )
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-4 py-3 text-left font-medium text-gray-600 bg-gray-50', className)} {...props} />
  )
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 border-t', className)} {...props} />
}

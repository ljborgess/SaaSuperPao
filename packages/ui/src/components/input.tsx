import * as React from 'react'
import { cn } from '../utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          error && 'border-red-500 focus:ring-red-500',
          className,
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  ),
)
Input.displayName = 'Input'

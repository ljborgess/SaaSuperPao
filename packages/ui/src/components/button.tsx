import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-white hover:bg-brand-700',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-600 hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'text-sm px-3 py-1.5',
        default: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'

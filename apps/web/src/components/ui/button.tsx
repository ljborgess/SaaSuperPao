import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-600 text-white shadow-soft hover:bg-brand-700 active:bg-brand-800',
        secondary:
          'bg-surface-200 text-brand-700 hover:bg-surface-300 active:bg-surface-400',
        outline:
          'border border-surface-300 bg-white text-brand-700 hover:bg-surface-50 hover:border-brand-300',
        ghost:
          'text-brand-600 hover:bg-brand-50 hover:text-brand-800',
        danger:
          'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200',
        icon:
          'p-2 text-brand-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { buttonVariants }

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-700',
        success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
        warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
        danger: 'bg-red-50 text-red-600 ring-1 ring-red-200/60',
        info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200/60',
        neutral: 'bg-surface-200 text-brand-500',
        gold: 'bg-accent-wheat/40 text-brand-700 ring-1 ring-accent-gold/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variants = {
  default: 'bg-muted/10 text-muted',
  success: 'bg-emerald-500/10 text-emerald-600',
  warning: 'bg-amber-500/10 text-amber-600',
  danger: 'bg-red-500/10 text-red-600',
  info: 'bg-primary/10 text-primary',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-md', variants[variant], className)}>
      {children}
    </span>
  )
}

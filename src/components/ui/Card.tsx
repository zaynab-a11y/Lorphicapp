import clsx from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
}

export default function Card({ children, className, title, subtitle, action }: CardProps) {
  return (
    <div className={clsx('bg-card rounded-2xl border border-border shadow-card', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            {title && <h3 className="text-white font-semibold text-base">{title}</h3>}
            {subtitle && <p className="text-muted text-xs mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

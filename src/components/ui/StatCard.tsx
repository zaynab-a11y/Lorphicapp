import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color?: 'primary' | 'accent' | 'green' | 'purple'
}

const colorMap = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary', border: 'border-primary/20' },
  accent: { bg: 'bg-accent/10', icon: 'text-accent', border: 'border-accent/20' },
  green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-600', border: 'border-emerald-500/20' },
  purple: { bg: 'bg-orange-500/10', icon: 'text-orange-600', border: 'border-orange-200' },
}

export default function StatCard({ title, value, change, changeLabel, icon, color = 'primary' }: StatCardProps) {
  const colors = colorMap[color]
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === undefined || change === 0

  return (
    <div className={clsx('bg-card rounded-2xl p-5 border shadow-card', colors.border)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-muted text-sm font-medium">{title}</p>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg, colors.icon)}>
          {icon}
        </div>
      </div>

      <p className="text-foreground text-3xl font-bold mb-2">{value}</p>

      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={clsx(
              'flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md',
              isPositive && 'text-emerald-600 bg-emerald-500/10',
              isNegative && 'text-red-600 bg-red-500/10',
              isNeutral && 'text-muted bg-muted/10'
            )}
          >
            {isPositive && '↑'}
            {isNegative && '↓'}
            {isNeutral && '→'}
            {Math.abs(change)}%
          </span>
          {changeLabel && <span className="text-muted text-xs">{changeLabel}</span>}
        </div>
      )}
    </div>
  )
}

import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { activityData } from '@/lib/mockData'

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  backlink: {
    label: 'Backlink',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  technical: {
    label: 'Technical',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
  },
  content: {
    label: 'Content',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
}

const impactConfig: Record<string, { label: string; className: string }> = {
  high: { label: 'High', className: 'text-emerald-400 bg-emerald-400/10' },
  medium: { label: 'Medium', className: 'text-yellow-400 bg-yellow-400/10' },
  low: { label: 'Low', className: 'text-muted bg-muted/10' },
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date('2024-04-10') // Use a fixed "now" for demo
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export default async function ActivityPage() {
  const user = null

  const backlinks = activityData.filter((a) => a.type === 'backlink').length
  const technical = activityData.filter((a) => a.type === 'technical').length
  const content = activityData.filter((a) => a.type === 'content').length

  return (
    <DashboardLayout
      title="Activity Feed"
      subtitle="All SEO updates and improvements"
      user={user}
    >
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            {typeConfig.backlink.icon}
          </div>
          <div>
            <p className="text-white text-xl font-bold">{backlinks}</p>
            <p className="text-muted text-xs">Backlinks</p>
          </div>
        </div>
        <div className="bg-card border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            {typeConfig.technical.icon}
          </div>
          <div>
            <p className="text-white text-xl font-bold">{technical}</p>
            <p className="text-muted text-xs">Technical</p>
          </div>
        </div>
        <div className="bg-card border border-violet-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400">
            {typeConfig.content.icon}
          </div>
          <div>
            <p className="text-white text-xl font-bold">{content}</p>
            <p className="text-muted text-xs">Content</p>
          </div>
        </div>
      </div>

      <Card title="Activity Log" subtitle={`${activityData.length} updates in the last 30 days`}>
        <div className="space-y-0">
          {activityData.map((item, idx) => {
            const config = typeConfig[item.type]
            const impact = impactConfig[item.impact]
            const isLast = idx === activityData.length - 1

            return (
              <div key={item.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    {config.icon}
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[20px]" />}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${impact.className}`}>
                        {impact.label} Impact
                      </span>
                    </div>
                    <span className="text-muted text-xs flex-shrink-0">{formatRelativeTime(item.timestamp)}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{item.description}</p>
                  <p className="text-muted/50 text-xs mt-1">
                    {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </DashboardLayout>
  )
}

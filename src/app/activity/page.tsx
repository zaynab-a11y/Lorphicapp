export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
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
  high: { label: 'High', className: 'text-emerald-600 bg-emerald-500/10' },
  medium: { label: 'Medium', className: 'text-amber-600 bg-amber-500/10' },
  low: { label: 'Low', className: 'text-muted bg-muted/10' },
}

export default async function ActivityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const { data: activityData } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = activityData ?? []
  const backlinks = items.filter((a) => a.type === 'backlink').length
  const technical = items.filter((a) => a.type === 'technical').length
  const content = items.filter((a) => a.type === 'content').length

  return (
    <DashboardLayout
      title="Activity Feed"
      subtitle="All SEO updates and improvements"
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' }}
    >
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            {typeConfig.backlink.icon}
          </div>
          <div>
            <p className="text-foreground text-xl font-bold">{backlinks}</p>
            <p className="text-muted text-xs">Backlinks</p>
          </div>
        </div>
        <div className="bg-card border border-accent/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
            {typeConfig.technical.icon}
          </div>
          <div>
            <p className="text-foreground text-xl font-bold">{technical}</p>
            <p className="text-muted text-xs">Technical</p>
          </div>
        </div>
        <div className="bg-card border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-600">
            {typeConfig.content.icon}
          </div>
          <div>
            <p className="text-foreground text-xl font-bold">{content}</p>
            <p className="text-muted text-xs">Content</p>
          </div>
        </div>
      </div>

      <Card title="Activity Log" subtitle={items.length > 0 ? `${items.length} updates` : 'No updates yet'}>
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">No SEO updates posted yet.</p>
            <p className="text-muted/60 text-xs mt-1">Your administrator will post updates here as work is completed.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item, idx) => {
              const config = typeConfig[item.type] ?? typeConfig.backlink
              const impact = impactConfig[item.impact] ?? impactConfig.medium
              const isLast = idx === items.length - 1
              return (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 ${config.color}`}>
                      {config.icon}
                    </div>
                    {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-foreground font-semibold text-sm">{item.title}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>{config.label}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${impact.className}`}>{impact.label} Impact</span>
                      </div>
                      <span className="text-muted text-xs flex-shrink-0">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

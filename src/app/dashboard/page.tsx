export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import TrafficChart from '@/components/charts/TrafficChart'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { trafficChartData } from '@/lib/mockData'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, keyword, position, prev_position, volume, difficulty')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  const { data: activityCount } = await supabase
    .from('activity_feed')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const kws = keywords ?? []
  const top5 = kws.slice(0, 5)
  const totalKeywords = kws.length
  const top3 = kws.filter((k) => k.position != null && k.position <= 3).length
  const top10 = kws.filter((k) => k.position != null && k.position <= 10).length
  const top30 = kws.filter((k) => k.position != null && k.position <= 30).length
  const avgPosition = kws.length
    ? Math.round(kws.reduce((s, k) => s + (k.position ?? 0), 0) / kws.length)
    : 0

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back — here's your SEO overview"
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' }}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Keywords Tracked"
          value={totalKeywords.toString()}
          changeLabel="assigned keywords"
          color="primary"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 15l6.5-6.5M22 8v6h-6M9 15H3v-6h6M3 9l6.5 6.5"/>
            </svg>
          }
        />
        <StatCard
          title="Top 10 Keywords"
          value={top10.toString()}
          changeLabel="in top 10 positions"
          color="accent"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          }
        />
        <StatCard
          title="Avg Position"
          value={avgPosition ? `#${avgPosition}` : '—'}
          changeLabel="average ranking"
          color="green"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          }
        />
        <StatCard
          title="SEO Updates"
          value={(activityCount as unknown as { count: number } | null)?.count?.toString() ?? '0'}
          changeLabel="total updates"
          color="purple"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2">
          <Card title="Traffic Overview" subtitle="Clicks & impressions — last 30 days">
            <TrafficChart data={trafficChartData} />
          </Card>
        </div>

        <Card title="Performance" subtitle="Keyword distribution">
          <div className="space-y-4">
            {[
              { label: 'Keywords in Top 3', value: top3.toString(), bar: totalKeywords ? top3 / totalKeywords : 0 },
              { label: 'Keywords in Top 10', value: top10.toString(), bar: totalKeywords ? top10 / totalKeywords : 0 },
              { label: 'Keywords in Top 30', value: top30.toString(), bar: totalKeywords ? top30 / totalKeywords : 0 },
              { label: 'Total Keywords', value: totalKeywords.toString(), bar: 1 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-foreground font-semibold">{item.value}</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.bar * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Keywords Table */}
      <Card title="Top Keywords" subtitle="Your best performing keywords">
        {top5.length === 0 ? (
          <p className="text-muted text-sm py-4">No keywords assigned yet. Contact your administrator.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted font-medium pb-3 pr-4">Keyword</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Position</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Change</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Volume</th>
                  <th className="text-right text-muted font-medium pb-3 pl-4">Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {top5.map((row) => {
                  const change = row.prev_position != null && row.position != null
                    ? row.prev_position - row.position : 0
                  return (
                    <tr key={row.id} className="hover:bg-black/3 transition-colors">
                      <td className="py-3 pr-4 text-foreground font-medium">{row.keyword}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-foreground font-semibold">{row.position != null ? `#${row.position}` : '—'}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {change > 0 && <span className="text-emerald-600 font-medium">↑{change}</span>}
                        {change < 0 && <span className="text-red-600 font-medium">↓{Math.abs(change)}</span>}
                        {change === 0 && <span className="text-muted">—</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-muted">{row.volume?.toLocaleString() ?? '—'}</td>
                      <td className="py-3 pl-4 text-right">
                        {row.difficulty != null ? (
                          <span className={row.difficulty < 45 ? 'text-emerald-600' : row.difficulty < 60 ? 'text-amber-600' : 'text-red-600'}>
                            {row.difficulty}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

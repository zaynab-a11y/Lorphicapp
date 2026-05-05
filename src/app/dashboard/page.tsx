export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import TrafficChart from '@/components/charts/TrafficChart'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchGscSummaryAndChart } from '@/lib/google/gscFetch'

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

  const { data: tokenRow } = await service
    .from('gsc_tokens')
    .select('access_token, gsc_site_url')
    .eq('user_id', user.id)
    .single()

  const isConnected = !!tokenRow?.access_token && !!tokenRow?.gsc_site_url
  const gsc = isConnected
    ? await fetchGscSummaryAndChart(user.id, tokenRow!.gsc_site_url!)
    : null

  const { data: activityCount } = await service
    .from('activity_feed')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const activityTotal = (activityCount as unknown as { count: number } | null)?.count ?? 0

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back — here's your SEO overview"
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Clicks"
          value={gsc ? gsc.summary.clicks.toLocaleString() : '—'}
          changeLabel="last 30 days"
          color="primary"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          }
        />
        <StatCard
          title="Impressions"
          value={gsc ? gsc.summary.impressions.toLocaleString() : '—'}
          changeLabel="last 30 days"
          color="accent"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        />
        <StatCard
          title="Avg Position"
          value={gsc ? `#${gsc.summary.avgPosition}` : '—'}
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
          title="CTR"
          value={gsc ? `${gsc.summary.ctr}%` : '—'}
          changeLabel="click-through rate"
          color="purple"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 15l6.5-6.5M22 8v6h-6M9 15H3v-6h6M3 9l6.5 6.5"/>
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2">
          <Card title="Traffic Overview" subtitle="Clicks & impressions — last 30 days">
            {isConnected && gsc && gsc.chart.length > 0 ? (
              <TrafficChart data={gsc.chart} />
            ) : (
              <div className="h-[280px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted text-sm">
                    {isConnected ? 'No data available for this period.' : 'Connect Google Search Console to see traffic data.'}
                  </p>
                  {!isConnected && (
                    <a href="/gsc" className="text-primary text-sm underline mt-1 inline-block">Go to GSC tab →</a>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card title="Performance" subtitle="Last 30 days">
          <div className="space-y-4">
            {[
              { label: 'Total Clicks', value: gsc?.summary.clicks.toLocaleString() ?? '—' },
              { label: 'Impressions', value: gsc?.summary.impressions.toLocaleString() ?? '—' },
              { label: 'Avg CTR', value: gsc ? `${gsc.summary.ctr}%` : '—' },
              { label: 'Avg Position', value: gsc ? `#${gsc.summary.avgPosition}` : '—' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted">{item.label}</span>
                <span className="text-foreground font-semibold">{item.value}</span>
              </div>
            ))}
            {activityTotal > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-muted">SEO Updates</span>
                <span className="text-foreground font-semibold">{activityTotal}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {!isConnected && (
        <Card title="Google Search Console" subtitle="Not connected">
          <div className="py-8 text-center">
            <p className="text-muted text-sm mb-3">Connect your Google Search Console account to see real traffic, rankings, and performance data.</p>
            <a href="/gsc" className="inline-block bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
              Connect GSC
            </a>
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}

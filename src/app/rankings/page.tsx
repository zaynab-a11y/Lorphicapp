export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { fetchGscQueries } from '@/lib/google/gscFetch'

export default async function RankingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const { data: tokenRow } = await service
    .from('gsc_tokens')
    .select('access_token, gsc_site_url')
    .eq('user_id', user.id)
    .single()

  const isConnected = !!tokenRow?.access_token && !!tokenRow?.gsc_site_url
  const queries = isConnected
    ? await fetchGscQueries(user.id, tokenRow!.gsc_site_url!)
    : null

  const rows = queries ?? []
  const top3 = rows.filter((r) => r.position <= 3).length
  const top10 = rows.filter((r) => r.position <= 10).length
  const top30 = rows.filter((r) => r.position <= 30).length

  return (
    <DashboardLayout
      title="Rankings"
      subtitle="Keyword positions from Google Search Console"
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' }}
    >
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-emerald-600 text-xl font-bold">{top3}</span>
            <span className="text-emerald-600 text-sm">Top 3</span>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-primary text-xl font-bold">{top10}</span>
            <span className="text-primary text-sm">Top 10</span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-amber-600 text-xl font-bold">{top30}</span>
            <span className="text-amber-600 text-sm">Top 30</span>
          </div>
          <div className="bg-muted/10 border border-border rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-muted text-xl font-bold">{rows.length}</span>
            <span className="text-muted text-sm">Total Queries</span>
          </div>
        </div>
      )}

      <Card
        title="Search Queries"
        subtitle={rows.length > 0 ? `Last 90 days · ${rows.length} queries` : 'From Google Search Console'}
      >
        {!isConnected ? (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">Connect Google Search Console to see keyword rankings.</p>
            <a href="/gsc" className="text-primary text-sm underline mt-1 inline-block">Go to GSC tab →</a>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">No search query data found.</p>
            <p className="text-muted/60 text-xs mt-1">Make sure your GSC property has data for the last 90 days.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted font-medium pb-3 pr-4">#</th>
                  <th className="text-left text-muted font-medium pb-3 pr-4">Query</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Position</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Clicks</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Impressions</th>
                  <th className="text-right text-muted font-medium pb-3 pl-4">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-black/3 transition-colors">
                    <td className="py-3.5 pr-4 text-muted text-xs">{idx + 1}</td>
                    <td className="py-3.5 pr-4 text-foreground font-medium">{row.query}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-bold ${
                        row.position <= 3 ? 'text-emerald-600' :
                        row.position <= 10 ? 'text-primary' :
                        row.position <= 20 ? 'text-amber-600' : 'text-muted'
                      }`}>
                        #{row.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-foreground font-medium">{row.clicks.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right text-muted">{row.impressions.toLocaleString()}</td>
                    <td className="py-3.5 pl-4 text-right text-muted">{row.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true, nullsFirst: false })

  const kws = keywords ?? []
  const improved = kws.filter((r) => r.prev_position != null && r.position != null && r.prev_position > r.position).length
  const declined = kws.filter((r) => r.prev_position != null && r.position != null && r.prev_position < r.position).length
  const unchanged = kws.filter((r) => r.prev_position === r.position).length

  return (
    <DashboardLayout
      title="Rankings"
      subtitle="Keyword position tracking and changes"
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' }}
    >
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-emerald-600 text-xl font-bold">{improved}</span>
          <span className="text-emerald-600 text-sm">Improved</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-red-600 text-xl font-bold">{declined}</span>
          <span className="text-red-600 text-sm">Declined</span>
        </div>
        <div className="bg-muted/10 border border-border rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-muted text-xl font-bold">{unchanged}</span>
          <span className="text-muted text-sm">Unchanged</span>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-primary text-xl font-bold">{kws.length}</span>
          <span className="text-primary text-sm">Total Keywords</span>
        </div>
      </div>

      <Card title="Keyword Rankings" subtitle={`Updated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}>
        {kws.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">No keywords assigned yet.</p>
            <p className="text-muted/60 text-xs mt-1">Your administrator will assign keywords to track here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted font-medium pb-3 pr-4">#</th>
                  <th className="text-left text-muted font-medium pb-3 pr-4">Keyword</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Position</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Change</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Volume</th>
                  <th className="text-right text-muted font-medium pb-3 px-4">Difficulty</th>
                  <th className="text-left text-muted font-medium pb-3 pl-4">Target URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {kws.map((row, idx) => {
                  const change = row.prev_position != null && row.position != null
                    ? row.prev_position - row.position : 0
                  return (
                    <tr key={row.id} className="hover:bg-black/3 transition-colors">
                      <td className="py-3.5 pr-4 text-muted text-xs">{idx + 1}</td>
                      <td className="py-3.5 pr-4 text-foreground font-medium">{row.keyword}</td>
                      <td className="py-3.5 px-4 text-right">
                        {row.position != null ? (
                          <span className={`font-bold ${
                            row.position <= 3 ? 'text-emerald-600' :
                            row.position <= 10 ? 'text-primary' :
                            row.position <= 20 ? 'text-amber-600' : 'text-muted'
                          }`}>#{row.position}</span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {change > 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">↑{change}</span>
                        ) : change < 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold bg-red-500/10 px-2 py-0.5 rounded-md">↓{Math.abs(change)}</span>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted">{row.volume?.toLocaleString() ?? '—'}</td>
                      <td className="py-3.5 px-4 text-right">
                        {row.difficulty != null ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${row.difficulty < 45 ? 'bg-emerald-500' : row.difficulty < 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${row.difficulty}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${row.difficulty < 45 ? 'text-emerald-600' : row.difficulty < 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {row.difficulty}
                            </span>
                          </div>
                        ) : <span className="text-muted text-right block">—</span>}
                      </td>
                      <td className="py-3.5 pl-4 text-primary text-xs font-mono">{row.target_url ?? '—'}</td>
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

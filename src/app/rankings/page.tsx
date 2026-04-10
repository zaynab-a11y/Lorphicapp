import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import { rankingsData } from '@/lib/mockData'

export default async function RankingsPage() {
  const user = null

  const improved = rankingsData.filter((r) => r.prevPosition > r.position).length
  const declined = rankingsData.filter((r) => r.prevPosition < r.position).length
  const unchanged = rankingsData.filter((r) => r.prevPosition === r.position).length

  return (
    <DashboardLayout
      title="Rankings"
      subtitle="Keyword position tracking and changes"
      user={user}
    >
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-emerald-400 text-xl font-bold">{improved}</span>
          <span className="text-emerald-400 text-sm">Improved</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-red-400 text-xl font-bold">{declined}</span>
          <span className="text-red-400 text-sm">Declined</span>
        </div>
        <div className="bg-muted/10 border border-border rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-muted text-xl font-bold">{unchanged}</span>
          <span className="text-muted text-sm">Unchanged</span>
        </div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-primary text-xl font-bold">{rankingsData.length}</span>
          <span className="text-primary text-sm">Total Keywords</span>
        </div>
      </div>

      <Card title="Keyword Rankings" subtitle={`Updated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}>
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
              {rankingsData.map((row, idx) => {
                const change = row.prevPosition - row.position
                return (
                  <tr key={row.keyword} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 pr-4 text-muted text-xs">{idx + 1}</td>
                    <td className="py-3.5 pr-4">
                      <span className="text-white font-medium">{row.keyword}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-bold ${
                        row.position <= 3 ? 'text-emerald-400' :
                        row.position <= 10 ? 'text-primary' :
                        row.position <= 20 ? 'text-yellow-400' :
                        'text-muted'
                      }`}>
                        #{row.position}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {change > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-md">
                          ↑{change}
                        </span>
                      ) : change < 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-400 font-semibold bg-red-400/10 px-2 py-0.5 rounded-md">
                          ↓{Math.abs(change)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted">{row.volume.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.difficulty < 45 ? 'bg-emerald-400' :
                              row.difficulty < 60 ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`}
                            style={{ width: `${row.difficulty}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          row.difficulty < 45 ? 'text-emerald-400' :
                          row.difficulty < 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {row.difficulty}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pl-4 text-primary text-xs font-mono">{row.url}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  )
}

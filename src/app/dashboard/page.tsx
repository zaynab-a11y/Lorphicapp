import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import TrafficChart from '@/components/charts/TrafficChart'
import { dashboardStats, trafficChartData, rankingsData } from '@/lib/mockData'

export default async function DashboardPage() {
  const user = null

  const stats = dashboardStats
  const top5Rankings = rankingsData.slice(0, 5)

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back — here's your SEO overview"
      user={user}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Clicks"
          value={stats.totalClicks.toLocaleString()}
          change={stats.clicksChange}
          changeLabel="vs last month"
          color="primary"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 15l6.5-6.5M22 8v6h-6M9 15H3v-6h6M3 9l6.5 6.5"/>
            </svg>
          }
        />
        <StatCard
          title="Impressions"
          value={stats.impressions.toLocaleString()}
          change={stats.impressionsChange}
          changeLabel="vs last month"
          color="accent"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        />
        <StatCard
          title="CTR"
          value={`${stats.ctr}%`}
          change={stats.ctrChange}
          changeLabel="vs last month"
          color="green"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          }
        />
        <StatCard
          title="Avg Position"
          value={stats.avgPosition}
          change={stats.positionChange}
          changeLabel="vs last month"
          color="purple"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
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

        {/* Quick Stats */}
        <Card title="Performance" subtitle="Key metrics snapshot">
          <div className="space-y-4">
            {[
              { label: 'Keywords in Top 3', value: '14', bar: 0.42 },
              { label: 'Keywords in Top 10', value: '38', bar: 0.71 },
              { label: 'Keywords in Top 30', value: '61', bar: 0.86 },
              { label: 'Pages Indexed', value: '248', bar: 0.91 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted">{item.label}</span>
                  <span className="text-white font-semibold">{item.value}</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.bar * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Keywords Table */}
      <Card title="Top Keywords" subtitle="Your best performing keywords this month">
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
              {top5Rankings.map((row) => {
                const change = row.prevPosition - row.position
                return (
                  <tr key={row.keyword} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">{row.keyword}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-white font-semibold">#{row.position}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {change > 0 && <span className="text-emerald-400 font-medium">↑{change}</span>}
                      {change < 0 && <span className="text-red-400 font-medium">↓{Math.abs(change)}</span>}
                      {change === 0 && <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right text-muted">{row.volume.toLocaleString()}</td>
                    <td className="py-3 pl-4 text-right">
                      <span
                        className={
                          row.difficulty < 45 ? 'text-emerald-400' :
                          row.difficulty < 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }
                      >
                        {row.difficulty}
                      </span>
                    </td>
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

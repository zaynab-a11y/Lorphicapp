import DashboardLayout from '@/components/layout/DashboardLayout'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import GscChart from '@/components/charts/GscChart'
import { gscData } from '@/lib/mockData'

export default async function GscPage() {
  const user = null

  const { summary, chartData, topQueries } = gscData

  return (
    <DashboardLayout
      title="GSC Updates"
      subtitle="Google Search Console performance data"
      user={user}
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Clicks"
          value={summary.clicks.toLocaleString()}
          color="primary"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 15l6.5-6.5M22 8v6h-6M9 15H3v-6h6M3 9l6.5 6.5"/>
            </svg>
          }
        />
        <StatCard
          title="Impressions"
          value={summary.impressions.toLocaleString()}
          color="accent"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          }
        />
        <StatCard
          title="CTR"
          value={`${summary.ctr}%`}
          color="green"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          }
        />
        <StatCard
          title="Avg Position"
          value={summary.avgPosition}
          color="purple"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          }
        />
      </div>

      {/* Chart */}
      <Card title="Performance Trends" subtitle="Select a metric to explore trends" className="mb-6">
        <GscChart data={chartData} />
      </Card>

      {/* Top Queries Table */}
      <Card title="Top Queries" subtitle="Queries driving the most traffic">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted font-medium pb-3 pr-4">Query</th>
                <th className="text-right text-muted font-medium pb-3 px-4">Clicks</th>
                <th className="text-right text-muted font-medium pb-3 px-4">Impressions</th>
                <th className="text-right text-muted font-medium pb-3 px-4">CTR</th>
                <th className="text-right text-muted font-medium pb-3 pl-4">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topQueries.map((row, idx) => (
                <tr key={row.query} className="hover:bg-white/2 transition-colors group">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="text-muted text-xs w-5 text-right">{idx + 1}</span>
                      <span className="text-white font-medium">{row.query}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-primary font-semibold">{row.clicks.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-muted">{row.impressions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={row.ctr >= 8 ? 'text-emerald-400' : row.ctr >= 5 ? 'text-yellow-400' : 'text-red-400'}>
                      {row.ctr}%
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <span className={
                      row.position <= 3 ? 'text-emerald-400 font-semibold' :
                      row.position <= 10 ? 'text-primary' :
                      'text-muted'
                    }>
                      {row.position.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  )
}

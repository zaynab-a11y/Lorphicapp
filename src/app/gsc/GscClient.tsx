'use client'

import { useState, useEffect } from 'react'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import GscChart from '@/components/charts/GscChart'

interface GscSummary {
  clicks: number
  impressions: number
  ctr: number
  avgPosition: number
}

interface ChartRow {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface QueryRow {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

interface Props {
  isAdmin: boolean
  isConnected: boolean
  gscSiteUrl: string | null
  initialError?: string | null
}

export default function GscClient({ isAdmin, isConnected, gscSiteUrl, initialError }: Props) {
  const [summary, setSummary] = useState<GscSummary | null>(null)
  const [chart, setChart] = useState<ChartRow[]>([])
  const [queries, setQueries] = useState<QueryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(initialError ?? '')
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    if (!isConnected || !gscSiteUrl) return
    setLoading(true)
    fetch(`/api/gsc/data?siteUrl=${encodeURIComponent(gscSiteUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return }
        setSummary(data.summary)
        setChart(data.chart ?? [])
        setQueries(data.queries ?? [])
      })
      .catch(() => setError('Failed to load GSC data'))
      .finally(() => setLoading(false))
  }, [isConnected, gscSiteUrl])

  const handleDisconnect = async () => {
    setDisconnecting(true)
    await fetch('/api/gsc/disconnect', { method: 'POST' })
    window.location.reload()
  }

  // Not connected — show connect button (admin only)
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-white font-semibold text-lg mb-2">Connect Google Search Console</h3>
          <p className="text-muted text-sm max-w-sm">
            {isAdmin
              ? 'Connect your Google account to pull live GSC data for all your clients.'
              : 'Your administrator needs to connect Google Search Console to display your data.'}
          </p>
        </div>
        {isAdmin && (
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-glow"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Connect Google Account
          </a>
        )}
      </div>
    )
  }

  // Connected but no site URL
  if (!gscSiteUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-400">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-white font-semibold text-lg mb-2">No GSC Property Set</h3>
          <p className="text-muted text-sm">
            {isAdmin
              ? 'Go to Admin → Users and set the GSC site URL for this client.'
              : 'Your administrator needs to set your GSC property URL.'}
          </p>
        </div>
      </div>
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading GSC data...
        </div>
      </div>
    )
  }

  // Error
  if (error && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
        {isAdmin && (
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="text-muted text-sm hover:text-white transition-colors">
            Disconnect and reconnect Google
          </button>
        )}
      </div>
    )
  }

  const chartData = chart.map((row) => ({
    date: row.date,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }))

  return (
    <div>
      {isAdmin && (
        <div className="flex items-center justify-between mb-6 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Google Search Console connected · {gscSiteUrl}
          </div>
          <button onClick={handleDisconnect} disabled={disconnecting}
            className="text-muted text-xs hover:text-red-400 transition-colors">
            {disconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Clicks" value={(summary?.clicks ?? 0).toLocaleString()} color="primary"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 15l6.5-6.5M22 8v6h-6M9 15H3v-6h6M3 9l6.5 6.5"/></svg>} />
        <StatCard title="Impressions" value={(summary?.impressions ?? 0).toLocaleString()} color="accent"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>} />
        <StatCard title="CTR" value={`${summary?.ctr ?? 0}%`} color="green"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>} />
        <StatCard title="Avg Position" value={summary?.avgPosition?.toString() ?? '—'} color="purple"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>} />
      </div>

      {chartData.length > 0 && (
        <Card title="Performance Trends" subtitle="Last 28 days" className="mb-6">
          <GscChart data={chartData} />
        </Card>
      )}

      {queries.length > 0 && (
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
                {queries.map((row, idx) => (
                  <tr key={row.query} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-muted text-xs w-5 text-right">{idx + 1}</span>
                        <span className="text-white font-medium">{row.query}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-primary font-semibold">{row.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-muted">{row.impressions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={row.ctr >= 8 ? 'text-emerald-400' : row.ctr >= 5 ? 'text-yellow-400' : 'text-red-400'}>{row.ctr}%</span>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span className={row.position <= 3 ? 'text-emerald-400 font-semibold' : row.position <= 10 ? 'text-primary' : 'text-muted'}>
                        {row.position.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

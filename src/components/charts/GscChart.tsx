'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useState } from 'react'
import clsx from 'clsx'

type Metric = 'clicks' | 'impressions' | 'ctr' | 'position'

interface DataPoint {
  date: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

const metricConfig: Record<Metric, { label: string; color: string; formatter: (v: number) => string }> = {
  clicks: { label: 'Clicks', color: '#14B8A6', formatter: (v) => v.toLocaleString() },
  impressions: { label: 'Impressions', color: '#F97316', formatter: (v) => v.toLocaleString() },
  ctr: { label: 'CTR', color: '#8B5CF6', formatter: (v) => `${v.toFixed(1)}%` },
  position: { label: 'Avg Position', color: '#EC4899', formatter: (v) => v.toFixed(1) },
}

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (active && payload && payload.length) {
    const config = metricConfig[metric as Metric]
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-card text-sm">
        <p className="text-white font-semibold mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: config.color }} />
          <span className="text-muted">{config.label}:</span>
          <span className="text-white font-medium">{config.formatter(payload[0].value)}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function GscChart({ data }: { data: DataPoint[] }) {
  const [activeMetric, setActiveMetric] = useState<Metric>('clicks')
  const config = metricConfig[activeMetric]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(metricConfig) as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setActiveMetric(m)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              activeMetric === m
                ? 'text-white'
                : 'text-muted hover:text-white bg-transparent hover:bg-white/5'
            )}
            style={activeMetric === m ? { background: metricConfig[m].color + '20', color: metricConfig[m].color, boxShadow: `0 0 0 1px ${metricConfig[m].color}40` } : {}}
          >
            {metricConfig[m].label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => {
              if (activeMetric === 'ctr') return `${v}%`
              if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
              return v
            }}
          />
          <Tooltip content={<CustomTooltip metric={activeMetric} />} />
          <Line
            type="monotone"
            dataKey={activeMetric}
            stroke={config.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: config.color, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

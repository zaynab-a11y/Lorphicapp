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

interface DataPoint {
  date: string
  clicks: number
  impressions: number
}

interface TrafficChartProps {
  data: DataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-card text-sm">
        <p className="text-foreground font-semibold mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted capitalize">{entry.dataKey}:</span>
            <span className="text-foreground font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function TrafficChart({ data }: TrafficChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#CCFBF1" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748B', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#64748B', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '16px' }}
          formatter={(value) => (
            <span style={{ color: '#64748B', fontSize: 12 }}>{value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="#0D9488"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#0D9488', strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="impressions"
          stroke="#F97316"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#F97316', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

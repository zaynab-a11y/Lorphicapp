'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface Props {
  reportId: string
  label?: string
  variant?: 'primary' | 'secondary'
  colorClass?: string
}

export default function ReportDownloadButton({ reportId, label = 'Download', variant = 'primary', colorClass }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports/generate?type=${reportId}`)
      if (!response.ok) throw new Error('Failed to generate report')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lorphic-${reportId}-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-primary/30 disabled:opacity-60"
      >
        {loading ? (
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        )}
        {loading ? 'Generating...' : label}
      </button>
    )
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={clsx(
        'w-full py-2.5 px-4 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60',
        colorClass || 'bg-primary hover:bg-primary/90'
      )}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )}
      {loading ? 'Generating PDF...' : label}
    </button>
  )
}

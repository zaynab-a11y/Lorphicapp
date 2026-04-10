import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import ReportDownloadButton from './ReportDownloadButton'

const reportTypes = [
  {
    id: 'full',
    title: 'Full SEO Report',
    description: 'Comprehensive report including rankings, traffic, backlinks, and recommendations.',
    pages: '12–15 pages',
    color: 'primary',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    id: 'rankings',
    title: 'Rankings Report',
    description: 'Keyword positions, changes, and competitor benchmarks for the reporting period.',
    pages: '4–6 pages',
    color: 'accent',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: 'traffic',
    title: 'Traffic Report',
    description: 'Organic traffic trends, top pages, click-through rates, and search impressions.',
    pages: '5–7 pages',
    color: 'green',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
]

const colorMap: Record<string, { icon: string; bg: string; border: string; btn: string }> = {
  primary: { icon: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', btn: 'bg-primary hover:bg-primary/90' },
  accent: { icon: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', btn: 'bg-accent hover:bg-accent/90' },
  green: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', btn: 'bg-emerald-500 hover:bg-emerald-500/90' },
}

export default async function ReportsPage() {
  const user = null

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Generate and download SEO performance reports"
      user={user}
    >
      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {reportTypes.map((report) => {
          const colors = colorMap[report.color]
          return (
            <div key={report.id} className={`bg-card border ${colors.border} rounded-2xl p-6 flex flex-col gap-4 shadow-card`}>
              <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.icon}`}>
                {report.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-base mb-1">{report.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{report.description}</p>
                <p className="text-muted/60 text-xs mt-2">{report.pages} • PDF format</p>
              </div>
              <ReportDownloadButton reportId={report.id} label={`Download ${report.title}`} colorClass={colors.btn} />
            </div>
          )
        })}
      </div>

      {/* Recent Reports */}
      <Card title="Recent Reports" subtitle="Previously generated reports">
        <div className="space-y-3">
          {[
            { name: 'Full SEO Report — March 2024', date: 'Apr 1, 2024', size: '2.4 MB', type: 'full' },
            { name: 'Rankings Report — March 2024', date: 'Apr 1, 2024', size: '1.1 MB', type: 'rankings' },
            { name: 'Traffic Report — February 2024', date: 'Mar 1, 2024', size: '1.8 MB', type: 'traffic' },
            { name: 'Full SEO Report — February 2024', date: 'Mar 1, 2024', size: '2.3 MB', type: 'full' },
          ].map((report, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{report.name}</p>
                  <p className="text-muted text-xs">{report.date} · {report.size}</p>
                </div>
              </div>
              <ReportDownloadButton reportId={report.type} label="Download" variant="secondary" />
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}

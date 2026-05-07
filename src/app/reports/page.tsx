export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import ReportDownloadButton from './ReportDownloadButton'
import { prisma } from '@/lib/prisma'

const colorMap: Record<string, { icon: string; bg: string; border: string; btn: string }> = {
  full: { icon: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', btn: 'bg-primary hover:bg-primary/90' },
  rankings: { icon: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', btn: 'bg-accent hover:bg-accent/90' },
  traffic: { icon: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-700' },
}

const reportMeta: Record<string, { title: string; description: string; pages: string; icon: React.ReactNode }> = {
  full: {
    title: 'Full SEO Report',
    description: 'Comprehensive report including rankings, traffic, backlinks, and recommendations.',
    pages: '12–15 pages',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  rankings: {
    title: 'Rankings Report',
    description: 'Keyword positions, changes, and competitor benchmarks for the reporting period.',
    pages: '4–6 pages',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  traffic: {
    title: 'Traffic Report',
    description: 'Organic traffic trends, top pages, click-through rates, and search impressions.',
    pages: '5–7 pages',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
}

export default async function ReportsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/login')

  const reportList = await prisma.report.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const availableTypes = Array.from(new Set(reportList.map((r) => r.type)))

  return (
    <DashboardLayout
      title="Reports"
      subtitle="Download your SEO performance reports"
      user={{ email: user.email, name: user.name, role: user.role, visibleTabs: user.visibleTabs as string[] | null }}
    >
      {availableTypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {availableTypes.map((type) => {
            const meta = reportMeta[type]
            const colors = colorMap[type]
            if (!meta || !colors) return null
            return (
              <div key={type} className={`bg-card border ${colors.border} rounded-2xl p-6 flex flex-col gap-4 shadow-card`}>
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.icon}`}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold text-base mb-1">{meta.title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{meta.description}</p>
                  <p className="text-muted/60 text-xs mt-2">{meta.pages} · PDF format</p>
                </div>
                <ReportDownloadButton reportId={type} label={`Download ${meta.title}`} colorClass={colors.btn} />
              </div>
            )
          })}
        </div>
      )}

      <Card title="Your Reports" subtitle={reportList.length > 0 ? `${reportList.length} reports available` : 'No reports yet'}>
        {reportList.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted text-sm">No reports available yet.</p>
            <p className="text-muted/60 text-xs mt-1">Your administrator will create reports for you here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportList.map((report) => {
              const colors = colorMap[report.type] ?? colorMap.full
              return (
                <div key={report.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${colors.bg} rounded-xl flex items-center justify-center ${colors.icon}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-foreground text-sm font-medium">{report.title}</p>
                      <p className="text-muted text-xs">
                        {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · PDF format
                      </p>
                    </div>
                  </div>
                  <ReportDownloadButton reportId={report.type} label="Download" variant="secondary" />
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

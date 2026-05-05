export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import BacklinksUpload from './BacklinksUpload'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function fileIcon(type: string) {
  const colors: Record<string, string> = { pdf: 'text-red-600 bg-red-500/10', xlsx: 'text-emerald-600 bg-emerald-500/10', xls: 'text-emerald-600 bg-emerald-500/10', csv: 'text-blue-600 bg-blue-500/10', doc: 'text-blue-700 bg-blue-500/10', docx: 'text-blue-700 bg-blue-500/10' }
  return colors[type] ?? 'text-muted bg-muted/10'
}

export default async function BacklinksPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const [{ data: profile }, { data: clientUsers }, { data: myFiles }] = await Promise.all([
    service.from('profiles').select('name, email, role').eq('id', user.id).single(),
    service.from('profiles').select('id, name, email').eq('role', 'client').order('name'),
    service.from('backlink_files').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const isAdmin = profile?.role === 'admin'
  const items = myFiles ?? []

  return (
    <DashboardLayout
      title="Backlinks"
      subtitle={isAdmin ? 'Upload and manage client backlink reports' : 'Your backlink reports'}
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' }}
    >
      {isAdmin ? (
        <BacklinksUpload users={clientUsers ?? []} />
      ) : (
        <>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-accent text-xl font-bold">{items.length}</span>
                <span className="text-accent text-sm">Reports</span>
              </div>
            </div>
          )}

          <Card title="Backlink Reports" subtitle={items.length > 0 ? `${items.length} reports from your SEO manager` : 'No reports yet'}>
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <p className="text-muted text-sm">No backlink reports yet.</p>
                <p className="text-muted/60 text-xs mt-1">Your SEO manager will upload backlink reports here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((f) => {
                  const colorClass = fileIcon(f.file_type ?? '')
                  return (
                    <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-accent/40 transition-colors group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-medium truncate group-hover:text-accent transition-colors">{f.title}</p>
                        <p className="text-muted text-xs">
                          {(f.file_type ?? '').toUpperCase()} · {f.file_size ? `${(f.file_size / 1024).toFixed(0)} KB · ` : ''}{new Date(f.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <svg className="text-muted group-hover:text-accent transition-colors flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </a>
                  )
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import RankingsUpload from './RankingsUpload'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function RankingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('name, email, role, visible_tabs')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Admin: fetch all client users for the upload dropdown
  const { data: clientUsers } = isAdmin
    ? await service.from('profiles').select('id, name, email').eq('role', 'client').order('name')
    : { data: null }

  // Non-admin: fetch their own screenshots
  const { data: screenshots } = isAdmin
    ? { data: null }
    : await service
        .from('ranking_screenshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

  const items = screenshots ?? []

  return (
    <DashboardLayout
      title="Rankings"
      subtitle={isAdmin ? 'Upload and manage client ranking screenshots' : 'Your Google ranking screenshots'}
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '', role: profile?.role ?? '', visibleTabs: profile?.visible_tabs ?? null }}
    >
      {isAdmin ? (
        <RankingsUpload users={clientUsers ?? []} />
      ) : (
        <>
          {items.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-primary text-xl font-bold">{items.length}</span>
                <span className="text-primary text-sm">Screenshots</span>
              </div>
              <div className="bg-muted/10 border border-border rounded-xl px-4 py-3">
                <span className="text-muted text-sm">
                  Last updated {new Date(items[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}

          <Card
            title="Ranking Screenshots"
            subtitle={items.length > 0 ? `${items.length} screenshots from your SEO manager` : 'No screenshots yet'}
          >
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-muted/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p className="text-muted text-sm">No ranking screenshots yet.</p>
                <p className="text-muted/60 text-xs mt-1">Your SEO manager will upload screenshots of your Google rankings here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-background border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors group block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.file_url}
                      alt={item.title ?? 'Ranking screenshot'}
                      className="w-full h-48 object-cover object-top group-hover:opacity-95 transition-opacity"
                    />
                    <div className="p-3">
                      <p className="text-foreground text-sm font-medium truncate">{item.title ?? 'Ranking Screenshot'}</p>
                      <p className="text-muted text-xs mt-0.5">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardLayout>
  )
}

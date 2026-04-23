import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import GscClient from './GscClient'

export default async function GscPage({ searchParams }: { searchParams: { connected?: string; error?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, role, gsc_site_url')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const service = createServiceClient()
  const { data: tokenRow } = await service.from('gsc_tokens').select('access_token').eq('id', 1).single()
  const isConnected = !!tokenRow?.access_token

  const initialError = searchParams.error
    ? searchParams.error === 'google_auth_failed' ? 'Google authentication failed. Please try again.' : 'Something went wrong.'
    : null

  return (
    <DashboardLayout
      title="GSC Updates"
      subtitle="Google Search Console performance data"
      user={{ email: profile?.email ?? user.email ?? '', name: profile?.name ?? '' }}
    >
      <GscClient
        isAdmin={isAdmin}
        isConnected={isConnected}
        gscSiteUrl={profile?.gsc_site_url ?? null}
        initialError={initialError}
      />
    </DashboardLayout>
  )
}

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import GscClient from './GscClient'

export const dynamic = 'force-dynamic'

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

  const errorMessages: Record<string, string> = {
    google_auth_failed: 'Google authentication failed. Please try again.',
    token_exchange_failed: 'Failed to exchange Google auth code for tokens. Check your GOOGLE_CLIENT_SECRET.',
    token_save_failed: 'Connected to Google but failed to save tokens. The gsc_tokens table may not exist in Supabase — run the setup SQL.',
  }
  const initialError = searchParams.error ? (errorMessages[searchParams.error] ?? 'Something went wrong.') : null

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

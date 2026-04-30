export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import GscClient from './GscClient'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied:         'Google sign-in was cancelled.',
  invalid_state:         'Security check failed. Please try connecting again.',
  token_exchange_failed: 'Failed to exchange auth code — check GOOGLE_CLIENT_SECRET in Vercel.',
  no_access_token:       'Google did not return an access token. Try again.',
  no_refresh_token:      'No refresh token received. Revoke app access at myaccount.google.com/permissions then reconnect.',
  db_save_failed:        'Tokens received but failed to save. Check the gsc_tokens table exists in Supabase.',
}

export default async function GscPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Use service client to bypass RLS on profiles
  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  const { data: tokenRow } = await service
    .from('gsc_tokens')
    .select('access_token, gsc_site_url')
    .eq('user_id', user.id)
    .single()

  const isConnected = !!tokenRow?.access_token
  const gscSiteUrl = tokenRow?.gsc_site_url ?? null

  const initialError = searchParams.error
    ? (ERROR_MESSAGES[searchParams.error] ?? `Unexpected error: ${searchParams.error}`)
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
        gscSiteUrl={gscSiteUrl}
        initialError={initialError}
      />
    </DashboardLayout>
  )
}

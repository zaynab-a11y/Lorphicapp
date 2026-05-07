export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GscClient from './GscClient'
import { prisma } from '@/lib/prisma'

const ERROR_MESSAGES: Record<string, string> = {
  access_denied:         'Google sign-in was cancelled.',
  invalid_state:         'Security check failed. Please try connecting again.',
  token_exchange_failed: 'Failed to exchange auth code — check GOOGLE_CLIENT_SECRET.',
  no_access_token:       'Google did not return an access token. Try again.',
  no_refresh_token:      'No refresh token received. Revoke app access at myaccount.google.com/permissions then reconnect.',
  db_save_failed:        'Tokens received but failed to save.',
}

export default async function GscPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/login')

  const tokenRow = await prisma.gscToken.findUnique({ where: { userId: user.id } })

  const isConnected = !!tokenRow?.accessToken
  const gscSiteUrl = tokenRow?.gscSiteUrl ?? null
  const isAdmin = user.role === 'admin'

  const initialError = searchParams.error
    ? (ERROR_MESSAGES[searchParams.error] ?? `Unexpected error: ${searchParams.error}`)
    : null

  return (
    <DashboardLayout
      title="GSC Updates"
      subtitle="Google Search Console performance data"
      user={{ email: user.email, name: user.name, role: user.role, visibleTabs: user.visibleTabs as string[] | null }}
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

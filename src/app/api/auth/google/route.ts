import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOAuthClient, GSC_SCOPES } from '@/lib/google/oauth'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Generate random state token to prevent CSRF
  const state = randomBytes(32).toString('hex')

  const oauth2 = createOAuthClient()
  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: GSC_SCOPES,
    prompt: 'consent',         // force consent screen so we always get refresh_token
    state,
    include_granted_scopes: true,
  })

  // Store state in a short-lived cookie (10 min)
  const response = NextResponse.redirect(authUrl)
  response.cookies.set('gsc_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}

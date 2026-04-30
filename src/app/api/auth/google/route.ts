import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GSC_SCOPES } from '@/lib/google/oauth'
import { google } from 'googleapis'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/auth/google/callback`

  const state = randomBytes(32).toString('hex')

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri,
  )

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: GSC_SCOPES,
    prompt: 'consent',
    state,
    include_granted_scopes: true,
  })

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('gsc_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  // Store redirect URI so callback uses identical value
  response.cookies.set('gsc_redirect_uri', redirectUri, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}

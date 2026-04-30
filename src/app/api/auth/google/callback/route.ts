import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { GSC_SCOPES } from '@/lib/google/oauth'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  const APP_URL = origin

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError || !code) {
    return NextResponse.redirect(`${APP_URL}/gsc?error=access_denied`)
  }

  const storedState = request.cookies.get('gsc_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${APP_URL}/gsc?error=invalid_state`)
  }

  // Use the same redirect URI stored when the auth flow started
  const redirectUri =
    request.cookies.get('gsc_redirect_uri')?.value ??
    `${origin}/api/auth/google/callback`

  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.redirect(`${APP_URL}/login`)
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri,
  )
  let tokens
  try {
    const { tokens: t } = await oauth2.getToken(code)
    tokens = t
  } catch (err) {
    console.error('[GSC callback] token exchange failed:', err)
    return NextResponse.redirect(`${APP_URL}/gsc?error=token_exchange_failed`)
  }

  if (!tokens.access_token) {
    return NextResponse.redirect(`${APP_URL}/gsc?error=no_access_token`)
  }

  // Google only returns refresh_token on first consent.
  // If missing, keep the one already stored (user re-authenticated).
  let refreshToken = tokens.refresh_token ?? null
  if (!refreshToken) {
    const service = createServiceClient()
    const { data: existing } = await service
      .from('gsc_tokens')
      .select('refresh_token')
      .eq('user_id', user.id)
      .single()
    refreshToken = existing?.refresh_token ?? null
  }

  if (!refreshToken) {
    // No refresh token anywhere — we can't refresh later. Force re-consent.
    return NextResponse.redirect(`${APP_URL}/gsc?error=no_refresh_token`)
  }

  // Save tokens to Supabase (service role bypasses RLS)
  const service = createServiceClient()
  const { error: upsertError } = await service.from('gsc_tokens').upsert(
    {
      user_id: user.id,
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (upsertError) {
    console.error('[GSC callback] DB upsert failed:', upsertError.message)
    return NextResponse.redirect(`${APP_URL}/gsc?error=db_save_failed`)
  }

  const response = NextResponse.redirect(`${APP_URL}/gsc?connected=true`)
  response.cookies.delete('gsc_oauth_state')
  response.cookies.delete('gsc_redirect_uri')
  return response
}

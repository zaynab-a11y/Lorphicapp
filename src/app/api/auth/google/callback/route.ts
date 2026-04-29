import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/gsc?error=google_auth_failed`)
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${appUrl}/login`)

  const redirectUri = `${appUrl}/api/auth/google/callback`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokens.access_token) {
    return NextResponse.redirect(`${appUrl}/gsc?error=token_exchange_failed`)
  }

  const service = createServiceClient()
  const { error: upsertError } = await service.from('gsc_tokens').upsert({
    id: 1,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token ?? null,
    expiry_date: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null,
    updated_at: new Date().toISOString(),
  })

  if (upsertError) {
    console.error('Failed to save GSC tokens:', upsertError.message)
    return NextResponse.redirect(`${appUrl}/gsc?error=token_save_failed`)
  }

  return NextResponse.redirect(`${appUrl}/gsc?connected=true`)
}

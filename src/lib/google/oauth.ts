import { google } from 'googleapis'
import { createServiceClient } from '@/lib/supabase/server'

export const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

export const GSC_SCOPES = [
  'https://www.googleapis.com/auth/webmasters.readonly',
  'openid',
  'email',
]

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    REDIRECT_URI,
  )
}

export interface TokenRow {
  id: string
  user_id: string
  access_token: string
  refresh_token: string | null
  expires_at: string
  gsc_site_url: string | null
}

/**
 * Returns a valid access token for the given user.
 * Automatically refreshes if the stored token is expired or close to expiry.
 * Returns null if no token is stored or refresh fails.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const service = createServiceClient()

  const { data: row, error } = await service
    .from('gsc_tokens')
    .select('*')
    .eq('user_id', userId)
    .single<TokenRow>()

  if (error || !row) return null

  const expiresAt = new Date(row.expires_at).getTime()
  const bufferMs = 5 * 60 * 1000 // refresh 5 min before actual expiry

  if (Date.now() < expiresAt - bufferMs) {
    return row.access_token
  }

  if (!row.refresh_token) return null

  const oauth2 = createOAuthClient()
  oauth2.setCredentials({ refresh_token: row.refresh_token })

  try {
    const { credentials } = await oauth2.refreshAccessToken()

    if (!credentials.access_token || !credentials.expiry_date) return null

    await service
      .from('gsc_tokens')
      .update({
        access_token: credentials.access_token,
        expires_at: new Date(credentials.expiry_date).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    return credentials.access_token
  } catch {
    return null
  }
}

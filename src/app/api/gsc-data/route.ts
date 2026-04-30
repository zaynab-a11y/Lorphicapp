import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getValidAccessToken, createOAuthClient } from '@/lib/google/oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // 1. Authenticate the app user
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Get siteUrl from query param or fall back to DB value
  const { data: tokenRow } = await createServiceClient()
    .from('gsc_tokens')
    .select('gsc_site_url')
    .eq('user_id', user.id)
    .single()

  const siteUrl =
    request.nextUrl.searchParams.get('siteUrl') ??
    tokenRow?.gsc_site_url ??
    null

  if (!siteUrl) {
    return NextResponse.json(
      { error: 'No GSC property URL provided. Pass ?siteUrl= or save it to gsc_tokens.gsc_site_url.' },
      { status: 400 },
    )
  }

  // 3. Get a valid (auto-refreshed) access token
  const accessToken = await getValidAccessToken(user.id)
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google account not connected or token refresh failed. Please reconnect.' },
      { status: 401 },
    )
  }

  // 4. Build an OAuth2 client authenticated with this user's token
  const oauth2 = createOAuthClient()
  oauth2.setCredentials({ access_token: accessToken })
  const searchConsole = google.webmasters({ version: 'v3', auth: oauth2 })

  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  try {
    // 5. Fetch all three datasets in parallel
    const [summaryRes, chartRes, queriesRes] = await Promise.all([
      // Overall totals (no dimensions = aggregated)
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate },
      }),

      // Daily trend (dimension: date)
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['date'],
          rowLimit: 28,
        },
      }),

      // Top queries (dimension: query)
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ['query'],
          rowLimit: 25,
        },
      }),
    ])

    // 6. Shape the summary row
    const s = summaryRes.data.rows?.[0]
    const summary = {
      clicks: s?.clicks ?? 0,
      impressions: s?.impressions ?? 0,
      ctr: s?.ctr != null ? Math.round(s.ctr * 1000) / 10 : 0,
      avgPosition: s?.position != null ? Math.round(s.position * 10) / 10 : 0,
    }

    // 7. Shape the daily chart data
    const chart = (chartRes.data.rows ?? []).map((row) => ({
      date: row.keys![0],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr != null ? Math.round(row.ctr * 1000) / 10 : 0,
      position: row.position != null ? Math.round(row.position * 10) / 10 : 0,
    }))

    // 8. Shape the top queries
    const queries = (queriesRes.data.rows ?? []).map((row) => ({
      query: row.keys![0],
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr != null ? Math.round(row.ctr * 1000) / 10 : 0,
      position: row.position != null ? Math.round(row.position * 10) / 10 : 0,
    }))

    return NextResponse.json({ summary, chart, queries })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown GSC API error'
    console.error('[gsc-data] API error:', message)

    // Map common Google API errors to clear messages
    if (message.includes('403')) {
      return NextResponse.json(
        { error: `Access denied to ${siteUrl}. Make sure the connected Google account is an Owner or Full User of this property in Search Console.` },
        { status: 403 },
      )
    }
    if (message.includes('404')) {
      return NextResponse.json(
        { error: `Property not found: ${siteUrl}. Check the format — domain properties must be sc-domain:example.com` },
        { status: 404 },
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function getValidAccessToken(service: ReturnType<typeof createServiceClient>) {
  const { data: tokenRow } = await service.from('gsc_tokens').select('*').eq('id', 1).single()
  if (!tokenRow) return null

  const isExpired = tokenRow.expires_at && Date.now() > new Date(tokenRow.expires_at).getTime() - 60000

  if (!isExpired) return tokenRow.access_token

  if (!tokenRow.refresh_token) return null

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  const refreshed = await res.json()
  if (!refreshed.access_token) return null

  await service.from('gsc_tokens').update({
    access_token: refreshed.access_token,
    expires_at: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', 1)

  return refreshed.access_token
}

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, gsc_site_url')
    .eq('id', user.id)
    .single()

  const siteUrl = request.nextUrl.searchParams.get('siteUrl') || profile?.gsc_site_url
  if (!siteUrl) return NextResponse.json({ error: 'No GSC site URL configured' }, { status: 400 })

  const service = createServiceClient()
  const accessToken = await getValidAccessToken(service)
  if (!accessToken) return NextResponse.json({ error: 'Google account not connected' }, { status: 401 })

  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [summaryRes, chartRes, queriesRes] = await Promise.all([
    fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    }),
    fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions: ['date'], rowLimit: 28 }),
    }),
    fetch(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: 25 }),
    }),
  ])

  const [summaryData, chartData, queriesData] = await Promise.all([
    summaryRes.json(),
    chartRes.json(),
    queriesRes.json(),
  ])

  if (summaryData.error) {
    return NextResponse.json({ error: summaryData.error.message }, { status: 400 })
  }

  const summary = summaryData.rows?.[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 }

  const chart = (chartData.rows ?? []).map((row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 1000) / 10,
    position: Math.round(row.position * 10) / 10,
  }))

  const queries = (queriesData.rows ?? []).map((row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 1000) / 10,
    position: Math.round(row.position * 10) / 10,
  }))

  return NextResponse.json({
    summary: {
      clicks: summary.clicks ?? 0,
      impressions: summary.impressions ?? 0,
      ctr: Math.round((summary.ctr ?? 0) * 1000) / 10,
      avgPosition: Math.round((summary.position ?? 0) * 10) / 10,
    },
    chart,
    queries,
  })
}

import { google } from 'googleapis'
import { getValidAccessToken } from './oauth'

export interface GscSummary {
  clicks: number
  impressions: number
  ctr: number
  avgPosition: number
}

export interface GscChartPoint {
  date: string
  clicks: number
  impressions: number
}

export interface GscQuery {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

async function buildSearchConsole(userId: string) {
  const token = await getValidAccessToken(userId)
  if (!token) return null
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
  )
  oauth2.setCredentials({ access_token: token })
  return google.webmasters({ version: 'v3', auth: oauth2 })
}

function isoDate(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400_000).toISOString().split('T')[0]
}

export async function fetchGscSummaryAndChart(
  userId: string,
  siteUrl: string,
): Promise<{ summary: GscSummary; chart: GscChartPoint[] } | null> {
  const sc = await buildSearchConsole(userId)
  if (!sc) return null

  const endDate = isoDate(0)
  const startDate = isoDate(30)

  const [summaryRes, chartRes] = await Promise.allSettled([
    sc.searchanalytics.query({ siteUrl, requestBody: { startDate, endDate } }),
    sc.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate, dimensions: ['date'], rowLimit: 30 },
    }),
  ])

  const row = summaryRes.status === 'fulfilled' ? summaryRes.value.data.rows?.[0] : null
  const summary: GscSummary = row
    ? {
        clicks: Math.round(row.clicks ?? 0),
        impressions: Math.round(row.impressions ?? 0),
        ctr: Math.round((row.ctr ?? 0) * 1000) / 10,
        avgPosition: Math.round((row.position ?? 0) * 10) / 10,
      }
    : { clicks: 0, impressions: 0, ctr: 0, avgPosition: 0 }

  const chart: GscChartPoint[] =
    chartRes.status === 'fulfilled'
      ? (chartRes.value.data.rows ?? []).map((r) => ({
          date: new Date(r.keys![0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          clicks: Math.round(r.clicks ?? 0),
          impressions: Math.round(r.impressions ?? 0),
        }))
      : []

  return { summary, chart }
}

export async function fetchGscQueries(
  userId: string,
  siteUrl: string,
): Promise<GscQuery[] | null> {
  const sc = await buildSearchConsole(userId)
  if (!sc) return null

  const endDate = isoDate(0)
  const startDate = isoDate(90)

  try {
    const res = await sc.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 100,
      },
    })
    return (res.data.rows ?? [])
      .map((r) => ({
        query: r.keys![0],
        clicks: Math.round(r.clicks ?? 0),
        impressions: Math.round(r.impressions ?? 0),
        ctr: Math.round((r.ctr ?? 0) * 1000) / 10,
        position: Math.round((r.position ?? 0) * 10) / 10,
      }))
      .sort((a, b) => b.clicks - a.clicks)
  } catch {
    return null
  }
}

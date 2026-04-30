import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { siteUrl } = await request.json()
  if (!siteUrl || typeof siteUrl !== 'string') {
    return NextResponse.json({ error: 'siteUrl is required' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('gsc_tokens')
    .update({ gsc_site_url: siteUrl.trim(), updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

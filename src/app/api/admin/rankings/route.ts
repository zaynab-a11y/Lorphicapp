import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const service = createServiceClient()
  const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return { user, service }
}

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const userId = new URL(request.url).searchParams.get('userId')
  if (!userId) return NextResponse.json({ screenshots: [] })

  const { data } = await ctx.service
    .from('ranking_screenshots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ screenshots: data ?? [] })
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  const { data: row } = await ctx.service
    .from('ranking_screenshots')
    .select('file_path')
    .eq('id', id)
    .single()

  if (row?.file_path) {
    await ctx.service.storage.from('ranking-screenshots').remove([row.file_path])
  }
  await ctx.service.from('ranking_screenshots').delete().eq('id', id)

  return NextResponse.json({ success: true })
}

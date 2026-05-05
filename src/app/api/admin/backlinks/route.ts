import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const userId = new URL(request.url).searchParams.get('userId')
  if (!userId) return NextResponse.json({ files: [] })

  const { data } = await ctx.service
    .from('backlink_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ files: data ?? [] })
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  const { data: row } = await ctx.service
    .from('backlink_files')
    .select('file_path')
    .eq('id', id)
    .single()

  if (row?.file_path) {
    await ctx.service.storage.from('backlink-files').remove([row.file_path])
  }
  await ctx.service.from('backlink_files').delete().eq('id', id)

  return NextResponse.json({ success: true })
}

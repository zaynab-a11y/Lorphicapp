import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await ctx.service
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}

export async function PATCH(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, role, gsc_site_url, visible_tabs } = await request.json()
  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (role) updates.role = role
  if (gsc_site_url !== undefined) updates.gsc_site_url = gsc_site_url
  if (visible_tabs !== undefined) updates.visible_tabs = visible_tabs

  const targetId = id === 'self' ? ctx.userId : id
  const { error } = await ctx.service.from('profiles').update(updates).eq('id', targetId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

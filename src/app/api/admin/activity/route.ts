import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await ctx.service
    .from('activity_feed')
    .select('*, profiles(name, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ activity: data })
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { user_id, type, title, description, impact } = await request.json()
  if (!user_id || !type || !title || !description) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await ctx.service
    .from('activity_feed')
    .insert({ user_id, type, title, description, impact: impact ?? 'medium' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  const { error } = await ctx.service.from('activity_feed').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

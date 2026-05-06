import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await ctx.service
    .from('reports')
    .select('*, profiles(name, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ reports: data })
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { user_id, title, type } = await request.json()
  if (!user_id || !title || !type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await ctx.service
    .from('reports')
    .insert({ user_id, title, type })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ report: data })
}

export async function DELETE(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  const { error } = await ctx.service.from('reports').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

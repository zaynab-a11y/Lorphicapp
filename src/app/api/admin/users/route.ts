import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, profile: null }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return { supabase, user, profile }
}

export async function GET() {
  const { supabase, profile } = await requireAdmin()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data })
}

export async function PATCH(request: NextRequest) {
  const { supabase, user, profile } = await requireAdmin()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, role, gsc_site_url } = await request.json()
  const updates: Record<string, string> = {}
  if (status) updates.status = status
  if (role) updates.role = role
  if (gsc_site_url !== undefined) updates.gsc_site_url = gsc_site_url

  const targetId = id === 'self' ? user!.id : id
  const { error } = await supabase.from('profiles').update(updates).eq('id', targetId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

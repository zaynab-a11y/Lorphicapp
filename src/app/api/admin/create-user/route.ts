import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, password, name, role = 'client' } = await request.json()
  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await ctx.service.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role },
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ user: data.user })
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== 'admin') return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const keywords = await prisma.keyword.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json({ keywords })
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { user_id, keyword, target_url, position, prev_position, volume, difficulty } = await request.json()
  if (!user_id || !keyword) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const kw = await prisma.keyword.create({
    data: { userId: user_id, keyword, targetUrl: target_url, position, prevPosition: prev_position, volume, difficulty },
  })

  return NextResponse.json({ keyword: kw })
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  await prisma.keyword.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

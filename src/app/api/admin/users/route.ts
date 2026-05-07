import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession()
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== 'admin') return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, status: true, gscSiteUrl: true, visibleTabs: true, createdAt: true },
  })

  return NextResponse.json({ users })
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { id, status, role, gsc_site_url, visible_tabs } = body

  const updates: Record<string, unknown> = {}
  if (status) updates.status = status
  if (role) updates.role = role
  if (gsc_site_url !== undefined) updates.gscSiteUrl = gsc_site_url
  if (visible_tabs !== undefined) updates.visibleTabs = visible_tabs

  await prisma.user.update({ where: { id }, data: updates })
  return NextResponse.json({ success: true })
}

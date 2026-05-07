import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, password, name, role = 'client' } = await request.json()
  if (!email || !password || !name) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hashed, name, role },
    select: { id: true, email: true, name: true, role: true },
  })

  return NextResponse.json({ user })
}

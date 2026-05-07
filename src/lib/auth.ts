import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export async function requireSession() {
  const session = await getServerSession()
  if (!session?.user) redirect('/login')
  return session
}

export async function requireAdmin() {
  const session = await getServerSession()
  if (!session?.user) redirect('/login')
  if ((session.user as any).role !== 'admin') redirect('/dashboard')
  return session
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { redirect } from 'next/navigation'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  return session
}

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminPanel from './AdminPanel'
import { prisma } from '@/lib/prisma'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || user.role !== 'admin') redirect('/dashboard')

  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="Manage users and keyword assignments"
      user={{ email: user.email, name: user.name, role: user.role }}
    >
      <AdminPanel />
    </DashboardLayout>
  )
}

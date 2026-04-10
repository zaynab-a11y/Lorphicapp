export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import AdminPanel from './AdminPanel'
import { adminUsers, adminKeywords } from '@/lib/mockData'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="Manage users and keyword assignments"
      user={user}
    >
      <AdminPanel initialUsers={adminUsers} initialKeywords={adminKeywords} />
    </DashboardLayout>
  )
}

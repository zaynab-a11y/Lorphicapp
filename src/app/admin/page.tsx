export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminPanel from './AdminPanel'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('name, email, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="Manage users and keyword assignments"
      user={{ email: profile.email, name: profile.name }}
    >
      <AdminPanel />
    </DashboardLayout>
  )
}

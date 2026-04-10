import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminPanel from './AdminPanel'
import { adminUsers, adminKeywords } from '@/lib/mockData'

export default async function AdminPage() {
  const user = null

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

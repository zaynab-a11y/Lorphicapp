'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ToastProvider } from '@/components/ui/Toast'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  user?: { email?: string; name?: string; role?: string; visibleTabs?: string[] | null } | null
}

export default function DashboardLayout({ children, title, subtitle, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Prevent body scroll when sidebar overlay is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <ToastProvider>
    <div className="flex min-h-dvh bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={user?.role} visibleTabs={user?.visibleTabs} />

      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <TopBar
          title={title}
          subtitle={subtitle}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto overscroll-none">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  )
}

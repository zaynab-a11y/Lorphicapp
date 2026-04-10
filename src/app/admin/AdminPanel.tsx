'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  joinedAt: string
}

interface Keyword {
  id: string
  userId: string
  keyword: string
  targetUrl: string
  assignedAt: string
}

interface Props {
  initialUsers: User[]
  initialKeywords: Keyword[]
}

export default function AdminPanel({ initialUsers, initialKeywords }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords)
  const [activeTab, setActiveTab] = useState<'users' | 'keywords'>('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddKeyword, setShowAddKeyword] = useState(false)

  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'client' })
  const [newKeyword, setNewKeyword] = useState({ userId: '', keyword: '', targetUrl: '' })

  const handleAddUser = () => {
    if (!newUser.email || !newUser.name) return
    const user: User = {
      id: String(Date.now()),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
    }
    setUsers([...users, user])
    setNewUser({ email: '', name: '', role: 'client' })
    setShowAddUser(false)
  }

  const handleAddKeyword = () => {
    if (!newKeyword.userId || !newKeyword.keyword) return
    const kw: Keyword = {
      id: String(Date.now()),
      userId: newKeyword.userId,
      keyword: newKeyword.keyword,
      targetUrl: newKeyword.targetUrl || '/',
      assignedAt: new Date().toISOString().split('T')[0],
    }
    setKeywords([...keywords, kw])
    setNewKeyword({ userId: '', keyword: '', targetUrl: '' })
    setShowAddKeyword(false)
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  const handleDeleteKeyword = (id: string) => {
    setKeywords(keywords.filter((k) => k.id !== id))
  }

  const tabs = [
    { id: 'users', label: 'Users', count: users.length },
    { id: 'keywords', label: 'Keywords', count: keywords.length },
  ] as const

  return (
    <div>
      {/* Admin notice */}
      <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Admin Panel — Only authorized administrators can access this page
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, color: 'text-primary' },
          { label: 'Active Users', value: users.filter((u) => u.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Tracked Keywords', value: keywords.length, color: 'text-accent' },
          { label: 'Admin Users', value: users.filter((u) => u.role === 'admin').length, color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-4 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-primary/15 text-primary'
                : 'text-muted hover:text-white'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-border text-muted'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card
          title="User Management"
          action={
            <Button size="sm" onClick={() => setShowAddUser(!showAddUser)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add User
            </Button>
          }
        >
          {/* Add User Form */}
          {showAddUser && (
            <div className="mb-6 p-4 bg-background border border-primary/20 rounded-xl">
              <h4 className="text-white font-semibold text-sm mb-3">Add New User</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="bg-card border border-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="bg-card border border-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="bg-card border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddUser}>Create User</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddUser(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left text-muted font-medium pb-3 pr-4 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-muted text-xs">{u.email}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.role === 'admin' ? 'warning' : 'info'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={u.status === 'active' ? 'success' : 'default'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted text-xs">{u.joinedAt}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-muted hover:text-red-400 transition-colors p-1"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <Card
          title="Keyword Assignments"
          action={
            <Button size="sm" onClick={() => setShowAddKeyword(!showAddKeyword)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Assign Keyword
            </Button>
          }
        >
          {/* Add Keyword Form */}
          {showAddKeyword && (
            <div className="mb-6 p-4 bg-background border border-primary/20 rounded-xl">
              <h4 className="text-white font-semibold text-sm mb-3">Assign Keyword</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select
                  value={newKeyword.userId}
                  onChange={(e) => setNewKeyword({ ...newKeyword, userId: e.target.value })}
                  className="bg-card border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="">Select user...</option>
                  {users.filter((u) => u.role === 'client').map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Keyword"
                  value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                  className="bg-card border border-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Target URL (e.g. /tools)"
                  value={newKeyword.targetUrl}
                  onChange={(e) => setNewKeyword({ ...newKeyword, targetUrl: e.target.value })}
                  className="bg-card border border-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddKeyword}>Assign</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddKeyword(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Keyword', 'Assigned To', 'Target URL', 'Assigned', ''].map((h) => (
                    <th key={h} className="text-left text-muted font-medium pb-3 pr-4 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keywords.map((kw) => {
                  const assignedUser = users.find((u) => u.id === kw.userId)
                  return (
                    <tr key={kw.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-4 text-white font-medium">{kw.keyword}</td>
                      <td className="py-3 pr-4">
                        {assignedUser ? (
                          <div>
                            <p className="text-white text-sm">{assignedUser.name}</p>
                            <p className="text-muted text-xs">{assignedUser.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted">Unknown</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-primary text-xs font-mono">{kw.targetUrl}</td>
                      <td className="py-3 pr-4 text-muted text-xs">{kw.assignedAt}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteKeyword(kw.id)}
                          className="text-muted hover:text-red-400 transition-colors p-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

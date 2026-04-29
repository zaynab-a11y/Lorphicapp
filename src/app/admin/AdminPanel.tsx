'use client'

import { useState, useEffect, useCallback } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

interface Profile {
  id: string
  email: string
  name: string
  role: string
  status: string
  created_at: string
  gsc_site_url?: string | null
}

interface Keyword {
  id: string
  user_id: string
  keyword: string
  target_url: string
  position: number | null
  prev_position: number | null
  volume: number | null
  difficulty: number | null
  created_at: string
  profiles?: { name: string; email: string }
}

interface ActivityItem {
  id: string
  user_id: string
  type: string
  title: string
  description: string
  impact: string
  created_at: string
  profiles?: { name: string; email: string }
}

interface Report {
  id: string
  user_id: string
  title: string
  type: string
  created_at: string
  profiles?: { name: string; email: string }
}

type Tab = 'users' | 'keywords' | 'activity' | 'reports'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [users, setUsers] = useState<Profile[]>([])
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add forms
  const [showAddUser, setShowAddUser] = useState(false)
  const [showAddKeyword, setShowAddKeyword] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showAddReport, setShowAddReport] = useState(false)

  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'client' })
  const [newKeyword, setNewKeyword] = useState({ user_id: '', keyword: '', target_url: '', position: '', prev_position: '', volume: '', difficulty: '' })
  const [newActivity, setNewActivity] = useState({ user_id: '', type: 'backlink', title: '', description: '', impact: 'medium' })
  const [newReport, setNewReport] = useState({ user_id: '', title: '', type: 'full' })
  const [saving, setSaving] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, kwRes, actRes, repRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/keywords'),
        fetch('/api/admin/activity'),
        fetch('/api/admin/reports'),
      ])
      const [u, k, a, r] = await Promise.all([usersRes.json(), kwRes.json(), actRes.json(), repRes.json()])
      setUsers(u.users ?? [])
      setKeywords(k.keywords ?? [])
      setActivity(a.activity ?? [])
      setReports(r.reports ?? [])
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const clients = users.filter((u) => u.role === 'client')

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) return
    setSaving(true)
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    setNewUser({ email: '', name: '', password: '', role: 'client' })
    setShowAddUser(false)
    setSaving(false)
    fetchAll()
  }

  const handleDeleteUser = async (id: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'inactive' }),
    })
    fetchAll()
  }

  const handleAddKeyword = async () => {
    if (!newKeyword.user_id || !newKeyword.keyword) return
    setSaving(true)
    const res = await fetch('/api/admin/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newKeyword,
        position: newKeyword.position ? Number(newKeyword.position) : null,
        prev_position: newKeyword.prev_position ? Number(newKeyword.prev_position) : null,
        volume: newKeyword.volume ? Number(newKeyword.volume) : null,
        difficulty: newKeyword.difficulty ? Number(newKeyword.difficulty) : null,
      }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    setNewKeyword({ user_id: '', keyword: '', target_url: '', position: '', prev_position: '', volume: '', difficulty: '' })
    setShowAddKeyword(false)
    setSaving(false)
    fetchAll()
  }

  const handleDeleteKeyword = async (id: string) => {
    await fetch('/api/admin/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAll()
  }

  const handleAddActivity = async () => {
    if (!newActivity.user_id || !newActivity.title || !newActivity.description) return
    setSaving(true)
    const res = await fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newActivity),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    setNewActivity({ user_id: '', type: 'backlink', title: '', description: '', impact: 'medium' })
    setShowAddActivity(false)
    setSaving(false)
    fetchAll()
  }

  const handleDeleteActivity = async (id: string) => {
    await fetch('/api/admin/activity', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAll()
  }

  const handleAddReport = async () => {
    if (!newReport.user_id || !newReport.title) return
    setSaving(true)
    const res = await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReport),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setSaving(false); return }
    setNewReport({ user_id: '', title: '', type: 'full' })
    setShowAddReport(false)
    setSaving(false)
    fetchAll()
  }

  const handleDeleteReport = async (id: string) => {
    await fetch('/api/admin/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAll()
  }

  const [editingGsc, setEditingGsc] = useState<string | null>(null)
  const [gscInputs, setGscInputs] = useState<Record<string, string>>({})

  const handleSaveGsc = async (userId: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, gsc_site_url: gscInputs[userId] ?? '' }),
    })
    setEditingGsc(null)
    fetchAll()
  }

  const inputClass = 'bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary'
  const selectClass = 'bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary'

  const tabs = [
    { id: 'users' as Tab, label: 'Users', count: users.length },
    { id: 'keywords' as Tab, label: 'Keywords', count: keywords.length },
    { id: 'activity' as Tab, label: 'Activity', count: activity.length },
    { id: 'reports' as Tab, label: 'Reports', count: reports.length },
  ]

  const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )

  return (
    <div>
      <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 text-accent text-sm mb-6">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Admin Panel — Only authorized administrators can access this page
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-600/60 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, color: 'text-primary' },
          { label: 'Active Users', value: users.filter((u) => u.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Tracked Keywords', value: keywords.length, color: 'text-accent' },
          { label: 'Admin Users', value: users.filter((u) => u.role === 'admin').length, color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-muted text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl mb-4 w-fit flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-primary/15 text-primary' : 'text-muted hover:text-foreground'
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

      {loading && <div className="text-muted text-sm py-8 text-center">Loading...</div>}

      {/* Users Tab */}
      {!loading && activeTab === 'users' && (
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
          {showAddUser && (
            <div className="mb-6 p-4 bg-background border border-primary/20 rounded-xl">
              <h4 className="text-foreground font-semibold text-sm mb-3">Create New User</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input type="text" placeholder="Full name" value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className={inputClass} />
                <input type="email" placeholder="Email address" value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className={inputClass} />
                <input type="password" placeholder="Password" value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className={inputClass} />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className={selectClass}>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddUser} disabled={saving}>{saving ? 'Creating...' : 'Create User'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddUser(false)}>Cancel</Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Email', 'Role', 'Status', 'GSC Property', 'Joined', ''].map((h) => (
                    <th key={h} className="text-left text-muted font-medium pb-3 pr-4 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-black/3 transition-colors">
                    <td className="py-3 pr-4 text-foreground font-medium">{u.name}</td>
                    <td className="py-3 pr-4 text-muted text-xs">{u.email}</td>
                    <td className="py-3 pr-4"><Badge variant={u.role === 'admin' ? 'warning' : 'info'}>{u.role}</Badge></td>
                    <td className="py-3 pr-4"><Badge variant={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge></td>
                    <td className="py-3 pr-4">
                      {editingGsc === u.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="https://example.com/"
                            value={gscInputs[u.id] ?? u.gsc_site_url ?? ''}
                            onChange={(e) => setGscInputs({ ...gscInputs, [u.id]: e.target.value })}
                            className="bg-background border border-primary/40 rounded-lg px-2 py-1 text-foreground text-xs w-40 focus:outline-none focus:border-primary"
                          />
                          <button onClick={() => handleSaveGsc(u.id)} className="text-emerald-600 text-xs hover:text-emerald-700 px-1">✓</button>
                          <button onClick={() => setEditingGsc(null)} className="text-muted text-xs hover:text-foreground px-1">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingGsc(u.id); setGscInputs({ ...gscInputs, [u.id]: u.gsc_site_url ?? '' }) }}
                          className="text-xs text-muted hover:text-primary transition-colors"
                        >
                          {u.gsc_site_url ? <span className="text-primary font-mono">{u.gsc_site_url}</span> : <span className="text-muted/50">+ Set URL</span>}
                        </button>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteUser(u.id)} className="text-muted hover:text-red-600 transition-colors p-1">
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted text-sm">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Keywords Tab */}
      {!loading && activeTab === 'keywords' && (
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
          {showAddKeyword && (
            <div className="mb-6 p-4 bg-background border border-primary/20 rounded-xl">
              <h4 className="text-foreground font-semibold text-sm mb-3">Assign Keyword to Client</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select value={newKeyword.user_id} onChange={(e) => setNewKeyword({ ...newKeyword, user_id: e.target.value })} className={selectClass}>
                  <option value="">Select client...</option>
                  {clients.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="text" placeholder="Keyword" value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })} className={inputClass} />
                <input type="text" placeholder="Target URL (e.g. /about)" value={newKeyword.target_url}
                  onChange={(e) => setNewKeyword({ ...newKeyword, target_url: e.target.value })} className={inputClass} />
                <input type="number" placeholder="Current position" value={newKeyword.position}
                  onChange={(e) => setNewKeyword({ ...newKeyword, position: e.target.value })} className={inputClass} />
                <input type="number" placeholder="Previous position" value={newKeyword.prev_position}
                  onChange={(e) => setNewKeyword({ ...newKeyword, prev_position: e.target.value })} className={inputClass} />
                <input type="number" placeholder="Search volume" value={newKeyword.volume}
                  onChange={(e) => setNewKeyword({ ...newKeyword, volume: e.target.value })} className={inputClass} />
                <input type="number" placeholder="Difficulty (0–100)" value={newKeyword.difficulty}
                  onChange={(e) => setNewKeyword({ ...newKeyword, difficulty: e.target.value })} className={inputClass} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddKeyword} disabled={saving}>{saving ? 'Saving...' : 'Assign'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddKeyword(false)}>Cancel</Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Keyword', 'Client', 'Position', 'Volume', 'Difficulty', ''].map((h) => (
                    <th key={h} className="text-left text-muted font-medium pb-3 pr-4 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-black/3 transition-colors">
                    <td className="py-3 pr-4 text-foreground font-medium">{kw.keyword}</td>
                    <td className="py-3 pr-4">
                      {kw.profiles ? (
                        <div>
                          <p className="text-foreground text-sm">{kw.profiles.name}</p>
                          <p className="text-muted text-xs">{kw.profiles.email}</p>
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-foreground">{kw.position != null ? `#${kw.position}` : '—'}</td>
                    <td className="py-3 pr-4 text-muted">{kw.volume?.toLocaleString() ?? '—'}</td>
                    <td className="py-3 pr-4 text-muted">{kw.difficulty ?? '—'}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteKeyword(kw.id)} className="text-muted hover:text-red-600 transition-colors p-1">
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
                {keywords.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-muted text-sm">No keywords assigned yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Activity Tab */}
      {!loading && activeTab === 'activity' && (
        <Card
          title="Activity Feed"
          action={
            <Button size="sm" onClick={() => setShowAddActivity(!showAddActivity)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Post Update
            </Button>
          }
        >
          {showAddActivity && (
            <div className="mb-6 p-4 bg-background border border-primary/20 rounded-xl">
              <h4 className="text-foreground font-semibold text-sm mb-3">Post SEO Update</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select value={newActivity.user_id} onChange={(e) => setNewActivity({ ...newActivity, user_id: e.target.value })} className={selectClass}>
                  <option value="">Select client...</option>
                  {clients.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })} className={selectClass}>
                  <option value="backlink">Backlink</option>
                  <option value="technical">Technical</option>
                  <option value="content">Content</option>
                </select>
                <select value={newActivity.impact} onChange={(e) => setNewActivity({ ...newActivity, impact: e.target.value })} className={selectClass}>
                  <option value="high">High Impact</option>
                  <option value="medium">Medium Impact</option>
                  <option value="low">Low Impact</option>
                </select>
                <input type="text" placeholder="Title" value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className={`${inputClass} sm:col-span-3`} />
                <textarea placeholder="Description..." value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  rows={3} className={`${inputClass} sm:col-span-3 resize-none`} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddActivity} disabled={saving}>{saving ? 'Posting...' : 'Post Update'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddActivity(false)}>Cancel</Button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-foreground font-medium text-sm">{item.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">{item.type}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-border text-muted">{item.impact} impact</span>
                  </div>
                  <p className="text-muted text-xs mb-1">{item.description}</p>
                  <p className="text-muted/50 text-xs">
                    {item.profiles?.name ?? 'Unknown'} · {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => handleDeleteActivity(item.id)} className="text-muted hover:text-red-600 transition-colors p-1 flex-shrink-0">
                  <TrashIcon />
                </button>
              </div>
            ))}
            {activity.length === 0 && <p className="py-8 text-center text-muted text-sm">No activity posted yet</p>}
          </div>
        </Card>
      )}

      {/* Reports Tab */}
      {!loading && activeTab === 'reports' && (
        <Card
          title="Report Records"
          action={
            <Button size="sm" onClick={() => setShowAddReport(!showAddReport)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Report
            </Button>
          }
        >
          {showAddReport && (
            <div className="mb-6 p-4 bg-background border border-primary/20 rounded-xl">
              <h4 className="text-foreground font-semibold text-sm mb-3">Create Report for Client</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <select value={newReport.user_id} onChange={(e) => setNewReport({ ...newReport, user_id: e.target.value })} className={selectClass}>
                  <option value="">Select client...</option>
                  {clients.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="text" placeholder="Report title (e.g. April 2024 SEO Report)" value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })} className={inputClass} />
                <select value={newReport.type} onChange={(e) => setNewReport({ ...newReport, type: e.target.value })} className={selectClass}>
                  <option value="full">Full SEO Report</option>
                  <option value="rankings">Rankings Report</option>
                  <option value="traffic">Traffic Report</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddReport} disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddReport(false)}>Cancel</Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Title', 'Client', 'Type', 'Created', ''].map((h) => (
                    <th key={h} className="text-left text-muted font-medium pb-3 pr-4 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-black/3 transition-colors">
                    <td className="py-3 pr-4 text-foreground font-medium">{r.title}</td>
                    <td className="py-3 pr-4">
                      {r.profiles ? (
                        <div>
                          <p className="text-foreground text-sm">{r.profiles.name}</p>
                          <p className="text-muted text-xs">{r.profiles.email}</p>
                        </div>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="py-3 pr-4"><Badge variant="info">{r.type}</Badge></td>
                    <td className="py-3 pr-4 text-muted text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteReport(r.id)} className="text-muted hover:text-red-600 transition-colors p-1">
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted text-sm">No reports created yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface Profile {
  id: string
  email: string
  name: string
  role: string
  status: string
  created_at: string
  gsc_site_url?: string | null
}

interface Screenshot {
  id: string
  user_id: string
  title: string | null
  file_url: string
  created_at: string
}

const inputClass = 'bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary w-full'
const selectClass = 'bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary w-full'

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

export default function AdminPanel() {
  const { toast } = useToast()
  const [tab, setTab] = useState<'users' | 'rankings'>('users')

  // Users state
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'client' })
  const [saving, setSaving] = useState(false)
  const [editingGsc, setEditingGsc] = useState<string | null>(null)
  const [gscInputs, setGscInputs] = useState<Record<string, string>>({})

  // Rankings state
  const [rankingUserId, setRankingUserId] = useState('')
  const [rankingTitle, setRankingTitle] = useState('')
  const [rankingFile, setRankingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loadingScreenshots, setLoadingScreenshots] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load')
      setUsers(data.users ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const fetchScreenshots = useCallback(async (userId: string) => {
    if (!userId) { setScreenshots([]); return }
    setLoadingScreenshots(true)
    try {
      const res = await fetch(`/api/admin/rankings?userId=${userId}`)
      const data = await res.json()
      setScreenshots(data.screenshots ?? [])
    } finally {
      setLoadingScreenshots(false)
    }
  }, [])

  useEffect(() => { fetchScreenshots(rankingUserId) }, [rankingUserId, fetchScreenshots])

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name || !newUser.password) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); toast(data.error, 'error'); return }
      setNewUser({ email: '', name: '', password: '', role: 'client' })
      setShowAddUser(false)
      toast(`User ${newUser.name} created successfully`, 'success')
      fetchUsers()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    const user = users.find((u) => u.id === id)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'inactive' }),
    })
    toast(`${user?.name ?? 'User'} deactivated`, 'info')
    fetchUsers()
  }

  const handleSaveGsc = async (userId: string) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, gsc_site_url: gscInputs[userId] ?? '' }),
    })
    setEditingGsc(null)
    toast('GSC property saved', 'success')
    fetchUsers()
  }

  const handleUpload = async () => {
    if (!rankingFile || !rankingUserId) {
      setUploadError('Select a user and a file first.')
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const form = new FormData()
      form.append('file', rankingFile)
      form.append('userId', rankingUserId)
      form.append('title', rankingTitle)
      const res = await fetch('/api/admin/rankings/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error ?? 'Upload failed'); return }
      setRankingTitle('')
      setRankingFile(null)
      if (fileRef.current) fileRef.current.value = ''
      fetchScreenshots(rankingUserId)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteScreenshot = async (id: string) => {
    await fetch('/api/admin/rankings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setScreenshots((prev) => prev.filter((s) => s.id !== id))
  }

  const clientUsers = users.filter((u) => u.role === 'client')

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-background border border-border rounded-xl p-1 mb-6 w-fit">
        {(['users', 'rankings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            {t === 'users' ? 'Users' : 'Rankings'}
          </button>
        ))}
      </div>

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

      {/* ── Users Tab ── */}
      {tab === 'users' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Users', value: users.length, color: 'text-primary' },
              { label: 'Active Users', value: users.filter((u) => u.status === 'active').length, color: 'text-emerald-600' },
              { label: 'Client Users', value: users.filter((u) => u.role === 'client').length, color: 'text-accent' },
              { label: 'Admin Users', value: users.filter((u) => u.role === 'admin').length, color: 'text-orange-600' },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-muted text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {loading && <div className="text-muted text-sm py-8 text-center">Loading...</div>}

          {!loading && (
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

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border">
                      {['Name', 'Email', 'Role', 'Status', 'GSC Property', 'Joined', ''].map((h) => (
                        <th key={h} className="text-left text-muted font-medium pb-3 pr-4 last:text-right whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-black/3 transition-colors">
                        <td className="py-3 pr-4 text-foreground font-medium whitespace-nowrap">{u.name}</td>
                        <td className="py-3 pr-4 text-muted text-xs whitespace-nowrap">{u.email}</td>
                        <td className="py-3 pr-4"><Badge variant={u.role === 'admin' ? 'warning' : 'info'}>{u.role}</Badge></td>
                        <td className="py-3 pr-4"><Badge variant={u.status === 'active' ? 'success' : 'default'}>{u.status}</Badge></td>
                        <td className="py-3 pr-4">
                          {editingGsc === u.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="sc-domain:example.com"
                                value={gscInputs[u.id] ?? u.gsc_site_url ?? ''}
                                onChange={(e) => setGscInputs({ ...gscInputs, [u.id]: e.target.value })}
                                className="bg-background border border-primary/40 rounded-lg px-2 py-1 text-foreground text-xs w-44 focus:outline-none focus:border-primary"
                              />
                              <button onClick={() => handleSaveGsc(u.id)} className="text-emerald-600 text-xs hover:text-emerald-700 px-1">✓</button>
                              <button onClick={() => setEditingGsc(null)} className="text-muted text-xs hover:text-foreground px-1">✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingGsc(u.id); setGscInputs({ ...gscInputs, [u.id]: u.gsc_site_url ?? '' }) }}
                              className="text-xs text-muted hover:text-primary transition-colors"
                            >
                              {u.gsc_site_url
                                ? <span className="text-primary font-mono">{u.gsc_site_url}</span>
                                : <span className="text-muted/50">+ Set URL</span>}
                            </button>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted text-xs whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="py-3 text-right">
                          <button onClick={() => handleDeleteUser(u.id)} className="text-muted hover:text-red-600 transition-colors p-1">
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-muted text-sm">No users yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── Rankings Tab ── */}
      {tab === 'rankings' && (
        <div className="space-y-6">
          <Card title="Upload Ranking Screenshot" subtitle="Assign a screenshot to a specific client">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-muted text-xs mb-1 block">Client User</label>
                <select
                  value={rankingUserId}
                  onChange={(e) => setRankingUserId(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select a user...</option>
                  {clientUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-muted text-xs mb-1 block">Title / Label (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Google Rankings – May 2025"
                  value={rankingTitle}
                  onChange={(e) => setRankingTitle(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-muted text-xs mb-1 block">Screenshot Image</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setRankingFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
              {rankingFile && (
                <p className="text-xs text-muted mt-1">{rankingFile.name} · {(rankingFile.size / 1024).toFixed(0)} KB</p>
              )}
            </div>

            {uploadError && (
              <p className="text-red-600 text-sm mb-3">{uploadError}</p>
            )}

            <Button onClick={handleUpload} disabled={uploading || !rankingFile || !rankingUserId}>
              {uploading ? 'Uploading...' : 'Upload Screenshot'}
            </Button>
          </Card>

          {rankingUserId && (
            <Card
              title="Uploaded Screenshots"
              subtitle={
                clientUsers.find((u) => u.id === rankingUserId)
                  ? `For ${clientUsers.find((u) => u.id === rankingUserId)!.name}`
                  : ''
              }
            >
              {loadingScreenshots ? (
                <div className="py-8 text-center text-muted text-sm">Loading...</div>
              ) : screenshots.length === 0 ? (
                <div className="py-8 text-center text-muted text-sm">No screenshots uploaded for this user yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {screenshots.map((s) => (
                    <div key={s.id} className="bg-background border border-border rounded-xl overflow-hidden group">
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setLightbox(s.file_url)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.file_url}
                          alt={s.title ?? 'Ranking screenshot'}
                          className="w-full h-40 object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                          </svg>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{s.title ?? 'Untitled'}</p>
                          <p className="text-muted text-xs">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteScreenshot(s.id)}
                          className="text-muted hover:text-red-600 transition-colors flex-shrink-0 p-1"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Screenshot"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

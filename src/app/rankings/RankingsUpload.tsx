'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { authedFetch } from '@/lib/authed-fetch'

interface User { id: string; name: string; email: string }
interface Screenshot { id: string; title: string | null; file_url: string; created_at: string }
interface Props { users: User[] }

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const ic = 'bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary w-full'

export default function RankingsUpload({ users }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loadingShots, setLoadingShots] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const fetchShots = useCallback(async (uid: string) => {
    if (!uid) { setScreenshots([]); return }
    setLoadingShots(true)
    try {
      const res = await authedFetch(`/api/admin/rankings?userId=${uid}`)
      const data = await res.json()
      setScreenshots(data.screenshots ?? [])
    } finally { setLoadingShots(false) }
  }, [])

  useEffect(() => { fetchShots(userId) }, [userId, fetchShots])

  const handleUpload = async () => {
    if (!file || !userId) { setError('Select a client and a file.'); return }
    setUploading(true); setError(''); setSuccess(false)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('userId', userId)
      form.append('title', title)
      const res = await authedFetch('/api/admin/rankings/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); return }
      setSuccess(true); setTitle(''); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      fetchShots(userId); router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } finally { setUploading(false) }
  }

  const handleDelete = async (id: string) => {
    await authedFetch('/api/admin/rankings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setScreenshots((p) => p.filter((s) => s.id !== id))
    router.refresh()
  }

  const selectedUser = users.find((u) => u.id === userId)

  return (
    <>
      <Card title="Upload Ranking Screenshot" subtitle="Assign a screenshot to a specific client">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-muted text-xs mb-1 block">Client</label>
              <select value={userId} onChange={(e) => setUserId(e.target.value)} className={ic}>
                <option value="">Select a client...</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
              </select>
            </div>
            <div>
              <label className="text-muted text-xs mb-1 block">Title (optional)</label>
              <input type="text" placeholder="e.g. Google Rankings – May 2025" value={title}
                onChange={(e) => setTitle(e.target.value)} className={ic} />
            </div>
          </div>

          <div>
            <label className="text-muted text-xs mb-1 block">Screenshot Image</label>
            <input ref={fileRef} type="file" accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
            {file && <p className="text-xs text-muted mt-1">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-emerald-600 text-sm">Screenshot uploaded successfully.</p>}
          <Button onClick={handleUpload} disabled={uploading || !file || !userId}>
            {uploading ? 'Uploading...' : 'Upload Screenshot'}
          </Button>
        </div>
      </Card>

      {userId && (
        <Card title="Uploaded Screenshots" subtitle={selectedUser ? `For ${selectedUser.name}` : ''}>
          {loadingShots ? (
            <div className="py-8 text-center text-muted text-sm">Loading...</div>
          ) : screenshots.length === 0 ? (
            <div className="py-8 text-center text-muted text-sm">No screenshots for this client yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {screenshots.map((s) => (
                <div key={s.id} className="bg-background border border-border rounded-xl overflow-hidden group">
                  <div className="relative cursor-pointer h-44 overflow-hidden" onClick={() => setLightbox(s.file_url)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.file_url} alt={s.title ?? 'Screenshot'} className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <svg className="opacity-0 group-hover:opacity-100 transition-opacity" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                      </svg>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-foreground text-sm font-medium truncate">{s.title ?? 'Untitled'}</p>
                      <p className="text-muted text-xs">{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => handleDelete(s.id)} className="text-muted hover:text-red-600 transition-colors p-1 flex-shrink-0"><TrashIcon /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(null)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Screenshot" className="max-w-full max-h-full rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}

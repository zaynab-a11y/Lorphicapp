'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { authedFetch } from '@/lib/authed-fetch'
import { useToast } from '@/components/ui/Toast'

interface User { id: string; name: string; email: string }
interface BFile { id: string; title: string; file_url: string; file_type: string; file_size: number; created_at: string }
interface Props { users: User[] }

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

function fileIcon(type: string) {
  if (type === 'pdf') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  )
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

const ic = 'bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm placeholder:text-muted/50 focus:outline-none focus:border-primary w-full'

export default function BacklinksUpload({ users }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [files, setFiles] = useState<BFile[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFiles = useCallback(async (uid: string) => {
    if (!uid) { setFiles([]); return }
    setLoading(true)
    try {
      const res = await authedFetch(`/api/admin/backlinks?userId=${uid}`)
      const data = await res.json()
      setFiles(data.files ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchFiles(userId) }, [userId, fetchFiles])

  const handleUpload = async () => {
    if (!file || !userId) { setError('Select a client and a file.'); return }
    setUploading(true); setError(''); setSuccess(false)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('userId', userId)
      form.append('title', title || file.name)
      const res = await authedFetch('/api/admin/backlinks/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); toast(data.error ?? 'Upload failed', 'error'); return }
      setSuccess(true); setTitle(''); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      toast('File uploaded successfully', 'success')
      fetchFiles(userId); router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } finally { setUploading(false) }
  }

  const handleDelete = async (id: string) => {
    await authedFetch('/api/admin/backlinks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setFiles((p) => p.filter((f) => f.id !== id))
    toast('File deleted', 'info')
    router.refresh()
  }

  const selectedUser = users.find((u) => u.id === userId)

  return (
    <>
      <Card title="Upload Backlink Report" subtitle="Upload Excel, PDF, or CSV for a specific client">
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
              <input type="text" placeholder="e.g. Backlinks Report – May 2025" value={title}
                onChange={(e) => setTitle(e.target.value)} className={ic} />
            </div>
          </div>

          <div>
            <label className="text-muted text-xs mb-1 block">File (PDF, Excel, CSV, Word)</label>
            <input ref={fileRef} type="file"
              accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer" />
            {file && <p className="text-xs text-muted mt-1">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-emerald-600 text-sm">File uploaded successfully.</p>}
          <Button onClick={handleUpload} disabled={uploading || !file || !userId}>
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </Card>

      {userId && (
        <Card title="Uploaded Files" subtitle={selectedUser ? `For ${selectedUser.name}` : ''}>
          {loading ? (
            <div className="py-8 text-center text-muted text-sm">Loading...</div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center text-muted text-sm">No files uploaded for this client yet.</div>
          ) : (
            <div className="space-y-2">
              {files.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl hover:border-accent/30 transition-colors">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent flex-shrink-0">
                    {fileIcon(f.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium truncate">{f.title}</p>
                    <p className="text-muted text-xs">
                      {f.file_type.toUpperCase()} · {(f.file_size / 1024).toFixed(0)} KB · {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a href={f.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-accent hover:text-accent/80 transition-colors p-1.5 rounded-lg hover:bg-accent/10">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </a>
                    <button onClick={() => handleDelete(f.id)} className="text-muted hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  )
}

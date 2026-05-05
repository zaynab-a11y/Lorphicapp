import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const ALLOWED = ['pdf', 'xlsx', 'xls', 'csv', 'doc', 'docx']

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin(request)
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await request.formData()
  const file = form.get('file') as File | null
  const userId = form.get('userId') as string | null
  const title = (form.get('title') as string | null) ?? ''

  if (!file || !userId) return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!ALLOWED.includes(ext)) {
    return NextResponse.json({ error: `File type .${ext} not allowed. Use: ${ALLOWED.join(', ')}` }, { status: 400 })
  }

  const filePath = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

  const { error: storageError } = await ctx.service.storage
    .from('backlink-files')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 })

  const { data: { publicUrl } } = ctx.service.storage
    .from('backlink-files')
    .getPublicUrl(filePath)

  const { error: dbError } = await ctx.service.from('backlink_files').insert({
    user_id: userId,
    uploaded_by: ctx.userId,
    title: title || file.name,
    file_path: filePath,
    file_url: publicUrl,
    file_type: ext,
    file_size: file.size,
  })

  if (dbError) {
    await ctx.service.storage.from('backlink-files').remove([filePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, url: publicUrl })
}

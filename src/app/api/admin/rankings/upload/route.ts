import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const service = createServiceClient()

  const form = await request.formData()
  const file = form.get('file') as File | null
  const userId = form.get('userId') as string | null
  const title = (form.get('title') as string | null) ?? ''

  if (!file || !userId) {
    return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const filePath = `${userId}/${Date.now()}.${ext}`

  const { error: storageError } = await service.storage
    .from('ranking-screenshots')
    .upload(filePath, file, { contentType: file.type, upsert: false })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = service.storage
    .from('ranking-screenshots')
    .getPublicUrl(filePath)

  const { error: dbError } = await service.from('ranking_screenshots').insert({
    user_id: userId,
    uploaded_by: user.id,
    title: title || null,
    file_path: filePath,
    file_url: publicUrl,
  })

  if (dbError) {
    await service.storage.from('ranking-screenshots').remove([filePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, url: publicUrl })
}

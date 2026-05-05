import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export type AdminContext = { userId: string; service: ReturnType<typeof createServiceClient> }

export async function requireAdmin(request: NextRequest): Promise<AdminContext | null> {
  const service = createServiceClient()
  let userId: string | null = null

  // Prefer explicit Bearer token (most reliable from client-side fetches)
  const token = request.headers.get('Authorization')?.replace('Bearer ', '').trim()
  if (token) {
    const { data: { user } } = await service.auth.getUser(token)
    userId = user?.id ?? null
  }

  // Fallback: cookie-based session
  if (!userId) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  }

  if (!userId) return null

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role !== 'admin') return null

  return { userId, service }
}

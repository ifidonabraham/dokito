import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  HEALTH_RECORD_TYPES,
  isHealthRecordType,
  parseHealthRecordPayload,
  toHealthRecordResponse,
} from '@/lib/health-records'

export async function GET(request: Request) {
  const supabase = await createClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100)
  const offset = Number(searchParams.get('offset') || 0)

  if (type && !isHealthRecordType(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${HEALTH_RECORD_TYPES.join(', ')}` },
      { status: 400 }
    )
  }

  let query = supabase
    .from('health_records')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('record_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    records: (data || []).map(toHealthRecordResponse),
    total: count || 0,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { errors, record } = parseHealthRecordPayload(body)

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const profileError = await ensureProfile(supabase, user)
  if (profileError) {
    return NextResponse.json({ error: profileError }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('health_records')
    .insert({ ...record, user_id: user.id })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ record: toHealthRecordResponse(data) }, { status: 201 })
}

async function ensureProfile(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name:
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === 'string'
            ? user.user_metadata.name
            : null,
      avatar_url: typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  return error?.message ?? null
}

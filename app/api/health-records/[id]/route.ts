import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseHealthRecordPayload, toHealthRecordResponse } from '@/lib/health-records'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
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

  const { id } = await context.params
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Health record not found' }, { status: 404 })
  }

  return NextResponse.json({ record: toHealthRecordResponse(data) })
}

export async function PATCH(request: Request, context: RouteContext) {
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
  const { errors, record } = parseHealthRecordPayload(body, true)

  if (errors.length > 0) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  if (Object.keys(record).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  const { id } = await context.params
  const { data, error } = await supabase
    .from('health_records')
    .update(record)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Health record not found' }, { status: 404 })
  }

  return NextResponse.json({ record: toHealthRecordResponse(data) })
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params
  const { error } = await supabase.from('health_records').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

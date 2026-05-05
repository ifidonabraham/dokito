import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseAppointmentPayload, toAppointmentResponse } from '@/lib/appointments'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { errors, appointment } = parseAppointmentPayload(body, true)
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 })

  const { data, error } = await supabase
    .from('appointments')
    .update(appointment)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ appointment: toAppointmentResponse(data) })
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('appointments').delete().eq('id', id).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

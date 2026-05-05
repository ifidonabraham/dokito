import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseAppointmentPayload, toAppointmentResponse } from '@/lib/appointments'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ appointments: (data || []).map(toAppointmentResponse) })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { errors, appointment } = parseAppointmentPayload(body)
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 })

  const { data, error } = await supabase
    .from('appointments')
    .insert({ ...appointment, user_id: user.id })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ appointment: toAppointmentResponse(data) }, { status: 201 })
}

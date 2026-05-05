import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  buildMedicationLogs,
  parseMedicationPayload,
  toMedicationLogResponse,
  toMedicationResponse,
} from '@/lib/medications'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const [{ data: medications, error: medicationsError }, { data: logs, error: logsError }] = await Promise.all([
    supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('medication_logs')
      .select('*, medications!inner(name, dosage)')
      .eq('medications.user_id', user.id)
      .gte('scheduled_time', now.toISOString())
      .lte('scheduled_time', nextWeek.toISOString())
      .order('scheduled_time', { ascending: true })
      .limit(100),
  ])

  if (medicationsError) return NextResponse.json({ error: medicationsError.message }, { status: 500 })
  if (logsError) return NextResponse.json({ error: logsError.message }, { status: 500 })

  return NextResponse.json({
    medications: (medications || []).map(toMedicationResponse),
    logs: (logs || []).map(toMedicationLogResponse),
  })
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
  const { errors, medication } = parseMedicationPayload(body)
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 400 })

  const { data, error } = await supabase
    .from('medications')
    .insert({ ...medication, user_id: user.id })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const logs = buildMedicationLogs(data.id, data.start_date, data.end_date, data.reminder_times || [])
  if (logs.length > 0 && data.reminder_enabled) {
    const { error: logError } = await supabase.from('medication_logs').insert(logs)
    if (logError) return NextResponse.json({ error: logError.message }, { status: 500 })
  }

  return NextResponse.json({ medication: toMedicationResponse(data) }, { status: 201 })
}

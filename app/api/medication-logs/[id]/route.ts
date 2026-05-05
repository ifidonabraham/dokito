import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { toMedicationLogResponse } from '@/lib/medications'

type Params = { params: Promise<{ id: string }> }
const STATUSES = ['pending', 'taken', 'missed', 'skipped'] as const

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
  const status = typeof body.status === 'string' ? body.status : ''
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return NextResponse.json({ error: 'status must be pending, taken, missed, or skipped' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('medication_logs')
    .update({
      status,
      taken_at: status === 'taken' ? new Date().toISOString() : null,
      notes: typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
    })
    .eq('id', id)
    .select('*, medications!inner(name, dosage, user_id)')
    .eq('medications.user_id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ log: toMedicationLogResponse(data) })
}

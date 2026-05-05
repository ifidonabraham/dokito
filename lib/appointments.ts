export type AppointmentPayload = {
  title?: unknown
  date?: unknown
  time?: unknown
  facility?: unknown
  provider?: unknown
  reason?: unknown
  notes?: unknown
  status?: unknown
}

export type AppointmentRow = {
  id: string
  user_id: string
  title: string
  appointment_date: string
  appointment_time: string | null
  facility: string | null
  provider: string | null
  reason: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

const STATUSES = ['scheduled', 'completed', 'cancelled'] as const

export function parseAppointmentPayload(body: unknown, partial = false) {
  const payload = isObject(body) ? body : {}
  const errors: string[] = []
  const appointment: Record<string, unknown> = {}

  if (!isObject(body)) errors.push('Request body must be an object')

  if (!partial || payload.title !== undefined) {
    if (typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      errors.push('title is required')
    } else {
      appointment.title = payload.title.trim()
    }
  }

  if (!partial || payload.date !== undefined) {
    if (typeof payload.date !== 'string' || Number.isNaN(Date.parse(payload.date))) {
      errors.push('date is required')
    } else {
      appointment.appointment_date = payload.date.slice(0, 10)
    }
  }

  if (payload.time !== undefined) {
    if (payload.time === '' || payload.time === null) {
      appointment.appointment_time = null
    } else if (typeof payload.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(payload.time)) {
      appointment.appointment_time = payload.time
    } else {
      errors.push('time must be HH:mm')
    }
  }

  for (const key of ['facility', 'provider', 'reason', 'notes'] as const) {
    if (payload[key] !== undefined) {
      appointment[key] = typeof payload[key] === 'string' && payload[key].trim() ? payload[key].trim() : null
    }
  }

  if (payload.status !== undefined) {
    if (typeof payload.status === 'string' && STATUSES.includes(payload.status as AppointmentRow['status'])) {
      appointment.status = payload.status
    } else {
      errors.push('status must be scheduled, completed, or cancelled')
    }
  }

  return { errors, appointment }
}

export function toAppointmentResponse(row: AppointmentRow) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    date: row.appointment_date,
    time: row.appointment_time,
    facility: row.facility,
    provider: row.provider,
    reason: row.reason,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function isObject(value: unknown): value is AppointmentPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

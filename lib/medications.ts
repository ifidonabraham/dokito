export type MedicationPayload = {
  name?: unknown
  dosage?: unknown
  frequency?: unknown
  startDate?: unknown
  endDate?: unknown
  instructions?: unknown
  reminderEnabled?: unknown
  reminderTimes?: unknown
}

export type MedicationRow = {
  id: string
  user_id: string
  name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string | null
  instructions: string | null
  is_active: boolean
  reminder_enabled: boolean
  reminder_times: string[] | null
  created_at: string
  updated_at: string
}

export type MedicationLogRow = {
  id: string
  medication_id: string
  scheduled_time: string
  taken_at: string | null
  status: 'pending' | 'taken' | 'missed' | 'skipped'
  notes: string | null
  created_at: string
  medications?: Pick<MedicationRow, 'name' | 'dosage'> | null
}

export function parseMedicationPayload(body: unknown) {
  const payload = isObject(body) ? body : {}
  const errors: string[] = []
  const medication: Record<string, unknown> = {}

  if (!isObject(body)) {
    errors.push('Request body must be an object')
  }

  for (const key of ['name', 'dosage', 'frequency'] as const) {
    const value = payload[key]
    if (typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`${key} is required`)
    } else {
      medication[toSnake(key)] = value.trim()
    }
  }

  if (typeof payload.startDate !== 'string' || Number.isNaN(Date.parse(payload.startDate))) {
    errors.push('startDate is required')
  } else {
    medication.start_date = payload.startDate.slice(0, 10)
  }

  if (payload.endDate === undefined || payload.endDate === null || payload.endDate === '') {
    medication.end_date = null
  } else if (typeof payload.endDate === 'string' && !Number.isNaN(Date.parse(payload.endDate))) {
    medication.end_date = payload.endDate.slice(0, 10)
  } else {
    errors.push('endDate must be a valid date')
  }

  medication.instructions = stringOrNull(payload.instructions)
  medication.reminder_enabled = payload.reminderEnabled !== false

  if (!Array.isArray(payload.reminderTimes)) {
    medication.reminder_times = ['08:00']
  } else {
    const times = payload.reminderTimes.filter(isValidTime)
    if (times.length === 0) {
      errors.push('Add at least one valid reminder time')
    } else {
      medication.reminder_times = times
    }
  }

  return { errors, medication }
}

export function buildMedicationLogs(medicationId: string, startDate: string, endDate: string | null, times: string[]) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = endDate ? new Date(`${endDate}T00:00:00`) : new Date(start)
  if (!endDate) end.setDate(end.getDate() + 13)

  const maxEnd = new Date(start)
  maxEnd.setDate(maxEnd.getDate() + 29)
  const finalEnd = end < maxEnd ? end : maxEnd

  const logs: Array<{ medication_id: string; scheduled_time: string; status: 'pending' }> = []
  for (const day = new Date(start); day <= finalEnd; day.setDate(day.getDate() + 1)) {
    for (const time of times) {
      logs.push({
        medication_id: medicationId,
        scheduled_time: `${day.toISOString().slice(0, 10)}T${time}:00`,
        status: 'pending',
      })
    }
  }

  return logs
}

export function toMedicationResponse(row: MedicationRow) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    dosage: row.dosage,
    frequency: row.frequency,
    startDate: row.start_date,
    endDate: row.end_date,
    instructions: row.instructions,
    isActive: row.is_active,
    reminderEnabled: row.reminder_enabled,
    reminderTimes: row.reminder_times || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toMedicationLogResponse(row: MedicationLogRow) {
  return {
    id: row.id,
    medicationId: row.medication_id,
    medicationName: row.medications?.name,
    dosage: row.medications?.dosage,
    scheduledTime: row.scheduled_time,
    takenAt: row.taken_at,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  }
}

function isObject(value: unknown): value is MedicationPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringOrNull(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function toSnake(value: string) {
  return value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

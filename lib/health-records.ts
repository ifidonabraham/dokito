export const HEALTH_RECORD_TYPES = [
  'diagnosis',
  'lab_result',
  'prescription',
  'visit_note',
  'immunization',
  'surgery',
  'other',
] as const

export type HealthRecordType = (typeof HEALTH_RECORD_TYPES)[number]

export type HealthRecordPayload = {
  type?: unknown
  title?: unknown
  description?: unknown
  date?: unknown
  provider?: unknown
  facility?: unknown
  attachmentUrl?: unknown
  metadata?: unknown
}

type HealthRecordRow = {
  id: string
  user_id: string
  type: HealthRecordType
  title: string
  description: string | null
  record_date: string
  provider: string | null
  facility: string | null
  attachment_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export function isHealthRecordType(value: unknown): value is HealthRecordType {
  return typeof value === 'string' && HEALTH_RECORD_TYPES.includes(value as HealthRecordType)
}

export function parseHealthRecordPayload(body: unknown, partial = false) {
  const errors: string[] = []
  const record: Record<string, unknown> = {}
  const payload = isPayloadObject(body) ? body : {}

  if (!isPayloadObject(body)) {
    errors.push('Request body must be an object')
  }

  if (!partial || payload.type !== undefined) {
    if (!isHealthRecordType(payload.type)) {
      errors.push(`type must be one of: ${HEALTH_RECORD_TYPES.join(', ')}`)
    } else {
      record.type = payload.type
    }
  }

  if (!partial || payload.title !== undefined) {
    if (typeof payload.title !== 'string' || payload.title.trim().length === 0) {
      errors.push('title is required')
    } else {
      record.title = payload.title.trim()
    }
  }

  if (!partial || payload.date !== undefined) {
    if (typeof payload.date !== 'string' || Number.isNaN(Date.parse(payload.date))) {
      errors.push('date is required and must be a valid date string')
    } else {
      record.record_date = payload.date.slice(0, 10)
    }
  }

  for (const [inputKey, outputKey] of [
    ['description', 'description'],
    ['provider', 'provider'],
    ['facility', 'facility'],
    ['attachmentUrl', 'attachment_url'],
  ] as const) {
    const value = payload[inputKey]
    if (value === undefined) {
      continue
    }

    if (value === null || value === '') {
      record[outputKey] = null
    } else if (typeof value === 'string') {
      record[outputKey] = value.trim()
    } else {
      errors.push(`${inputKey} must be a string`)
    }
  }

  if (payload.metadata !== undefined) {
    if (payload.metadata === null || Array.isArray(payload.metadata) || typeof payload.metadata !== 'object') {
      errors.push('metadata must be an object')
    } else {
      record.metadata = payload.metadata
    }
  }

  return { errors, record }
}

export function toHealthRecordResponse(record: HealthRecordRow) {
  return {
    id: record.id,
    userId: record.user_id,
    type: record.type,
    title: record.title,
    description: record.description,
    date: record.record_date,
    provider: record.provider,
    facility: record.facility,
    attachmentUrl: record.attachment_url,
    metadata: record.metadata,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function isPayloadObject(value: unknown): value is HealthRecordPayload {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

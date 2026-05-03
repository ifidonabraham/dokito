// ============================================
// AKILI HEALTH - Core Type Definitions
// ============================================

// User & Authentication
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  stateOfResidence?: string
  lga?: string
  bloodType?: string
  genotype?: string
  createdAt: string
  updatedAt: string
}

// Health Records (Module 1)
export interface HealthRecord {
  id: string
  userId: string
  type: 'diagnosis' | 'lab_result' | 'prescription' | 'visit_note' | 'immunization' | 'surgery' | 'other'
  title: string
  description?: string
  date: string
  provider?: string
  facility?: string
  attachmentUrl?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface Vital {
  id: string
  userId: string
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'height' | 'temperature' | 'heart_rate' | 'oxygen_saturation'
  value: number
  unit: string
  secondaryValue?: number // For blood pressure (diastolic)
  recordedAt: string
  notes?: string
  createdAt: string
}

export interface Medication {
  id: string
  userId: string
  name: string
  genericName?: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  isActive: boolean
  prescribedBy?: string
  purpose?: string
  sideEffects?: string[]
  reminders?: MedicationReminder[]
  createdAt: string
  updatedAt: string
}

export interface MedicationReminder {
  id: string
  medicationId: string
  time: string // HH:mm format
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[]
  isEnabled: boolean
}

export interface Allergy {
  id: string
  userId: string
  allergen: string
  type: 'drug' | 'food' | 'environmental' | 'other'
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening'
  reaction: string
  diagnosedDate?: string
  createdAt: string
}

// DÓKÍTÀ AI (Module 2)
export interface SymptomIntake {
  symptoms: string[]
  duration: string
  severity: 'mild' | 'moderate' | 'severe'
  associatedSymptoms?: string[]
  medicalHistory?: string[]
  currentMedications?: string[]
  allergies?: string[]
  age?: number
  gender?: string
  location?: string
}

export interface DokitaResponse {
  triageLevel: 'emergency' | 'urgent' | 'moderate' | 'mild' | 'self_care'
  possibleConditions: {
    name: string
    probability: 'high' | 'medium' | 'low'
    description: string
  }[]
  recommendations: string[]
  redFlags: string[]
  whenToSeeDoctor: string
  immediateActions: string[]
  disclaimer: string
  isEmergency: boolean
  emergencyInfo?: EmergencyInfo
}

export interface EmergencyInfo {
  condition: string
  message: string
  callNumber: string
  googleMapsLink: string
  firstAidInstructions: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  isEmergency?: boolean
  metadata?: Record<string, unknown>
}

// Emergency System
export interface EmergencyState {
  isActive: boolean
  isVoiceActive: boolean
  currentLocation: GeolocationCoordinates | null
  destination: Facility | null
  eta: number | null // minutes
  distance: number | null // meters
  routeProgress: number // 0-100
  symptomAnswers: Record<string, string>
  language: SupportedLanguage
  journeyStartTime: string | null
  journeyId: string | null
}

export type SupportedLanguage = 'en' | 'pcm' | 'yo' | 'ig' | 'ha'

export interface EmergencyQuestion {
  id: string
  question: Record<SupportedLanguage, string>
  type: 'yes_no' | 'text' | 'choice'
  choices?: Record<SupportedLanguage, string[]>
  priority: number
}

// Drug Information (Module 3)
export interface Drug {
  id: string
  nafdacNumber?: string
  brandName: string
  genericName: string
  manufacturer: string
  category: string
  indications: string[]
  dosageForms: string[]
  commonSideEffects: string[]
  contraindications: string[]
  isRegistered: boolean
  registrationStatus: 'active' | 'expired' | 'suspended' | 'not_found'
  imageUrl?: string
}

export interface DrugInteraction {
  drug1: string
  drug2: string
  severity: 'mild' | 'moderate' | 'severe' | 'contraindicated'
  description: string
  recommendation: string
}

export interface NAFDACVerification {
  nafdacNumber: string
  isRegistered: boolean
  productName?: string
  genericName?: string
  manufacturer?: string
  category?: string
  status?: 'active' | 'expired' | 'suspended'
  warning?: string
  message: string
}

// Facility Finder (Module 4)
export interface Facility {
  id: string
  name: string
  type: 'phc' | 'general_hospital' | 'teaching_hospital' | 'private_hospital' | 'pharmacy' | 'laboratory' | 'clinic' | 'emergency'
  address: string
  state: string
  lga: string
  latitude: number
  longitude: number
  phone?: string
  email?: string
  website?: string
  services: string[]
  openingHours?: {
    day: string
    open: string
    close: string
  }[]
  hasEmergency: boolean
  isOpen24Hours: boolean
  averageRating: number
  totalRatings: number
  isVerified: boolean
  distance?: number // Calculated field, in meters
  eta?: number // Calculated field, in minutes
}

export interface FacilityRating {
  id: string
  facilityId: string
  userId: string
  rating: number
  review?: string
  createdAt: string
}

export interface FacilitySearchParams {
  latitude: number
  longitude: number
  type?: Facility['type']
  radius?: number // in km
  hasEmergency?: boolean
  isOpen?: boolean
  limit?: number
}

// Chronic Disease Management (Module 6)
export interface ChronicProgram {
  id: string
  userId: string
  type: 'hypertension' | 'diabetes' | 'antenatal' | 'asthma' | 'sickle_cell'
  startDate: string
  status: 'active' | 'paused' | 'completed'
  checkInFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  lastCheckIn?: string
  nextCheckIn?: string
  metrics: ChronicMetric[]
}

export interface ChronicMetric {
  id: string
  programId: string
  name: string
  value: number
  unit: string
  recordedAt: string
  isAlert: boolean
  alertThreshold?: number
}

// Appointments
export interface Appointment {
  id: string
  userId: string
  facilityId: string
  facility?: Facility
  providerId?: string
  providerName?: string
  type: 'consultation' | 'follow_up' | 'lab_test' | 'vaccination' | 'checkup' | 'emergency'
  date: string
  time: string
  duration: number // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  reminderSent: boolean
  createdAt: string
  updatedAt: string
}

// Nigerian States and LGAs
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
] as const

export type NigerianState = typeof NIGERIAN_STATES[number]

// Emergency contact numbers by state
export const STATE_EMERGENCY_NUMBERS: Record<string, { police: string; ambulance: string; fire: string }> = {
  'Lagos': { police: '112', ambulance: '767', fire: '112' },
  'FCT': { police: '112', ambulance: '112', fire: '112' },
  'Rivers': { police: '08032003514', ambulance: '112', fire: '112' },
  'Kano': { police: '08032419754', ambulance: '112', fire: '112' },
  // Default for other states
  'default': { police: '112', ambulance: '112', fire: '199' }
}

// Language labels
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'en': 'English',
  'pcm': 'Nigerian Pidgin',
  'yo': 'Yorùbá',
  'ig': 'Igbo',
  'ha': 'Hausa'
}

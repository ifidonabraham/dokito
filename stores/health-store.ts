// ============================================
// AKILI HEALTH - Health Records State Management
// ============================================

import { create } from 'zustand'
import type { HealthRecord, Vital, Medication, Allergy, ChronicProgram } from '@/lib/types'

interface HealthStore {
  // Data
  records: HealthRecord[]
  vitals: Vital[]
  medications: Medication[]
  allergies: Allergy[]
  chronicPrograms: ChronicProgram[]
  appointments: Array<{ id: string; doctorName: string; dateTime: string }>
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setRecords: (records: HealthRecord[]) => void
  addRecord: (record: HealthRecord) => void
  updateRecord: (id: string, updates: Partial<HealthRecord>) => void
  deleteRecord: (id: string) => void
  
  setVitals: (vitals: Vital[]) => void
  addVital: (vital: Vital) => void
  addVitalRecord: (vital: {
    bloodPressure?: { systolic: number; diastolic: number }
    heartRate?: number
    bloodSugar?: number
    temperature?: number
    weight?: number
    notes?: string
  }) => void
  
  setMedications: (medications: Medication[]) => void
  addMedication: (medication: Partial<Medication> & Pick<Medication, 'name' | 'dosage' | 'frequency'> & { times?: string[]; instructions?: string }) => void
  updateMedication: (id: string, updates: Partial<Medication>) => void
  deleteMedication: (id: string) => void
  
  setAllergies: (allergies: Allergy[]) => void
  addAllergy: (allergy: Partial<Allergy> & Pick<Allergy, 'allergen' | 'reaction' | 'severity'>) => void
  deleteAllergy: (id: string) => void
  
  setChronicPrograms: (programs: ChronicProgram[]) => void
  
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  records: [],
  vitals: [],
  medications: [],
  allergies: [],
  chronicPrograms: [],
  appointments: [],
  isLoading: false,
}

export const useHealthStore = create<HealthStore>((set) => ({
  ...initialState,

  setRecords: (records) => set({ records }),
  
  addRecord: (record) => set((state) => ({
    records: [record, ...state.records],
  })),
  
  updateRecord: (id, updates) => set((state) => ({
    records: state.records.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ),
  })),
  
  deleteRecord: (id) => set((state) => ({
    records: state.records.filter((r) => r.id !== id),
  })),

  setVitals: (vitals) => set({ vitals }),
  
  addVital: (vital) => set((state) => ({
    vitals: [vital, ...state.vitals],
  })),

  addVitalRecord: (vital) => set((state) => {
    const now = new Date().toISOString()
    const nextVitals: Vital[] = []

    if (vital.bloodPressure) {
      nextVitals.push({
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'blood_pressure',
        value: vital.bloodPressure.systolic,
        secondaryValue: vital.bloodPressure.diastolic,
        unit: 'mmHg',
        recordedAt: now,
        notes: vital.notes,
        createdAt: now,
      })
    }

    if (vital.heartRate) {
      nextVitals.push({
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'heart_rate',
        value: vital.heartRate,
        unit: 'bpm',
        recordedAt: now,
        notes: vital.notes,
        createdAt: now,
      })
    }

    if (vital.bloodSugar) {
      nextVitals.push({
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'blood_sugar',
        value: vital.bloodSugar,
        unit: 'mg/dL',
        recordedAt: now,
        notes: vital.notes,
        createdAt: now,
      })
    }

    if (vital.temperature) {
      nextVitals.push({
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'temperature',
        value: vital.temperature,
        unit: '°C',
        recordedAt: now,
        notes: vital.notes,
        createdAt: now,
      })
    }

    if (vital.weight) {
      nextVitals.push({
        id: crypto.randomUUID(),
        userId: 'local',
        type: 'weight',
        value: vital.weight,
        unit: 'kg',
        recordedAt: now,
        notes: vital.notes,
        createdAt: now,
      })
    }

    return { vitals: [...nextVitals, ...state.vitals] }
  }),

  setMedications: (medications) => set({ medications }),
  
  addMedication: (medication) => set((state) => ({
    medications: [{
      id: medication.id || crypto.randomUUID(),
      userId: medication.userId || 'local',
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate || new Date().toISOString(),
      endDate: medication.endDate,
      isActive: medication.isActive ?? true,
      purpose: medication.instructions || medication.purpose,
      reminders: medication.times?.map((time) => ({
        id: crypto.randomUUID(),
        medicationId: medication.id || 'local',
        time,
        days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        isEnabled: true,
      })),
      createdAt: medication.createdAt || new Date().toISOString(),
      updatedAt: medication.updatedAt || new Date().toISOString(),
    }, ...state.medications],
  })),
  
  updateMedication: (id, updates) => set((state) => ({
    medications: state.medications.map((m) =>
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    ),
  })),
  
  deleteMedication: (id) => set((state) => ({
    medications: state.medications.filter((m) => m.id !== id),
  })),

  setAllergies: (allergies) => set({ allergies }),
  
  addAllergy: (allergy) => set((state) => ({
    allergies: [{
      id: allergy.id || crypto.randomUUID(),
      userId: allergy.userId || 'local',
      allergen: allergy.allergen,
      type: allergy.type || 'other',
      severity: allergy.severity,
      reaction: allergy.reaction,
      diagnosedDate: allergy.diagnosedDate,
      createdAt: allergy.createdAt || new Date().toISOString(),
    }, ...state.allergies],
  })),
  
  deleteAllergy: (id) => set((state) => ({
    allergies: state.allergies.filter((a) => a.id !== id),
  })),

  setChronicPrograms: (chronicPrograms) => set({ chronicPrograms }),

  setLoading: (isLoading) => set({ isLoading }),
  
  reset: () => set(initialState),
}))

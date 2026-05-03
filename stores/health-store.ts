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
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setRecords: (records: HealthRecord[]) => void
  addRecord: (record: HealthRecord) => void
  updateRecord: (id: string, updates: Partial<HealthRecord>) => void
  deleteRecord: (id: string) => void
  
  setVitals: (vitals: Vital[]) => void
  addVital: (vital: Vital) => void
  
  setMedications: (medications: Medication[]) => void
  addMedication: (medication: Medication) => void
  updateMedication: (id: string, updates: Partial<Medication>) => void
  deleteMedication: (id: string) => void
  
  setAllergies: (allergies: Allergy[]) => void
  addAllergy: (allergy: Allergy) => void
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

  setMedications: (medications) => set({ medications }),
  
  addMedication: (medication) => set((state) => ({
    medications: [medication, ...state.medications],
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
    allergies: [allergy, ...state.allergies],
  })),
  
  deleteAllergy: (id) => set((state) => ({
    allergies: state.allergies.filter((a) => a.id !== id),
  })),

  setChronicPrograms: (chronicPrograms) => set({ chronicPrograms }),

  setLoading: (isLoading) => set({ isLoading }),
  
  reset: () => set(initialState),
}))

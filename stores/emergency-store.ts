// ============================================
// AKILI HEALTH - Emergency State Management
// ============================================

import { create } from 'zustand'
import type { Facility, SupportedLanguage, EmergencyState } from '@/lib/types'

interface EmergencyStore extends EmergencyState {
  // Extra UI state not in EmergencyState
  isEmergencyMode: boolean
  activeView: 'map' | 'voice'
  userLocation: { lat: number; lng: number } | null
  nearestFacilities: Facility[]
  emergencyType: string | null

  // Actions
  activateEmergency: () => void
  deactivateEmergency: () => void
  setUserLocation: (location: { lat: number; lng: number }) => void
  setCurrentLocation: (location: GeolocationCoordinates) => void
  setNearestFacilities: (facilities: Facility[]) => void
  findNearestFacilities: (location: { lat: number; lng: number }) => void
  setActiveView: (view: 'map' | 'voice') => void
  setDestination: (facility: Facility | null) => void
  updateJourney: (eta: number, distance: number, progress: number) => void
  addSymptomAnswer: (questionId: string, answer: string) => void
  setLanguage: (lang: SupportedLanguage) => void
  setEmergencyType: (type: string | null) => void
  toggleVoice: (active: boolean) => void
  reset: () => void
}

const initialState = {
  isActive: false,
  isEmergencyMode: false,
  activeView: 'map' as const,
  userLocation: null,
  nearestFacilities: [] as Facility[],
  emergencyType: null,
  isVoiceActive: false,
  currentLocation: null,
  destination: null,
  eta: null,
  distance: null,
  routeProgress: 0,
  symptomAnswers: {} as Record<string, string>,
  language: 'en' as SupportedLanguage,
  journeyStartTime: null,
  journeyId: null,
}

export const useEmergencyStore = create<EmergencyStore>((set) => ({
  ...initialState,

  activateEmergency: () => set({
    isActive: true,
    isEmergencyMode: true,
    isVoiceActive: true,
    journeyStartTime: new Date().toISOString(),
    journeyId: `emg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    routeProgress: 0,
    symptomAnswers: {},
  }),

  deactivateEmergency: () => set({
    isActive: false,
    isEmergencyMode: false,
    isVoiceActive: false,
  }),

  setUserLocation: (location) => set({
    userLocation: location,
  }),

  setNearestFacilities: (facilities) => set({
    nearestFacilities: facilities,
  }),

  setCurrentLocation: (location) => set({
    currentLocation: location,
    userLocation: { lat: location.latitude, lng: location.longitude },
  }),

  findNearestFacilities: (location) => {
    // Fire-and-forget: fetch emergency facilities from API and update store
    fetch(`/api/facilities?lat=${location.lat}&lng=${location.lng}&hasEmergency=true&limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (data.facilities && Array.isArray(data.facilities)) {
          set({ nearestFacilities: data.facilities })
        }
      })
      .catch((error) => {
        console.error('Could not load emergency facilities:', error)
      })
  },

  setActiveView: (view) => set({
    activeView: view,
  }),

  setDestination: (facility) => set({
    destination: facility,
  }),

  updateJourney: (eta, distance, progress) => set({
    eta,
    distance,
    routeProgress: progress,
  }),

  addSymptomAnswer: (questionId, answer) => set((state) => ({
    symptomAnswers: {
      ...state.symptomAnswers,
      [questionId]: answer,
    },
  })),

  setLanguage: (lang) => set({
    language: lang,
  }),

  setEmergencyType: (type) => set({
    emergencyType: type,
  }),

  toggleVoice: (active) => set({
    isVoiceActive: active,
  }),

  reset: () => set(initialState),
}))

// Emergency questions for triage during journey
export const EMERGENCY_QUESTIONS = [
  {
    id: 'what_happened',
    question: {
      en: 'What happened?',
      pcm: 'Wetin happen?',
      yo: 'Kí ló ṣẹlẹ̀?',
      ig: 'Gịnị mere?',
      ha: 'Me ya faru?',
    },
    type: 'text' as const,
    priority: 1,
  },
  {
    id: 'is_conscious',
    question: {
      en: 'Is the person awake and conscious?',
      pcm: 'The person dey wake? E dey hear?',
      yo: 'Ṣé ẹni náà jí?',
      ig: 'Onye ahụ ọ mụrụ anya?',
      ha: 'Mutumin yana farke?',
    },
    type: 'yes_no' as const,
    priority: 2,
  },
  {
    id: 'is_breathing',
    question: {
      en: 'Is the person breathing?',
      pcm: 'The person dey breathe?',
      yo: 'Ṣé ẹni náà ń mí?',
      ig: 'Onye ahụ na-eku ume?',
      ha: 'Mutumin yana numfashi?',
    },
    type: 'yes_no' as const,
    priority: 3,
  },
  {
    id: 'has_bleeding',
    question: {
      en: 'Is there any bleeding?',
      pcm: 'Blood dey comot?',
      yo: 'Ẹ̀jẹ̀ ń jáde?',
      ig: 'Ọ na-agba ọbara?',
      ha: 'Akwai jini?',
    },
    type: 'yes_no' as const,
    priority: 4,
  },
  {
    id: 'has_chest_pain',
    question: {
      en: 'Is there chest pain?',
      pcm: 'Chest dey pain?',
      yo: 'Àyà ń dùn?',
      ig: 'Obi na-awa ụfụ?',
      ha: 'Akwai ciwon kirji?',
    },
    type: 'yes_no' as const,
    priority: 5,
  },
  {
    id: 'is_alone',
    question: {
      en: 'Are you alone with the person?',
      pcm: 'Na only you dey with the person?',
      yo: 'Ṣé ìwọ nìkan ni pẹ̀lú ẹni náà?',
      ig: 'Ị nọ naanị ya?',
      ha: 'Kana kadai tare da mutumin?',
    },
    type: 'yes_no' as const,
    priority: 6,
  },
]

// Voice prompts for emergency journey
export const VOICE_PROMPTS = {
  start: {
    en: 'Stay calm. I am here with you. I am finding the nearest hospital now.',
    pcm: 'No panic. I dey here with you. I dey find the nearest hospital now.',
    yo: 'Má yọ̀. Mo wà pẹ̀lú ẹ. Mo ń wá ilé-ìwòsàn tó sún mọ́.',
    ig: 'Dị jụụ. Anọ m ebe a. Ana m achọ ụlọ ọgwụ kacha nso.',
    ha: 'Ka yi natsuwa. Ina tare da ku. Ina neman asibitin da ke kusa.',
  },
  hospitalFound: {
    en: 'The nearest hospital is {distance} away. I have started the journey.',
    pcm: 'The hospital wey near pass na {distance}. I don start the journey.',
    yo: 'Ilé-ìwòsàn tó sún mọ́ jìnnà {distance}. Mo ti bẹ̀rẹ̀ ìrìnàjò.',
    ig: 'Ụlọ ọgwụ kacha nso dị {distance}. Amalitela njem.',
    ha: 'Asibitin da ke kusa shine {distance}. Na fara tafiya.',
  },
  progressUpdate: {
    en: 'You are {eta} minutes away. Keep going.',
    pcm: 'You remain {eta} minutes. Continue dey go.',
    yo: 'O kù ìṣẹ́jú {eta}. Máa lọ síwájú.',
    ig: 'Ị ka nwa nkeji {eta}. Gaa n\'ihu.',
    ha: 'Kuna da mintuna {eta}. Ku ci gaba.',
  },
  almostThere: {
    en: 'You are almost there. Help is close.',
    pcm: 'You don almost reach. Help dey close.',
    yo: 'O fẹ́rẹ̀ẹ́ dé. Ìrànlọ́wọ́ sún mọ́.',
    ig: 'Ị fọrọ obere. Enyemaka nọ nso.',
    ha: 'Kusan ku isa. Taimako yana kusa.',
  },
  arrived: {
    en: 'You have arrived at the hospital. Go to the emergency entrance.',
    pcm: 'You don reach the hospital. Go to emergency entrance.',
    yo: 'O ti dé ilé-ìwòsàn. Lọ sí ẹnu-ọ̀nà pàjáwìrì.',
    ig: 'Ị rutela ụlọ ọgwụ. Gaa ọnụ ụzọ mberede.',
    ha: 'Kun isa asibiti. Ku je bakin shiga na gaggawa.',
  },
  stayCalm: {
    en: 'Stay calm. You are doing great.',
    pcm: 'No panic. You dey do well.',
    yo: 'Má yọ̀. O ń ṣe dáadáa.',
    ig: 'Dị jụụ. Ị na-eme nke ọma.',
    ha: 'Ka yi natsuwa. Kuna yin kyau.',
  },
}

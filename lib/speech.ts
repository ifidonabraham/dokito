// ============================================
// AKILI HEALTH - Speech Synthesis & Recognition
// ============================================

import type { SupportedLanguage } from './types'

// Check if speech synthesis is supported
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// Check if speech recognition is supported
export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
}

// Get speech synthesis instance
export function getSpeechSynthesis(): SpeechSynthesis | null {
  if (!isSpeechSynthesisSupported()) return null
  return window.speechSynthesis
}

// Language codes for speech
const SPEECH_LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  en: 'en-NG', // English (Nigeria)
  pcm: 'en-NG', // Nigerian Pidgin (use English voice)
  yo: 'yo-NG', // Yoruba (Nigeria)
  ig: 'ig-NG', // Igbo (Nigeria)
  ha: 'ha-NG', // Hausa (Nigeria)
}

// Fallback language codes if Nigerian voices not available
const FALLBACK_LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  en: 'en-US',
  pcm: 'en-US',
  yo: 'en-US',
  ig: 'en-US',
  ha: 'en-US',
}

// Get voice for language
export function getVoiceForLanguage(lang: SupportedLanguage): SpeechSynthesisVoice | null {
  const synthesis = getSpeechSynthesis()
  if (!synthesis) return null

  const voices = synthesis.getVoices()
  const primaryCode = SPEECH_LANGUAGE_CODES[lang]
  const fallbackCode = FALLBACK_LANGUAGE_CODES[lang]

  // Try to find Nigerian voice first
  let voice = voices.find((v) => v.lang.startsWith(primaryCode.split('-')[0]))
  
  // Fall back to any English voice
  if (!voice) {
    voice = voices.find((v) => v.lang.startsWith(fallbackCode.split('-')[0]))
  }

  // Fall back to first available voice
  return voice || voices[0] || null
}

// Speak text
export function speak(
  text: string,
  lang: SupportedLanguage = 'en',
  options?: {
    rate?: number
    pitch?: number
    volume?: number
    onEnd?: () => void
    onError?: (error: SpeechSynthesisErrorEvent) => void
  }
): SpeechSynthesisUtterance | null {
  const synthesis = getSpeechSynthesis()
  if (!synthesis) return null

  // Cancel any ongoing speech
  synthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options?.rate ?? 0.9 // Slightly slower for clarity
  utterance.pitch = options?.pitch ?? 1
  utterance.volume = options?.volume ?? 1

  const voice = getVoiceForLanguage(lang)
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  }

  if (options?.onEnd) {
    utterance.onend = options.onEnd
  }

  if (options?.onError) {
    utterance.onerror = options.onError
  }

  synthesis.speak(utterance)
  return utterance
}

// Stop speaking
export function stopSpeaking(): void {
  const synthesis = getSpeechSynthesis()
  if (synthesis) {
    synthesis.cancel()
  }
}

// Pause speaking
export function pauseSpeaking(): void {
  const synthesis = getSpeechSynthesis()
  if (synthesis) {
    synthesis.pause()
  }
}

// Resume speaking
export function resumeSpeaking(): void {
  const synthesis = getSpeechSynthesis()
  if (synthesis) {
    synthesis.resume()
  }
}

// Check if currently speaking
export function isSpeaking(): boolean {
  const synthesis = getSpeechSynthesis()
  return synthesis?.speaking ?? false
}

type BrowserSpeechRecognitionErrorEvent = Event & { error?: string }
type BrowserSpeechRecognitionEvent = Event & {
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: { transcript: string }
    }
  }
}
type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  lang: string
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

// Speech Recognition wrapper
export class SpeechRecognizer {
  private recognition: BrowserSpeechRecognition | null = null
  private isListening: boolean = false

  constructor() {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = getSpeechRecognitionConstructor()
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.maxAlternatives = 1
    }
  }

  setLanguage(lang: SupportedLanguage): void {
    if (!this.recognition) return
    this.recognition.lang = SPEECH_LANGUAGE_CODES[lang]
  }

  start(callbacks: {
    onResult?: (text: string, isFinal: boolean) => void
    onEnd?: () => void
    onError?: (error: BrowserSpeechRecognitionErrorEvent) => void
  }): boolean {
    if (!this.recognition || this.isListening) return false

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      const text = result[0].transcript
      callbacks.onResult?.(text, result.isFinal)
    }

    this.recognition.onend = () => {
      this.isListening = false
      callbacks.onEnd?.()
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      callbacks.onError?.(event)
    }

    try {
      this.recognition.start()
      this.isListening = true
      return true
    } catch {
      return false
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort()
      this.isListening = false
    }
  }

  get listening(): boolean {
    return this.isListening
  }
}

function getSpeechRecognitionConstructor(): BrowserSpeechRecognitionConstructor {
  const speechWindow = window as Window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition as BrowserSpeechRecognitionConstructor
}

// Create singleton recognizer instance
let recognizerInstance: SpeechRecognizer | null = null

export function getSpeechRecognizer(): SpeechRecognizer {
  if (!recognizerInstance) {
    recognizerInstance = new SpeechRecognizer()
  }
  return recognizerInstance
}

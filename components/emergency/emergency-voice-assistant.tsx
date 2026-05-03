'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEmergencyStore, VOICE_PROMPTS, EMERGENCY_QUESTIONS } from '@/stores/emergency-store'
import { speak, stopSpeaking, isSpeechSynthesisSupported, getSpeechRecognizer } from '@/lib/speech'
import { detectLanguage } from '@/lib/language-detection'
import { formatDistance } from '@/lib/maps'
import type { SupportedLanguage } from '@/lib/types'

interface EmergencyVoiceAssistantProps {
  onUserResponse?: (response: string) => void
}

export function EmergencyVoiceAssistant({ onUserResponse }: EmergencyVoiceAssistantProps) {
  const {
    isActive,
    isVoiceActive,
    language,
    destination,
    eta,
    distance,
    routeProgress,
    setLanguage,
    toggleVoice,
    addSymptomAnswer,
  } = useEmergencyStore()

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [transcript, setTranscript] = useState('')
  const lastEtaRef = useRef<number | null>(null)
  const hasSpokenIntroRef = useRef(false)

  // Speak a message in the current language
  const speakMessage = useCallback((message: string, onEnd?: () => void) => {
    if (!isSpeechSynthesisSupported() || !isVoiceActive) return

    setIsSpeaking(true)
    speak(message, language, {
      rate: 0.9,
      onEnd: () => {
        setIsSpeaking(false)
        onEnd?.()
      },
    })
  }, [language, isVoiceActive])

  // Start listening for user response
  const startListening = useCallback(() => {
    const recognizer = getSpeechRecognizer()
    recognizer.setLanguage(language)
    
    const success = recognizer.start({
      onResult: (text, isFinal) => {
        setTranscript(text)
        if (isFinal) {
          // Detect language from user input
          const detectedLang = detectLanguage(text)
          if (detectedLang !== language && detectedLang !== 'en') {
            setLanguage(detectedLang)
          }
          
          // Handle the response
          onUserResponse?.(text)
          
          // Store the answer for current question
          const currentQuestion = EMERGENCY_QUESTIONS[currentQuestionIndex]
          if (currentQuestion) {
            addSymptomAnswer(currentQuestion.id, text)
            setCurrentQuestionIndex((prev) => prev + 1)
          }
        }
      },
      onEnd: () => {
        setIsListening(false)
      },
      onError: () => {
        setIsListening(false)
      },
    })

    if (success) {
      setIsListening(true)
    }
  }, [language, currentQuestionIndex, onUserResponse, addSymptomAnswer, setLanguage])

  // Stop listening
  const stopListening = useCallback(() => {
    const recognizer = getSpeechRecognizer()
    recognizer.stop()
    setIsListening(false)
  }, [])

  // Toggle voice assistant
  const handleToggleVoice = () => {
    if (isVoiceActive) {
      stopSpeaking()
      stopListening()
    }
    toggleVoice(!isVoiceActive)
  }

  // Toggle listening
  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Initial greeting when emergency starts
  useEffect(() => {
    if (isActive && isVoiceActive && !hasSpokenIntroRef.current) {
      hasSpokenIntroRef.current = true
      const intro = VOICE_PROMPTS.start[language]
      speakMessage(intro, () => {
        // After intro, start listening
        setTimeout(startListening, 500)
      })
    }
  }, [isActive, isVoiceActive, language, speakMessage, startListening])

  // Announce hospital found
  useEffect(() => {
    if (destination && isVoiceActive && distance) {
      const distanceStr = formatDistance(distance)
      const message = VOICE_PROMPTS.hospitalFound[language].replace('{distance}', distanceStr)
      speakMessage(message)
    }
  }, [destination, distance, language, isVoiceActive, speakMessage])

  // Progress updates
  useEffect(() => {
    if (!isVoiceActive || eta === null) return

    // Announce ETA changes
    if (lastEtaRef.current !== null && eta !== lastEtaRef.current) {
      const etaDiff = lastEtaRef.current - eta
      
      if (eta <= 2 && lastEtaRef.current > 2) {
        speakMessage(VOICE_PROMPTS.almostThere[language])
      } else if (etaDiff >= 2) {
        const message = VOICE_PROMPTS.progressUpdate[language].replace('{eta}', String(eta))
        speakMessage(message)
      }
    }
    lastEtaRef.current = eta

    // Announce arrival
    if (routeProgress >= 95 && eta <= 1) {
      speakMessage(VOICE_PROMPTS.arrived[language])
    }
  }, [eta, routeProgress, language, isVoiceActive, speakMessage])

  // Ask next emergency question
  useEffect(() => {
    if (!isVoiceActive || isSpeaking || isListening) return
    
    const question = EMERGENCY_QUESTIONS[currentQuestionIndex]
    if (question) {
      const questionText = question.question[language]
      setTimeout(() => {
        speakMessage(questionText, () => {
          setTimeout(startListening, 300)
        })
      }, 2000)
    }
  }, [currentQuestionIndex, isVoiceActive, isSpeaking, isListening, language, speakMessage, startListening])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking()
      stopListening()
    }
  }, [stopListening])

  // Reset when emergency ends
  useEffect(() => {
    if (!isActive) {
      hasSpokenIntroRef.current = false
      setCurrentQuestionIndex(0)
      setTranscript('')
      stopSpeaking()
      stopListening()
    }
  }, [isActive, stopListening])

  if (!isActive) return null

  return (
    <div className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
      {/* Voice Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isSpeaking ? 'bg-accent animate-pulse' : isListening ? 'bg-success animate-pulse' : 'bg-muted'}`} />
          <span className="text-sm font-medium">
            {isSpeaking ? 'Dokita is speaking...' : isListening ? 'Listening...' : 'Voice Assistant'}
          </span>
        </div>
        
        {/* Mute/Unmute */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleVoice}
          className="h-8 w-8"
        >
          {isVoiceActive ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Voice Visualization */}
      {(isSpeaking || isListening) && (
        <div className="flex items-center justify-center gap-1 h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full voice-wave"
              style={{
                height: `${12 + Math.random() * 12}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-2">
          <span className="font-medium">You said: </span>
          {transcript}
        </div>
      )}

      {/* Microphone Toggle */}
      <Button
        variant={isListening ? 'default' : 'outline'}
        onClick={handleToggleListening}
        disabled={isSpeaking}
        className="gap-2"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4" />
            Stop Listening
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Tap to Speak
          </>
        )}
      </Button>

      {/* Current Question */}
      {EMERGENCY_QUESTIONS[currentQuestionIndex] && (
        <p className="text-sm text-center text-muted-foreground">
          Question: {EMERGENCY_QUESTIONS[currentQuestionIndex].question[language]}
        </p>
      )}
    </div>
  )
}

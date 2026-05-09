'use client'

import { useState, useCallback, useEffect } from 'react'

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  continuous?: boolean
  language?: string
}

interface UseVoiceInputReturn {
  isListening: boolean
  isSupported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onResult, onError, continuous = false, language = 'en-US' } = options
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition || 
        window.SpeechRecognition

      if (SpeechRecognition) {
        setIsSupported(true)
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = continuous
        recognitionInstance.interimResults = true
        recognitionInstance.lang = language

        recognitionInstance.onstart = () => {
          setIsListening(true)
        }

        recognitionInstance.onend = () => {
          setIsListening(false)
        }

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex
          const result = event.results[current]
          const transcriptValue = result[0].transcript

          if (result.isFinal) {
            setTranscript(transcriptValue)
            onResult?.(transcriptValue)
          } else {
            setTranscript(transcriptValue)
          }
        }

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          setIsListening(false)
          const errorMessage = event.error === 'not-allowed' 
            ? 'Microphone access denied. Please enable microphone permissions.'
            : `Speech recognition error: ${event.error}`
          onError?.(errorMessage)
        }

        setRecognition(recognitionInstance)
      }
    }
  }, [continuous, language, onResult, onError])

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      setTranscript('')
      try {
        recognition.start()
      } catch (error) {
        // Recognition might already be started
        console.error('Speech recognition start error:', error)
      }
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }, [recognition, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  }
}

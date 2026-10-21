import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typings for the Web Speech API (not in lib.dom for every TS version)
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } }
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> }
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

function getCtor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as (new () => Recognition) | null
}

/** Fallback engine: the browser's built-in speech recognition (Chrome / Edge). */
export function useBrowserSpeech(lang: string) {
  const [supported, setSupported] = useState(true)
  const [listening, setListening] = useState(false)
  const [finalText, setFinalText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<Recognition | null>(null)
  const wantRef = useRef(false)

  useEffect(() => setSupported(!!getCtor()), [])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return setSupported(false)
    setError(null)
    setFinalText('')
    setInterimText('')

    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = (e) => {
      let interim = ''
      let committed = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) committed += r[0].transcript + ' '
        else interim += r[0].transcript
      }
      if (committed) setFinalText((t) => (t + committed).replace(/\s+/g, ' '))
      setInterimText(interim)
    }
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return
      setError(e.error === 'not-allowed' ? 'Microphone permission denied' : `Speech error: ${e.error}`)
      wantRef.current = false
    }
    // Browsers end the session after silence; restart while the user is still recording
    rec.onend = () => {
      if (wantRef.current) {
        try {
          rec.start()
          return
        } catch {
          /* fall through */
        }
      }
      setListening(false)
      setInterimText('')
    }

    recRef.current = rec
    wantRef.current = true
    rec.start()
    setListening(true)
  }, [lang])

  const stop = useCallback(() => {
    wantRef.current = false
    recRef.current?.stop()
    setListening(false)
  }, [])

  useEffect(() => () => {
    wantRef.current = false
    recRef.current?.abort()
  }, [])

  return { supported, listening, finalText, interimText, error, start, stop, setFinalText }
}

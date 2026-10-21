import { useCallback, useEffect, useRef, useState } from 'react'
import { liveApi } from '#/api/live'
import { PCM_MIME, startPcmCapture } from '../lib/pcm'

type LiveSession = { sendRealtimeInput: (input: object) => void; close: () => void }

/**
 * Streams microphone audio to Gemini Live (transcription model) and exposes the transcript as it arrives.
 * The browser authenticates with a short-lived token from the Express API, never the real API key.
 */
export function useGeminiLive() {
  const [listening, setListening] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [finalText, setFinalText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sessionRef = useRef<LiveSession | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const releaseMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    void ctxRef.current?.close().catch(() => {})
    streamRef.current = null
    ctxRef.current = null
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setFinalText('')
    setInterimText('')
    setConnecting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
      streamRef.current = stream

      const [{ token, model }, { GoogleGenAI, Modality }] = await Promise.all([liveApi.token(), import('@google/genai')])
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } })

      sessionRef.current = await ai.live.connect({
        model,
        config: { responseModalities: [Modality.TEXT], inputAudioTranscription: {} },
        callbacks: {
          onmessage: (msg) => {
            const sc = msg.serverContent
            if (sc?.interimInputTranscription?.text) setInterimText(sc.interimInputTranscription.text)
            const committed = sc?.inputTranscription?.text?.trim()
            if (committed) {
              setFinalText((t) => (t ? `${t} ${committed}` : committed))
              setInterimText('')
            }
          },
          onerror: (e) => setError(`Gemini error: ${e.message || 'connection failed'}`),
          onclose: (e) => {
            if (e.code !== 1000 && e.reason) setError(`Gemini closed the session: ${e.reason}`)
            setListening(false)
            releaseMic()
          },
        },
      })

      ctxRef.current = await startPcmCapture(stream, (data) => {
        sessionRef.current?.sendRealtimeInput({ audio: { data, mimeType: PCM_MIME } })
      })
      setListening(true)
    } catch (e) {
      const err = e as Error
      setError(err.name === 'NotAllowedError' ? 'Microphone permission denied' : err.message || 'Could not start Gemini Live')
      sessionRef.current?.close()
      sessionRef.current = null
      releaseMic()
    } finally {
      setConnecting(false)
    }
  }, [releaseMic])

  const stop = useCallback(() => {
    const session = sessionRef.current
    releaseMic()
    if (session) {
      session.sendRealtimeInput({ audioStreamEnd: true })
      // give Gemini a moment to flush the last words before closing
      setTimeout(() => session.close(), 1500)
    }
    sessionRef.current = null
    setListening(false)
  }, [releaseMic])

  useEffect(
    () => () => {
      sessionRef.current?.close()
      releaseMic()
    },
    [releaseMic],
  )

  return { listening, connecting, finalText, interimText, error, start, stop, setFinalText }
}

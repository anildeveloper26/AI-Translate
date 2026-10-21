import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '#/lib/api'

// Captures mic audio as 16 kHz mono 16-bit PCM in ~100 ms chunks (what Gemini Live expects)
const WORKLET = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() { super(); this.buf = new Int16Array(1600); this.n = 0; }
  process(inputs) {
    const ch = inputs[0][0];
    if (ch) for (let i = 0; i < ch.length; i++) {
      const s = Math.max(-1, Math.min(1, ch[i]));
      this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
      if (this.n === this.buf.length) { this.port.postMessage(this.buf.buffer.slice(0)); this.n = 0; }
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);
`

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(bin)
}

type LiveSession = { sendRealtimeInput: (input: object) => void; close: () => void }

/**
 * Streams microphone audio to Gemini Live (transcription model) and exposes the transcript as it arrives.
 * The browser authenticates with a short-lived token from our Express API, never the real API key.
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

  const cleanup = useCallback(() => {
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

      const [{ token, model }, { GoogleGenAI, Modality }] = await Promise.all([api.liveToken(), import('@google/genai')])
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } })

      const session = await ai.live.connect({
        model,
        config: { responseModalities: [Modality.TEXT], inputAudioTranscription: {} },
        callbacks: {
          onmessage: (msg) => {
            const sc = msg.serverContent
            if (sc?.interimInputTranscription?.text) setInterimText(sc.interimInputTranscription.text)
            const committed = sc?.inputTranscription?.text
            if (committed) {
              setFinalText((t) => (t ? `${t} ${committed.trim()}` : committed.trim()))
              setInterimText('')
            }
          },
          onerror: (e) => setError(`Gemini error: ${e.message || 'connection failed'}`),
          onclose: (e) => {
            if (e.code !== 1000 && e.reason) setError(`Gemini closed the session: ${e.reason}`)
            setListening(false)
            cleanup()
          },
        },
      })
      sessionRef.current = session

      const ctx = new AudioContext({ sampleRate: 16000 })
      ctxRef.current = ctx
      const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }))
      await ctx.audioWorklet.addModule(url)
      URL.revokeObjectURL(url)
      const node = new AudioWorkletNode(ctx, 'pcm-capture')
      node.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        sessionRef.current?.sendRealtimeInput({ audio: { data: toBase64(e.data), mimeType: 'audio/pcm;rate=16000' } })
      }
      ctx.createMediaStreamSource(stream).connect(node)

      setListening(true)
    } catch (e) {
      const err = e as Error
      setError(err.name === 'NotAllowedError' ? 'Microphone permission denied' : err.message || 'Could not start Gemini Live')
      sessionRef.current?.close()
      sessionRef.current = null
      cleanup()
    } finally {
      setConnecting(false)
    }
  }, [cleanup])

  const stop = useCallback(() => {
    const session = sessionRef.current
    cleanup()
    if (session) {
      session.sendRealtimeInput({ audioStreamEnd: true })
      // give Gemini a moment to flush the last words before closing
      setTimeout(() => session.close(), 1500)
    }
    sessionRef.current = null
    setListening(false)
  }, [cleanup])

  useEffect(() => () => {
    sessionRef.current?.close()
    cleanup()
  }, [cleanup])

  return { listening, connecting, finalText, interimText, error, start, stop, setFinalText }
}

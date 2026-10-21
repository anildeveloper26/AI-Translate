import { languageLabel } from '#/constants/languages'
import type { Transcription } from '#/types/transcription'

export const formatClock = (ms: number) => {
  const secs = Math.floor(ms / 1000)
  return `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`
}

export const engineLabel = (engine: Transcription['engine']) => (engine === 'gemini' ? 'Gemini Live' : 'Browser')

/** "21/10/2026, 14:44 · Hindi + English · Gemini Live · 24s" */
export const transcriptionMeta = (t: Transcription) =>
  [new Date(t.created_at).toLocaleString(), languageLabel(t.language), engineLabel(t.engine), `${Math.round(t.duration_ms / 1000)}s`].join(' · ')

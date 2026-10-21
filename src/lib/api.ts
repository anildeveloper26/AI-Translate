export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

export type Transcription = {
  id: number
  title: string
  content: string
  language: string
  engine: 'gemini' | 'browser'
  duration_ms: number
  created_at: string
  updated_at: string
}

export type TranscriptionList = { items: Array<Transcription>; total: number }

export type NewTranscription = {
  content: string
  title?: string
  language: string
  engine: Transcription['engine']
  duration_ms: number
}

export type TranscriptionPatch = Partial<Pick<Transcription, 'title' | 'content' | 'language'>>

export const LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi + English (Hinglish)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'bn-IN', label: 'Bengali' },
] as const

export const languageLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
  return body as T
}

export const api = {
  list: (q = '') => request<TranscriptionList>(`/api/transcriptions?q=${encodeURIComponent(q)}`),
  get: (id: number) => request<Transcription>(`/api/transcriptions/${id}`),
  create: (data: NewTranscription) =>
    request<Transcription>('/api/transcriptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: TranscriptionPatch) =>
    request<Transcription>(`/api/transcriptions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`/api/transcriptions/${id}`, { method: 'DELETE' }),
  liveToken: () => request<{ token: string; model: string }>('/api/live/token', { method: 'POST' }),
}

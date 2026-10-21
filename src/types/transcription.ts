export type Engine = 'gemini' | 'browser'

export type Transcription = {
  id: number
  title: string
  content: string
  language: string
  engine: Engine
  duration_ms: number
  created_at: string
  updated_at: string
}

export type TranscriptionList = { items: Array<Transcription>; total: number }

export type NewTranscription = {
  content: string
  title?: string
  language: string
  engine: Engine
  duration_ms: number
}

export type TranscriptionPatch = Partial<Pick<Transcription, 'title' | 'content' | 'language'>>

export type LiveToken = { token: string; model: string; expiresAt: string }

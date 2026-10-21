import { request } from './client'
import type { NewTranscription, Transcription, TranscriptionList, TranscriptionPatch } from '#/types/transcription'

const BASE = '/api/transcriptions'

export const transcriptionsApi = {
  list: (q = '') => request<TranscriptionList>(`${BASE}?q=${encodeURIComponent(q)}`),
  get: (id: number) => request<Transcription>(`${BASE}/${id}`),
  create: (data: NewTranscription) => request<Transcription>(BASE, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: TranscriptionPatch) =>
    request<Transcription>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: number) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}

import { request } from './client'
import type { LiveToken } from '#/types/transcription'

export const liveApi = {
  /** Short-lived, single-use Gemini Live token minted by the backend. */
  token: () => request<LiveToken>('/api/live/token', { method: 'POST' }),
}

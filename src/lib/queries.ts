import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { NewTranscription, TranscriptionPatch } from './api'

export const transcriptionKeys = {
  all: ['transcriptions'] as const,
  list: (q: string) => [...transcriptionKeys.all, 'list', q] as const,
  detail: (id: number) => [...transcriptionKeys.all, 'detail', id] as const,
}

export const transcriptionsQuery = (q = '') =>
  queryOptions({
    queryKey: transcriptionKeys.list(q),
    queryFn: () => api.list(q),
    staleTime: 10_000,
  })

export const transcriptionQuery = (id: number) =>
  queryOptions({
    queryKey: transcriptionKeys.detail(id),
    queryFn: () => api.get(id),
  })

export function useCreateTranscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: NewTranscription) => api.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transcriptionKeys.all }),
  })
}

export function useUpdateTranscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TranscriptionPatch }) => api.update(id, data),
    onSuccess: (t) => {
      qc.setQueryData(transcriptionKeys.detail(t.id), t)
      return qc.invalidateQueries({ queryKey: [...transcriptionKeys.all, 'list'] })
    },
  })
}

export function useDeleteTranscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.remove(id),
    onSuccess: (_d, id) => {
      qc.removeQueries({ queryKey: transcriptionKeys.detail(id) })
      return qc.invalidateQueries({ queryKey: [...transcriptionKeys.all, 'list'] })
    },
  })
}

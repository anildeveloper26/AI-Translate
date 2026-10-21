import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transcriptionsApi } from '#/api/transcriptions'
import { transcriptionKeys } from './queries'
import type { NewTranscription, TranscriptionPatch } from '#/types/transcription'

export function useCreateTranscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: NewTranscription) => transcriptionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: transcriptionKeys.lists() }),
  })
}

export function useUpdateTranscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TranscriptionPatch }) => transcriptionsApi.update(id, data),
    onSuccess: (t) => {
      qc.setQueryData(transcriptionKeys.detail(t.id), t)
      return qc.invalidateQueries({ queryKey: transcriptionKeys.lists() })
    },
  })
}

export function useDeleteTranscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => transcriptionsApi.remove(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: transcriptionKeys.detail(id) })
      return qc.invalidateQueries({ queryKey: transcriptionKeys.lists() })
    },
  })
}

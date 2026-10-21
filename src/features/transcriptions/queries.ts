import { queryOptions } from '@tanstack/react-query'
import { transcriptionsApi } from '#/api/transcriptions'

export const transcriptionKeys = {
  all: ['transcriptions'] as const,
  lists: () => [...transcriptionKeys.all, 'list'] as const,
  list: (q: string) => [...transcriptionKeys.lists(), q] as const,
  detail: (id: number) => [...transcriptionKeys.all, 'detail', id] as const,
}

export const transcriptionsQuery = (q = '') =>
  queryOptions({
    queryKey: transcriptionKeys.list(q),
    queryFn: () => transcriptionsApi.list(q),
    staleTime: 10_000,
  })

export const transcriptionQuery = (id: number) =>
  queryOptions({
    queryKey: transcriptionKeys.detail(id),
    queryFn: () => transcriptionsApi.get(id),
  })

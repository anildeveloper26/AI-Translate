import { createFileRoute } from '@tanstack/react-router'
import { TranscriptionDetailError, TranscriptionDetailPage } from '#/features/transcriptions/pages/TranscriptionDetailPage'
import { transcriptionQuery } from '#/features/transcriptions/queries'

export const Route = createFileRoute('/history/$id')({
  params: {
    parse: (p) => ({ id: Number(p.id) }),
    stringify: (p) => ({ id: String(p.id) }),
  },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(transcriptionQuery(params.id)),
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? 'Transcription'} · AI Translate` }] }),
  errorComponent: TranscriptionDetailError,
  component: TranscriptionDetailPage,
})

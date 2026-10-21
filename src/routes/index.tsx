import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '#/features/home/pages/HomePage'
import { transcriptionsQuery } from '#/features/transcriptions/queries'

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(transcriptionsQuery()),
  component: HomePage,
})

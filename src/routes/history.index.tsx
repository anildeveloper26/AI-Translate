import { createFileRoute } from '@tanstack/react-router'
import { HistoryPage } from '#/features/transcriptions/pages/HistoryPage'
import { transcriptionsQuery } from '#/features/transcriptions/queries'

type HistorySearch = { q?: string }

export const Route = createFileRoute('/history/')({
  validateSearch: (search: Record<string, unknown>): HistorySearch => ({
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? '' }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(transcriptionsQuery(deps.q)),
  head: () => ({ meta: [{ title: 'History · AI Translate' }] }),
  component: HistoryPage,
})

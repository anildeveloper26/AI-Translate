import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { TranscriptionRow } from '../components/TranscriptionRow'
import { transcriptionsQuery } from '../queries'

const route = getRouteApi('/history/')
const SEARCH_DEBOUNCE_MS = 300

export function HistoryPage() {
  const { q = '' } = route.useSearch()
  const navigate = route.useNavigate()
  const [input, setInput] = useState(q)
  const list = useQuery({ ...transcriptionsQuery(q), placeholderData: keepPreviousData })

  // Debounce the search box into the URL (?q=) so searches are shareable and survive reloads
  useEffect(() => {
    const t = setTimeout(() => {
      if (input !== q) void navigate({ search: { q: input || undefined }, replace: true })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [input, q, navigate])

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">Transcription history</h1>
        {list.data && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{list.data.total}</span>
        )}
        {list.isFetching && <span className="text-xs text-zinc-400">Updating…</span>}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search title or text…"
          className="ml-auto w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm sm:w-64 dark:border-zinc-700"
        />
      </div>

      {list.isPending && <p className="text-sm text-zinc-500">Loading…</p>}
      {list.error && <p className="text-sm text-red-600">{list.error.message}</p>}
      {list.data?.items.length === 0 && <p className="text-sm text-zinc-500">{q ? `No results for “${q}”.` : 'No transcriptions yet.'}</p>}

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {list.data?.items.map((t) => <TranscriptionRow key={t.id} t={t} />)}
      </ul>
    </section>
  )
}

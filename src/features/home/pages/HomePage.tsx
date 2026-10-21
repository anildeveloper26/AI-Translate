import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Recorder } from '#/features/recorder/components/Recorder'
import { TranscriptionRow } from '#/features/transcriptions/components/TranscriptionRow'
import { transcriptionsQuery } from '#/features/transcriptions/queries'

const RECENT_COUNT = 5

export function HomePage() {
  const recent = useQuery(transcriptionsQuery())

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Real-time Speech to Text</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Speak in Hindi, English or both. Gemini Live transcribes as you talk; save it and manage your history.
        </p>
      </header>

      <Recorder />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent transcriptions</h2>
          <Link to="/history" className="text-sm font-medium text-indigo-600 hover:underline">
            View all{recent.data ? ` (${recent.data.total})` : ''} →
          </Link>
        </div>
        {recent.isPending && <p className="text-sm text-zinc-500">Loading…</p>}
        {recent.error && <p className="text-sm text-red-600">{recent.error.message}</p>}
        {recent.data?.items.length === 0 && <p className="text-sm text-zinc-500">No transcriptions yet.</p>}
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {recent.data?.items.slice(0, RECENT_COUNT).map((t) => <TranscriptionRow key={t.id} t={t} />)}
        </ul>
      </section>
    </div>
  )
}

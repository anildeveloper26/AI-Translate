import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { languageLabel } from '#/lib/api'
import { transcriptionQuery, useDeleteTranscription } from '#/lib/queries'
import { speak } from '#/components/TranscriptionRow'

export const Route = createFileRoute('/history/$id')({
  params: {
    parse: (p) => ({ id: Number(p.id) }),
    stringify: (p) => ({ id: String(p.id) }),
  },
  loader: ({ context, params }) => context.queryClient.ensureQueryData(transcriptionQuery(params.id)),
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.title ?? 'Transcription'} · AI Translate` }] }),
  errorComponent: ({ error }) => (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <Link to="/history" className="text-sm text-indigo-600 hover:underline">
        ← Back to history
      </Link>
      <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : "Something went wrong"}</p>
    </div>
  ),
  component: Detail,
})

function Detail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: t, isPending, error } = useQuery(transcriptionQuery(id))
  const remove = useDeleteTranscription()

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <Link to="/history" className="text-sm text-indigo-600 hover:underline">
        ← Back to history
      </Link>
      {isPending && <p className="mt-4 text-sm text-zinc-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
      {t && (
        <div className="mt-4 space-y-3">
          <h1 className="text-xl font-semibold">{t.title}</h1>
          <p className="text-xs text-zinc-500">
            {new Date(t.created_at).toLocaleString()} · {languageLabel(t.language)} · {t.engine === 'gemini' ? 'Gemini Live' : 'Browser'} ·{' '}
            {Math.round(t.duration_ms / 1000)}s
          </p>
          <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{t.content}</p>
          <div className="flex gap-2 pt-2 text-sm">
            <button onClick={() => speak(t)} className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
              ▶ Play
            </button>
            <button
              onClick={() =>
                window.confirm('Delete this transcription?') &&
                remove.mutate(t.id, { onSuccess: () => navigate({ to: '/history' }) })
              }
              className="rounded-lg border border-red-300 px-3 py-1.5 text-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

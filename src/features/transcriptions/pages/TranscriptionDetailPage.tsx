import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { transcriptionQuery } from '../queries'
import { useDeleteTranscription } from '../mutations'
import { speak } from '#/utils/speech'
import { transcriptionMeta } from '#/utils/format'

const route = getRouteApi('/history/$id')

export function TranscriptionDetailPage() {
  const { id } = route.useParams()
  const navigate = useNavigate()
  const { data: t, isPending, error } = useQuery(transcriptionQuery(id))
  const remove = useDeleteTranscription()

  function onDelete() {
    if (!t || !window.confirm('Delete this transcription?')) return
    remove.mutate(t.id, { onSuccess: () => navigate({ to: '/history' }) })
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <BackLink />
      {isPending && <p className="mt-4 text-sm text-zinc-500">Loading…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error.message}</p>}
      {t && (
        <div className="mt-4 space-y-3">
          <h1 className="text-xl font-semibold">{t.title}</h1>
          <p className="text-xs text-zinc-500">{transcriptionMeta(t)}</p>
          <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{t.content}</p>
          <div className="flex gap-2 pt-2 text-sm">
            <button onClick={() => speak(t.content, t.language)} className="rounded-lg border border-zinc-300 px-3 py-1.5 dark:border-zinc-700">
              ▶ Play
            </button>
            <button onClick={onDelete} disabled={remove.isPending} className="rounded-lg border border-red-300 px-3 py-1.5 text-red-600 disabled:opacity-50">
              Delete
            </button>
          </div>
          {remove.error && <p className="text-sm text-red-600">{remove.error.message}</p>}
        </div>
      )}
    </section>
  )
}

export function TranscriptionDetailError({ error }: { error: unknown }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <BackLink />
      <p className="mt-4 text-sm text-red-600">{error instanceof Error ? error.message : 'Something went wrong'}</p>
    </section>
  )
}

function BackLink() {
  return (
    <Link to="/history" className="text-sm text-indigo-600 hover:underline">
      ← Back to history
    </Link>
  )
}

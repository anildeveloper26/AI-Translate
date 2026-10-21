import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useDeleteTranscription, useUpdateTranscription } from '../mutations'
import { speak } from '#/utils/speech'
import { transcriptionMeta } from '#/utils/format'
import type { Transcription } from '#/types/transcription'

export function TranscriptionRow({ t }: { t: Transcription }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(t.title)
  const [content, setContent] = useState(t.content)
  const update = useUpdateTranscription()
  const remove = useDeleteTranscription()

  function save() {
    update.mutate({ id: t.id, data: { title, content } }, { onSuccess: () => setEditing(false) })
  }

  function cancel() {
    setEditing(false)
    setTitle(t.title)
    setContent(t.content)
  }

  const error = update.error?.message || remove.error?.message

  return (
    <li className="py-4">
      {editing ? (
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm font-medium dark:border-zinc-700"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={update.isPending}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancel} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
          <div className="min-w-0 flex-1">
            <Link to="/history/$id" params={{ id: t.id }} className="font-medium hover:text-indigo-600">
              {t.title}
            </Link>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">{t.content}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {transcriptionMeta(t)}
              {t.updated_at !== t.created_at && ' · edited'}
            </p>
          </div>
          <div className="flex shrink-0 gap-1 text-sm">
            <button
              onClick={() => speak(t.content, t.language)}
              className="rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              title="Read aloud"
            >
              ▶ Play
            </button>
            <button onClick={() => setEditing(true)} className="rounded-md px-2 py-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-800">
              Edit
            </button>
            <button
              onClick={() => window.confirm('Delete this transcription?') && remove.mutate(t.id)}
              disabled={remove.isPending}
              className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-zinc-800"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </li>
  )
}

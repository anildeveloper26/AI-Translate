import { useEffect, useRef, useState } from 'react'
import { useGeminiLive } from '#/hooks/useGeminiLive'
import { useBrowserSpeech } from '#/hooks/useBrowserSpeech'
import { LANGUAGES } from '#/lib/api'
import { useCreateTranscription } from '#/lib/queries'

type Engine = 'gemini' | 'browser'

export function Recorder() {
  const [engine, setEngine] = useState<Engine>('gemini')
  const [lang, setLang] = useState('hi-IN')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [saved, setSaved] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const gemini = useGeminiLive()
  const browser = useBrowserSpeech(lang)
  const sr = engine === 'gemini' ? gemini : browser
  const create = useCreateTranscription()

  useEffect(() => {
    if (!sr.listening || !startedAt) return
    const t = setInterval(() => setElapsed(Date.now() - startedAt), 250)
    return () => clearInterval(t)
  }, [sr.listening, startedAt])

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight })
  }, [sr.finalText, sr.interimText])

  const busy = sr.listening || gemini.connecting
  const content = `${sr.finalText} ${sr.interimText}`.trim()

  function toggle() {
    if (busy) return sr.stop()
    setSaved(false)
    create.reset()
    setElapsed(0)
    setStartedAt(Date.now())
    void sr.start()
  }

  function save() {
    if (!content) return
    create.mutate(
      { content, language: lang, engine, duration_ms: elapsed },
      {
        onSuccess: () => {
          sr.setFinalText('')
          setElapsed(0)
          setSaved(true)
        },
      },
    )
  }

  const secs = Math.floor(elapsed / 1000)
  const error = sr.error || create.error?.message

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-zinc-300 p-0.5 text-sm dark:border-zinc-700" role="radiogroup" aria-label="Engine">
          {(['gemini', 'browser'] as const).map((e) => (
            <button
              key={e}
              role="radio"
              aria-checked={engine === e}
              disabled={busy}
              onClick={() => setEngine(e)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                engine === e ? 'bg-indigo-600 text-white' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {e === 'gemini' ? 'Gemini Live' : 'Browser'}
            </button>
          ))}
        </div>

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          disabled={busy}
          className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          aria-label="Language"
          title={engine === 'gemini' ? 'Gemini detects the language automatically; this is saved as a label' : undefined}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>

        <button
          onClick={toggle}
          disabled={engine === 'browser' && !browser.supported}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
            busy ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
          } disabled:opacity-50`}
        >
          <span className={`h-2.5 w-2.5 rounded-full bg-white ${sr.listening ? 'animate-pulse' : ''}`} />
          {gemini.connecting && engine === 'gemini' ? 'Connecting…' : busy ? 'Stop' : 'Start speaking'}
        </button>

        <span className="tabular-nums text-sm text-zinc-500">
          {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
        </span>

        <button
          onClick={save}
          disabled={!content || create.isPending || busy}
          className="ml-auto rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {create.isPending ? 'Saving…' : 'Save transcription'}
        </button>
      </div>

      <div
        ref={boxRef}
        className="mt-4 h-48 overflow-y-auto rounded-xl bg-zinc-50 p-4 text-lg leading-relaxed dark:bg-zinc-950"
        aria-live="polite"
      >
        {!content && (
          <p className="text-zinc-400">
            {engine === 'browser' && !browser.supported
              ? "This browser doesn't support built-in speech recognition. Switch to Gemini Live."
              : 'Press “Start speaking” and talk — Hindi, English or a mix. Words appear here in real time.'}
          </p>
        )}
        <span>{sr.finalText}</span> <span className="text-zinc-400">{sr.interimText}</span>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {saved && !error && <p className="mt-2 text-sm text-emerald-600">Saved to history.</p>}
    </section>
  )
}

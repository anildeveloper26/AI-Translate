import { HeadContent, Link, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'AI Translate · Real-time Speech to Text' },
      { name: 'description', content: 'Real-time multilingual (Hindi + English) speech-to-text with transcription history' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <p className="text-lg font-semibold">Page not found</p>
      <Link to="/" className="mt-2 inline-block text-indigo-600 hover:underline">
        Go home
      </Link>
    </div>
  ),
  shellComponent: RootDocument,
})

const navLink =
  'rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
            <Link to="/" className="mr-auto font-bold tracking-tight">
              🎙️ AI Translate
            </Link>
            <Link to="/" className={navLink} activeProps={{ className: 'bg-zinc-100 dark:bg-zinc-800' }} activeOptions={{ exact: true }}>
              Record
            </Link>
            <Link to="/history" className={navLink} activeProps={{ className: 'bg-zinc-100 dark:bg-zinc-800' }}>
              History
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
        <footer className="pb-6 text-center text-xs text-zinc-400">
          Built by Anil Kumar Bobba · TanStack Start · Express · PostgreSQL · Gemini Live
        </footer>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> }, TanStackQueryDevtools]}
        />
        <Scripts />
      </body>
    </html>
  )
}

import { Link } from '@tanstack/react-router'

const navLink =
  'rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
const active = { className: 'bg-zinc-100 dark:bg-zinc-800' }

export function Navbar() {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-auto font-bold tracking-tight">
          🎙️ AI Translate
        </Link>
        <Link to="/" className={navLink} activeProps={active} activeOptions={{ exact: true }}>
          Record
        </Link>
        <Link to="/history" className={navLink} activeProps={active}>
          History
        </Link>
      </div>
    </nav>
  )
}

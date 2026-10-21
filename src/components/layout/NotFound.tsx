import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-lg font-semibold">Page not found</p>
      <Link to="/" className="mt-2 inline-block text-indigo-600 hover:underline">
        Go home
      </Link>
    </div>
  )
}

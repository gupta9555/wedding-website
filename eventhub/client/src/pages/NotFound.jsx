import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="font-display text-7xl font-semibold text-primary-700">404</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-ink/60">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-6 rounded-full bg-primary-700 text-white font-semibold px-6 py-2.5 hover:bg-primary-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}

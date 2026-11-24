export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 font-semibold underline underline-offset-2 hover:text-primary-900"
        >
          Try again
        </button>
      )}
    </div>
  )
}

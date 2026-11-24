export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-primary-700">
      <div className="h-9 w-9 rounded-full border-2 border-primary-200 border-t-primary-700 animate-spin" />
      <p className="mt-3 text-sm text-ink/60">{label}</p>
    </div>
  )
}

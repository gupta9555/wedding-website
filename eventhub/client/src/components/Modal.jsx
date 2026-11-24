export default function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-ivory shadow-card p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-display text-2xl font-semibold text-primary-800">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink/40 hover:text-ink text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

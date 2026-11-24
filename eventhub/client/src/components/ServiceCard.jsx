export default function ServiceCard({ service, onBookNow, actions }) {
  return (
    <div className="rounded-2xl bg-white border border-primary-100 shadow-card overflow-hidden">
      <div className="h-32 bg-primary-50 flex items-center justify-center">
        {service.images?.[0] ? (
          <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-primary-200 font-display text-3xl">EventHub</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-ink">{service.title}</h4>
          {!service.availability && (
            <span className="text-xs rounded-full bg-ink/10 text-ink/60 px-2 py-0.5 shrink-0">Paused</span>
          )}
        </div>
        <p className="text-sm text-ink/60 mt-1 line-clamp-2">{service.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-primary-700 font-semibold">
            ₹{service.price?.toLocaleString('en-IN')}
            <span className="text-ink/40 font-normal text-xs"> / {service.pricingType}</span>
          </p>
          {onBookNow && (
            <button
              onClick={() => onBookNow(service)}
              className="rounded-full bg-primary-700 text-white text-sm font-semibold px-4 py-1.5 hover:bg-primary-800 transition-colors"
            >
              Book Now
            </button>
          )}
        </div>
        {actions && <div className="mt-3 pt-3 border-t border-primary-50 flex gap-3 text-sm">{actions}</div>}
      </div>
    </div>
  )
}

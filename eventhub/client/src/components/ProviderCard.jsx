import { Link } from 'react-router-dom'

export default function ProviderCard({ provider }) {
  const initials = (provider.businessName || '?').slice(0, 1).toUpperCase()

  return (
    <Link
      to={`/providers/${provider._id}`}
      className="group block rounded-2xl bg-white border border-primary-100 shadow-card overflow-hidden hover:-translate-y-0.5 transition-transform"
    >
      <div className="h-36 bg-gradient-to-br from-primary-700 to-primary-900 relative">
        {provider.coverImage ? (
          <img src={provider.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-200 font-display text-4xl">
            {initials}
          </div>
        )}
        {provider.categories?.[0] && (
          <span className="absolute top-3 left-3 rounded-full bg-marigold-400 text-primary-900 text-xs font-semibold px-3 py-1">
            {provider.categories[0]}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-xl font-semibold text-ink group-hover:text-primary-700 transition-colors">
          {provider.businessName}
        </h3>
        <p className="text-sm text-ink/60 mt-0.5">
          {provider.city}{provider.state ? `, ${provider.state}` : ''}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-marigold-600 font-semibold">
            ★ {provider.rating > 0 ? provider.rating.toFixed(1) : 'New'}
            {provider.numReviews > 0 && (
              <span className="text-ink/40 font-normal">({provider.numReviews})</span>
            )}
          </span>
          <span className="text-ink/50">{provider.experience || 0}+ yrs exp.</span>
        </div>
      </div>
    </Link>
  )
}

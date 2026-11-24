import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFavorites, toggleFavorite } from '../../services/advancedService.js'
import Loader from '../../components/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getFavorites()
      setFavorites(data.favorites || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load saved providers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const remove = async (providerId) => {
    await toggleFavorite(providerId)
    load()
  }

  if (loading) return <Loader />
  if (error) return <ErrorMessage message={error} onRetry={load} />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Saved Providers</h1>
      {favorites.length === 0 ? (
        <p className="text-ink/50 py-10">No saved providers yet.</p>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 gap-4">
          {favorites.map((favorite) => {
            const provider = favorite.providerId
            return (
              <div key={favorite._id} className="rounded-2xl bg-white border border-primary-100 p-5">
                <Link to={`/providers/${provider._id}`} className="font-display text-xl font-semibold text-primary-800">
                  {provider.businessName}
                </Link>
                <p className="text-sm text-ink/60 mt-1">{provider.city}, {provider.state}</p>
                <button
                  onClick={() => remove(provider._id)}
                  className="mt-4 text-sm font-semibold text-marigold-600"
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

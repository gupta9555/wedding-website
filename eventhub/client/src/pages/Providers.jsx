import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProviders } from '../services/providerService.js'
import { getCategories } from '../services/categoryService.js'
import ProviderCard from '../components/ProviderCard.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Providers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [providers, setProviders] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const search = searchParams.get('search') || ''
  const city = searchParams.get('city') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minRating = searchParams.get('minRating') || ''
  const state = searchParams.get('state') || ''
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    getCategories('provider')
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getProviders({ search, city, state, category, minRating, sort, page, limit: 9 })
        setProviders(data.providers || [])
        setPagination(data.pagination)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load providers right now.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [search, city, state, category, minRating, sort, page])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-4xl font-semibold text-ink">Find Providers</h1>
      <p className="text-ink/60 mt-1">Browse trusted event professionals near you.</p>

      <div className="mt-6 grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <input
          type="text"
          placeholder="Search by name…"
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
          onBlur={(e) => updateParam('search', e.target.value)}
          className="rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <input
          type="text"
          placeholder="City"
          defaultValue={city}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('city', e.target.value)}
          onBlur={(e) => updateParam('city', e.target.value)}
          className="rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <input
          type="text"
          placeholder="State"
          defaultValue={state}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('state', e.target.value)}
          onBlur={(e) => updateParam('state', e.target.value)}
          className="rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="newest">Newest</option>
          <option value="rating">Top rated</option>
          <option value="experience">Most experienced</option>
        </select>
        <select
          value={minRating}
          onChange={(e) => updateParam('minRating', e.target.value)}
          className="rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </div>

      <div className="mt-10">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : providers.length === 0 ? (
          <p className="text-center text-ink/50 py-16">
            No providers match your search yet. Try a different city or category.
          </p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p._id} provider={p} />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.set('page', p)
                      setSearchParams(next)
                    }}
                    className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors ${
                      p === page ? 'bg-primary-700 text-white' : 'bg-white border border-primary-100 text-ink/60'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProviders } from '../services/providerService.js'
import { getBlogs } from '../services/blogService.js'
import { getCategories } from '../services/categoryService.js'
import ProviderCard from '../components/ProviderCard.jsx'
import BlogCard from '../components/BlogCard.jsx'
import Loader from '../components/Loader.jsx'

const FALLBACK_CATEGORIES = [
  'Mehndi Artist',
  'Wedding Photographer',
  'Decorator',
  'Caterer',
  'DJ',
  'Makeup Artist',
  'Wedding Planner',
  'Birthday Event Organizer',
]

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [categories, setCategories] = useState([])
  const [featuredProviders, setFeaturedProviders] = useState([])
  const [latestBlogs, setLatestBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [categoryData, providerData, blogData] = await Promise.all([
          getCategories('provider').catch(() => ({ categories: [] })),
          getProviders({ sort: 'rating', limit: 6 }),
          getBlogs({ limit: 3 }).catch(() => ({ blogs: [] })),
        ])
        setCategories(
          categoryData.categories?.length
            ? categoryData.categories.map((c) => c.name)
            : FALLBACK_CATEGORIES
        )
        setFeaturedProviders(providerData.providers || [])
        setLatestBlogs(blogData.blogs || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    navigate(`/providers?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #E0A72E 0, transparent 35%), radial-gradient(circle at 85% 60%, #a8244d 0, transparent 40%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <p className="motif-divider text-marigold-300 text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            EventHub
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-tight">
            Find the Perfect Services for
            <br className="hidden sm:block" /> Your Special Event
          </h1>
          <p className="mt-5 text-primary-100 text-lg max-w-xl mx-auto">
            Mehndi artists, photographers, decorators, caterers and more —
            all in one place, ready to make your celebration unforgettable.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-10 bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
          >
            <input
              type="text"
              placeholder="Search for a service (e.g. Bridal Mehndi)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-ink placeholder:text-ink/40 focus:outline-none"
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="sm:w-40 px-4 py-3 rounded-xl text-ink placeholder:text-ink/40 focus:outline-none border-t sm:border-t-0 sm:border-l border-primary-50"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary-700 text-white font-semibold px-6 py-3 hover:bg-primary-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Popular categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl font-semibold text-center text-ink">
          Popular Categories
        </h2>
        <div className="motif-divider mt-3 mb-10" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => navigate(`/providers?category=${encodeURIComponent(cat)}`)}
              className="rounded-2xl border border-primary-100 bg-white p-5 text-center hover:border-marigold-300 hover:shadow-card transition-all"
            >
              <span className="font-medium text-ink">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured providers */}
      <section className="bg-primary-50/50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-center text-ink">
            Featured Providers
          </h2>
          <div className="motif-divider mt-3 mb-10" />
          {loading ? (
            <Loader />
          ) : featuredProviders.length === 0 ? (
            <p className="text-center text-ink/50">
              No providers yet — be the first to list your business.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProviders.map((p) => (
                <ProviderCard key={p._id} provider={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-semibold text-ink">How It Works</h2>
        <div className="motif-divider mt-3 mb-12" />
        <div className="grid sm:grid-cols-3 gap-10">
          {[
            { step: 'Search', desc: 'Browse providers by category, city, and budget.' },
            { step: 'Compare', desc: 'Check ratings, galleries, and pricing side by side.' },
            { step: 'Book', desc: 'Send a request and get confirmation from the provider.' },
          ].map((item) => (
            <div key={item.step}>
              <p className="font-display text-5xl text-marigold-400 font-semibold">
                {item.step[0]}
              </p>
              <h3 className="font-semibold text-lg mt-2 text-ink">{item.step}</h3>
              <p className="text-sm text-ink/60 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest blogs */}
      {latestBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="font-display text-3xl font-semibold text-center text-ink">
            Latest From the Blog
          </h2>
          <div className="motif-divider mt-3 mb-10" />
          <div className="grid sm:grid-cols-3 gap-6">
            {latestBlogs.map((b) => (
              <BlogCard key={b._id} blog={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

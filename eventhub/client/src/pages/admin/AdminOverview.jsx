import { useEffect, useState } from 'react'
import { getStats } from '../../services/adminService.js'
import Loader from '../../components/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getStats()
      .then((data) => setStats(data.stats))
      .catch((err) => setError(err.response?.data?.message || 'Could not load platform statistics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <ErrorMessage message={error} />

  const cards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Total Providers', value: stats.totalProviders },
    { label: 'Total Clients', value: stats.totalClients },
    { label: 'Total Services', value: stats.totalServices },
    { label: 'Total Bookings', value: stats.totalBookings },
    { label: 'Pending Bookings', value: stats.pendingBookings },
    { label: 'Completed Bookings', value: stats.completedBookings },
    { label: 'Total Blogs', value: stats.totalBlogs },
    { label: 'Pending Reports', value: stats.pendingReports },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Platform Overview</h1>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-primary-100 shadow-card p-5">
            <p className="text-xs text-ink/40 uppercase tracking-wide">{c.label}</p>
            <p className="mt-1 text-3xl font-display font-semibold text-primary-800">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

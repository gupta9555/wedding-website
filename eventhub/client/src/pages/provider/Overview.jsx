import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyProviderProfile } from '../../services/providerService.js'
import { getMyServices } from '../../services/serviceService.js'
import { getProviderBookings } from '../../services/bookingService.js'
import Loader from '../../components/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import { getProviderAnalytics } from '../../services/advancedService.js'

export default function Overview() {
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileMissing, setProfileMissing] = useState(false)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const profileData = await getMyProviderProfile()
        setProfile(profileData.profile)

        const [serviceData, bookingData, analyticsData] = await Promise.all([
          getMyServices(),
          getProviderBookings(),
          getProviderAnalytics(),
        ])
        setServices(serviceData.services || [])
        setBookings(bookingData.bookings || [])
        setAnalytics(analyticsData.analytics)
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileMissing(true)
        } else {
          setError(err.response?.data?.message || 'Could not load your dashboard.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Loader />

  if (profileMissing) {
    return (
      <div className="bg-white rounded-2xl border border-primary-100 shadow-card p-8 text-center max-w-lg">
        <h2 className="font-display text-2xl font-semibold text-ink">Set up your business profile</h2>
        <p className="text-ink/60 mt-2">
          Add your business details so clients can find and book you.
        </p>
        <Link
          to="/provider/profile"
          className="inline-block mt-5 rounded-full bg-primary-700 text-white font-semibold px-6 py-2.5 hover:bg-primary-800 transition-colors"
        >
          Create Profile
        </Link>
      </div>
    )
  }

  if (error) return <ErrorMessage message={error} />

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  const stats = [
    { label: 'Approval status', value: profile?.userId?.isApproved ? 'Approved' : 'Pending review' },
    { label: 'Services listed', value: services.length },
    { label: 'Pending requests', value: pendingCount },
    { label: 'Completed bookings', value: completedCount },
    { label: 'Rating', value: profile?.rating > 0 ? `${profile.rating.toFixed(1)} ★` : 'No reviews yet' },
    { label: 'Favorites', value: analytics?.favoritesCount || 0 },
    { label: 'Completed revenue', value: `₹${(analytics?.completedRevenue || 0).toLocaleString('en-IN')}` },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Welcome back, {profile?.ownerName?.split(' ')[0]}
      </h1>
      {!profile?.userId?.isApproved && (
        <p className="mt-2 text-sm rounded-lg bg-marigold-50 text-marigold-600 px-4 py-2.5 inline-block">
          Your profile is awaiting admin approval — it won't appear in public search until then.
        </p>
      )}
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-primary-100 shadow-card p-5">
            <p className="text-xs text-ink/40 uppercase tracking-wide">{s.label}</p>
            <p className="mt-1 text-2xl font-display font-semibold text-primary-800">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

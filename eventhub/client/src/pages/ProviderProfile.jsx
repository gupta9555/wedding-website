import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProviderById } from '../services/providerService.js'
import { getServices } from '../services/serviceService.js'
import { getProviderReviews, toggleReviewHelpful } from '../services/reviewService.js'
import { createBooking } from '../services/bookingService.js'
import { getCategories } from '../services/categoryService.js'
import { useAuth } from '../context/AuthContext.jsx'
import ServiceCard from '../components/ServiceCard.jsx'
import Modal from '../components/Modal.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { getFavorites, toggleFavorite } from '../services/advancedService.js'

const FALLBACK_EVENT_TYPES = [
  'Wedding', 'Mehndi', 'Engagement', 'Birthday', 'Anniversary',
  'Reception', 'Baby Shower', 'Corporate Event', 'Party', 'Other',
]

// Returns today's date as 'YYYY-MM-DD' in the BROWSER's own local timezone.
// Deliberately not `new Date().toISOString().split('T')[0]` — that returns
// the UTC date, which can be a day off from the user's actual local "today"
// near midnight in timezones ahead of or behind UTC (e.g. it would let a
// user in India briefly pick a date that's already passed in their own
// calendar, right after their local midnight but before UTC's).
const todayLocalDateString = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function ProviderProfile() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [eventTypes, setEventTypes] = useState(FALLBACK_EVENT_TYPES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [bookingService, setBookingService] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    eventType: '', eventDate: '', eventTime: '', eventLocation: '', clientMessage: '',
  })
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [profileData, reviewData, categoryData] = await Promise.all([
          getProviderById(id),
          getProviderReviews(id).catch(() => ({ reviews: [] })),
          getCategories('event').catch(() => ({ categories: [] })),
        ])
        setProfile(profileData.profile)
        setReviews(reviewData.reviews || [])
        if (isAuthenticated && user?.role === 'client') {
          const favoriteData = await getFavorites().catch(() => ({ favorites: [] }))
          setFavorited(favoriteData.favorites?.some((item) =>
            item.providerId?._id?.toString() === profileData.profile._id.toString()
          ))
        }
        if (categoryData.categories?.length) {
          setEventTypes(categoryData.categories.map((c) => c.name))
        }
      } catch (err) {
        setError(err.response?.data?.message || 'This provider could not be found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // The provider's list of services, fetched via the public services endpoint
  // filtered by providerId (Phase 13 added this filter to the Phase 7 search API).
  const [services, setServices] = useState([])
  useEffect(() => {
    if (!profile) return
    getServices({ providerId: profile._id, limit: 50 }).then((data) => {
      setServices(data.services || [])
    })
  }, [profile])

  const openBooking = (service) => {
    setBookingService(service)
    setBookingError('')
    setBookingSuccess('')
  }

  const handleFavorite = async () => {
    try {
      const data = await toggleFavorite(profile._id)
      setFavorited(data.favorited)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update favorites.')
    }

    const handleHelpful = async (reviewId) => {
      try {
        const data = await toggleReviewHelpful(reviewId)
        setReviews((items) => items.map((review) =>
          review._id === reviewId
            ? { ...review, helpfulBy: data.helpful
                ? [...(review.helpfulBy || []), 'current']
                : (review.helpfulBy || []).filter((id) => id !== 'current') }
            : review
        ))
      } catch (err) {
        setError(err.response?.data?.message || 'Could not mark this review.')
      }
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setBookingError('')
    setSubmitting(true)
    try {
      await createBooking({ serviceId: bookingService._id, ...bookingForm })
      setBookingSuccess('Booking request sent! Track its status from your dashboard.')
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Could not send this booking request.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader label="Loading provider…" />
  if (error) return <div className="max-w-2xl mx-auto px-4 py-16"><ErrorMessage message={error} /></div>
  if (!profile) return null

  return (
    <div>
      {/* Cover + header */}
      <div className="h-56 sm:h-72 bg-gradient-to-br from-primary-800 to-primary-900 relative">
        {profile.coverImage && (
          <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 bg-white rounded-2xl shadow-card p-6 flex flex-col sm:flex-row gap-6 items-start">
          <div className="h-24 w-24 rounded-2xl bg-primary-100 flex items-center justify-center font-display text-3xl text-primary-700 shrink-0 -mt-2 border-4 border-white shadow">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt="" className="h-full w-full object-cover rounded-2xl" />
            ) : (
              profile.businessName?.[0]
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold text-ink">{profile.businessName}</h1>
            <p className="text-ink/60">{profile.city}, {profile.state}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-marigold-600 font-semibold">
                ★ {profile.rating > 0 ? profile.rating.toFixed(1) : 'New'} ({profile.numReviews} reviews)
              </span>
              <span className="text-ink/50">{profile.experience}+ years experience</span>
              {profile.categories?.map((c) => (
                <span key={c} className="rounded-full bg-primary-50 text-primary-700 px-3 py-0.5 text-xs font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {isAuthenticated && user?.role === 'client' && (
              <button
                onClick={handleFavorite}
                className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  favorited
                    ? 'border-marigold-400 bg-marigold-50 text-marigold-600'
                    : 'border-primary-200 text-primary-700 hover:bg-primary-50'
                }`}
              >
                {favorited ? '♥ Saved' : '♡ Save'}
              </button>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} className="rounded-full border border-primary-200 text-primary-700 font-semibold text-sm px-5 py-2.5 hover:bg-primary-50 transition-colors">
                Call
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="rounded-full bg-primary-700 text-white font-semibold text-sm px-5 py-2.5 hover:bg-primary-800 transition-colors">
                Email
              </a>
            )}
          </div>
        </div>

        {profile.about && (
          <p className="mt-6 text-ink/70 leading-relaxed max-w-3xl">{profile.about}</p>
        )}

        {/* Services */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-ink">Services</h2>
          {services.length === 0 ? (
            <p className="text-ink/50 mt-3">No services listed yet.</p>
          ) : (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <ServiceCard key={s._id} service={s} onBookNow={isAuthenticated && user?.role === 'client' ? openBooking : undefined} />
              ))}
            </div>
          )}
        </section>

        {/* Gallery */}
        {profile.gallery?.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-ink">Gallery</h2>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {profile.gallery.map((url, i) => (
                <img key={i} src={url} alt="" className="rounded-xl h-32 w-full object-cover" />
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-12 pb-16">
          <h2 className="font-display text-2xl font-semibold text-ink">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-ink/50 mt-3">No reviews yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="rounded-2xl bg-white border border-primary-100 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink">{r.clientId?.name}</p>
                    <span className="text-marigold-600 font-semibold text-sm">{'★'.repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-ink/60 text-sm mt-2">{r.comment}</p>}
                  {isAuthenticated && (
                    <button
                      onClick={() => handleHelpful(r._id)}
                      className="mt-3 text-xs font-semibold text-primary-700"
                    >
                      Helpful ({r.helpfulBy?.length || 0})
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal open={!!bookingService} onClose={() => setBookingService(null)} title={`Book: ${bookingService?.title || ''}`}>
        {bookingSuccess ? (
          <p className="text-primary-700 font-medium">{bookingSuccess}</p>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-3">
            {bookingError && <ErrorMessage message={bookingError} />}
            <div>
              <label className="text-sm font-medium text-ink/70">Event type</label>
              <select
                required
                value={bookingForm.eventType}
                onChange={(e) => setBookingForm({ ...bookingForm, eventType: e.target.value })}
                className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">Select…</option>
                {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-ink/70">Event date</label>
                <input
                  type="date"
                  required
                  min={todayLocalDateString()}
                  value={bookingForm.eventDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, eventDate: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink/70">Event time</label>
                <input
                  type="time"
                  required
                  value={bookingForm.eventTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, eventTime: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Event location</label>
              <input
                type="text"
                required
                value={bookingForm.eventLocation}
                onChange={(e) => setBookingForm({ ...bookingForm, eventLocation: e.target.value })}
                className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink/70">Message (optional)</label>
              <textarea
                rows={3}
                value={bookingForm.clientMessage}
                onChange={(e) => setBookingForm({ ...bookingForm, clientMessage: e.target.value })}
                className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary-700 text-white font-semibold py-2.5 hover:bg-primary-800 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Sending request…' : 'Send Booking Request'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { getProviderBookings, updateBookingStatus } from '../../services/bookingService.js'
import BookingCard from '../../components/BookingCard.jsx'
import Loader from '../../components/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProviderBookings(statusFilter ? { status: statusFilter } : {})
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load booking requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this booking.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Booking Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-primary-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">All statuses</option>
          {['pending', 'accepted', 'rejected', 'cancelled', 'completed'].map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : bookings.length === 0 ? (
          <p className="text-ink/50 py-10">No booking requests yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {bookings.map((b) => (
              <BookingCard key={b._id} booking={b} viewerRole="provider" onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

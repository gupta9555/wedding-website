const STATUS_STYLES = {
  pending: 'bg-marigold-100 text-marigold-600',
  accepted: 'bg-primary-100 text-primary-700',
  rejected: 'bg-ink/10 text-ink/50',
  cancelled: 'bg-ink/10 text-ink/50',
  completed: 'bg-green-100 text-green-700',
}

export default function BookingCard({ booking, viewerRole, onUpdateStatus }) {
  const otherParty =
    viewerRole === 'client' ? booking.providerId?.businessName : booking.clientId?.name

  return (
    <div className="rounded-2xl bg-white border border-primary-100 shadow-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-ink">{booking.serviceId?.title}</h4>
          <p className="text-sm text-ink/60 mt-0.5">
            {viewerRole === 'client' ? 'with' : 'for'} {otherParty}
          </p>
        </div>
        <span className={`text-xs font-semibold rounded-full px-3 py-1 capitalize ${STATUS_STYLES[booking.status] || ''}`}>
          {booking.status}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink/40">Event</dt>
          <dd className="text-ink">{booking.eventType}</dd>
        </div>
        <div>
          <dt className="text-ink/40">Date</dt>
          <dd className="text-ink">{new Date(booking.eventDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-ink/40">Time</dt>
          <dd className="text-ink">{booking.eventTime}</dd>
        </div>
        <div>
          <dt className="text-ink/40">Total</dt>
          <dd className="text-ink font-semibold">₹{booking.totalPrice?.toLocaleString('en-IN')}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-ink/60">
        <span className="text-ink/40">Location: </span>
        {booking.eventLocation}
      </p>
      {booking.clientMessage && (
        <p className="mt-2 text-sm text-ink/60 italic">"{booking.clientMessage}"</p>
      )}

      {booking.statusHistory?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-primary-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-2">Status timeline</p>
          <div className="space-y-2">
            {[...booking.statusHistory].reverse().slice(0, 4).map((item, index) => (
              <div key={`${item.status}-${item.changedAt}-${index}`} className="flex items-center justify-between text-xs">
                <span className="capitalize font-medium text-ink/70">{item.status}</span>
                <span className="text-ink/40">
                  {new Date(item.changedAt).toLocaleDateString()} {new Date(item.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onUpdateStatus && (
        <div className="mt-4 pt-4 border-t border-primary-50 flex flex-wrap gap-2">
          {viewerRole === 'provider' && booking.status === 'pending' && (
            <>
              <button
                onClick={() => onUpdateStatus(booking._id, 'accepted')}
                className="rounded-full bg-primary-700 text-white text-xs font-semibold px-4 py-1.5 hover:bg-primary-800"
              >
                Accept
              </button>
              <button
                onClick={() => onUpdateStatus(booking._id, 'rejected')}
                className="rounded-full bg-ink/10 text-ink/70 text-xs font-semibold px-4 py-1.5 hover:bg-ink/20"
              >
                Reject
              </button>
            </>
          )}
          {viewerRole === 'provider' && booking.status === 'accepted' && (
            <button
              onClick={() => onUpdateStatus(booking._id, 'completed')}
              className="rounded-full bg-green-600 text-white text-xs font-semibold px-4 py-1.5 hover:bg-green-700"
            >
              Mark Completed
            </button>
          )}
          {viewerRole === 'client' && ['pending', 'accepted'].includes(booking.status) && (
            <button
              onClick={() => onUpdateStatus(booking._id, 'cancelled')}
              className="rounded-full bg-ink/10 text-ink/70 text-xs font-semibold px-4 py-1.5 hover:bg-ink/20"
            >
              Cancel Booking
            </button>
          )}
        </div>
      )}
    </div>
  )
}

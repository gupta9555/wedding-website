import { useEffect, useState } from 'react'
import { getUsers, approveProvider, rejectProvider } from '../../services/adminService.js'
import Loader from '../../components/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'

export default function ManageProviders() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { role: 'provider' }
      if (filter === 'pending') params.isApproved = 'false'
      if (filter === 'approved') params.isApproved = 'true'
      const data = await getUsers(params)
      setProviders(data.users || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load providers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const handleApprove = async (id) => {
    try {
      await approveProvider(id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve this provider.')
    }
  }

  const handleReject = async (id) => {
    try {
      await rejectProvider(id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject this provider.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Manage Providers</h1>
        <div className="flex gap-2">
          {['pending', 'approved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-primary-700 text-white' : 'bg-white border border-primary-100 text-ink/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : providers.length === 0 ? (
          <p className="text-ink/50 py-10">No providers in this view.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-card divide-y divide-primary-50">
            {providers.map((p) => (
              <div key={p._id} className="p-5 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-sm text-ink/50">{p.email} · {p.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-marigold-100 text-marigold-600'}`}>
                    {p.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  {!p.isApproved ? (
                    <button
                      onClick={() => handleApprove(p._id)}
                      className="rounded-full bg-primary-700 text-white text-sm font-semibold px-4 py-1.5 hover:bg-primary-800"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(p._id)}
                      className="rounded-full bg-ink/10 text-ink/70 text-sm font-semibold px-4 py-1.5 hover:bg-ink/20"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

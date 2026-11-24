import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyServices, deleteService } from '../../services/serviceService.js'
import ServiceCard from '../../components/ServiceCard.jsx'
import Loader from '../../components/Loader.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'

export default function MyServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyServices()
      setServices(data.services || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service? This cannot be undone.')) return
    try {
      await deleteService(id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete this service.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">My Services</h1>
        <Link
          to="/provider/services/new"
          className="rounded-full bg-primary-700 text-white text-sm font-semibold px-5 py-2 hover:bg-primary-800 transition-colors"
        >
          + Add Service
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : services.length === 0 ? (
          <p className="text-ink/50 py-10">You haven't listed any services yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <ServiceCard
                key={s._id}
                service={s}
                actions={
                  <>
                    <Link to={`/provider/services/${s._id}/edit`} className="text-primary-700 font-semibold hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(s._id)} className="text-ink/50 font-semibold hover:text-primary-700">
                      Delete
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getServiceById, createService, updateService } from '../../services/serviceService.js'
import { getCategories } from '../../services/categoryService.js'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Loader from '../../components/Loader.jsx'

const FALLBACK_CATEGORIES = [
  'Mehndi Artist', 'Wedding Photographer', 'Decorator', 'Caterer',
  'DJ', 'Makeup Artist', 'Wedding Planner', 'Birthday Event Organizer', 'Other',
]
const PRICING_TYPES = ['per event', 'per day', 'per person', 'starting from']

const EMPTY_FORM = {
  title: '', description: '', category: '', price: '', pricingType: 'per event', availability: true,
}

export default function ServiceForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCategories('provider')
      .then((data) => data.categories?.length && setCategories(data.categories.map((c) => c.name)))
      .catch(() => {})

    if (isEdit) {
      getServiceById(id)
        .then((data) => setForm({ ...EMPTY_FORM, ...data.service }))
        .catch((err) => setError(err.response?.data?.message || 'Could not load this service.'))
        .finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (isEdit) await updateService(id, payload)
      else await createService(payload)
      navigate('/provider/services')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this service.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        {isEdit ? 'Edit Service' : 'Add Service'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-2xl border border-primary-100 shadow-card p-6 max-w-xl space-y-4">
        {error && <ErrorMessage message={error} />}

        <div>
          <label className="text-sm font-medium text-ink/70">Title</label>
          <input
            name="title" required value={form.title} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink/70">Description</label>
          <textarea
            name="description" required rows={4} value={form.description} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink/70">Category</label>
            <select
              name="category" required value={form.category} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="">Select…</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink/70">Pricing type</label>
            <select
              name="pricingType" value={form.pricingType} onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              {PRICING_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink/70">Price (₹)</label>
          <input
            name="price" type="number" min="0" required value={form.price} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" name="availability" checked={form.availability} onChange={handleChange} />
          Accepting bookings for this service
        </label>

        <button
          type="submit" disabled={saving}
          className="rounded-lg bg-primary-700 text-white font-semibold px-6 py-2.5 hover:bg-primary-800 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Service'}
        </button>
      </form>
    </div>
  )
}

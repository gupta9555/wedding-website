import { useEffect, useState } from 'react'
import { getMyProviderProfile, saveMyProviderProfile } from '../../services/providerService.js'
import { getCategories } from '../../services/categoryService.js'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import Loader from '../../components/Loader.jsx'
import { updateUnavailableDates } from '../../services/advancedService.js'

const FALLBACK_CATEGORIES = [
  'Mehndi Artist', 'Wedding Photographer', 'Decorator', 'Caterer',
  'DJ', 'Makeup Artist', 'Wedding Planner', 'Birthday Event Organizer', 'Other',
]

const EMPTY_FORM = {
  businessName: '', ownerName: '', about: '', email: '', phone: '',
  fullAddress: '', city: '', state: '', pincode: '', experience: 0, categories: [],
}

export default function MyProfile() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [unavailableDates, setUnavailableDates] = useState([])
  const [newUnavailableDate, setNewUnavailableDate] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const categoryData = await getCategories('provider').catch(() => ({ categories: [] }))
        if (categoryData.categories?.length) {
          setCategories(categoryData.categories.map((c) => c.name))
        }
      } catch {
        // fall back to the static list — non-fatal
      }
      try {
        const data = await getMyProviderProfile()
        setForm({ ...EMPTY_FORM, ...data.profile })
        setUnavailableDates((data.profile.unavailableDates || []).map((date) =>
          new Date(date).toISOString().slice(0, 10)
        ))
      } catch {
        // No profile yet — that's fine, the form just starts empty
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      await saveMyProviderProfile(form)
      setSuccess('Profile saved successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your profile.')
    } finally {
      setSaving(false)
    }

    const saveUnavailableDates = async () => {
      setError('')
      try {
        await updateUnavailableDates(unavailableDates)
        setSuccess('Calendar availability updated.')
      } catch (err) {
        setError(err.response?.data?.message || 'Could not update availability.')
      }
    }
  }

  if (loading) return <Loader />

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Business Profile</h1>

      <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-2xl border border-primary-100 shadow-card p-6 max-w-2xl space-y-4">
        {error && <ErrorMessage message={error} />}
        {success && <p className="text-sm rounded-lg bg-primary-50 text-primary-700 px-4 py-2.5">{success}</p>}

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Business name" name="businessName" value={form.businessName} onChange={handleChange} required />
          <Field label="Owner name" name="ownerName" value={form.ownerName} onChange={handleChange} required />
        </div>

        <div>
          <label className="text-sm font-medium text-ink/70">About</label>
          <textarea
            name="about" rows={4} value={form.about} onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Contact email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Field label="Contact phone" name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" />
        </div>

        <Field label="Full address" name="fullAddress" value={form.fullAddress} onChange={handleChange} required />

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="City" name="city" value={form.city} onChange={handleChange} required />
          <Field label="State" name="state" value={form.state} onChange={handleChange} required />
          <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} required pattern="[0-9]{6}" />
        </div>

        <Field label="Years of experience" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} />

        <div>
          <label className="text-sm font-medium text-ink/70">Categories</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                  form.categories.includes(cat)
                    ? 'bg-primary-700 border-primary-700 text-white'
                    : 'border-primary-100 text-ink/70 hover:border-primary-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-primary-50 pt-4">
          <label className="text-sm font-medium text-ink/70">Unavailable dates</label>
          <div className="mt-2 flex gap-2">
            <input
              type="date"
              value={newUnavailableDate}
              onChange={(e) => setNewUnavailableDate(e.target.value)}
              className="rounded-lg border border-primary-100 px-4 py-2.5"
            />
            <button
              type="button"
              onClick={() => {
                if (newUnavailableDate && !unavailableDates.includes(newUnavailableDate)) {
                  setUnavailableDates((dates) => [...dates, newUnavailableDate].sort())
                  setNewUnavailableDate('')
                }
              }}
              className="rounded-lg border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700"
            >
              Add date
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {unavailableDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => setUnavailableDates((dates) => dates.filter((item) => item !== date))}
                className="rounded-full bg-marigold-50 text-marigold-600 px-3 py-1 text-sm"
              >
                {date} ×
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={saveUnavailableDates}
            className="mt-3 rounded-lg border border-primary-200 text-primary-700 font-semibold px-4 py-2 text-sm"
          >
            Save Availability
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary-700 text-white font-semibold px-6 py-2.5 hover:bg-primary-800 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink/70">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
      />
    </div>
  )
}

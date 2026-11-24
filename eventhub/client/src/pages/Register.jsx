import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'client',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await register(form)
      navigate(user.role === 'provider' ? '/provider' : '/client', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-3xl font-semibold text-center text-ink">Create your account</h1>
      <p className="text-center text-ink/60 mt-2 text-sm">
        Join EventHub as a client or list your business as a provider.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-2xl shadow-card p-6 space-y-4">
        {error && <ErrorMessage message={error} />}

        <div className="grid grid-cols-2 gap-3">
          {['client', 'provider'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm({ ...form, role })}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                form.role === role
                  ? 'bg-primary-700 border-primary-700 text-white'
                  : 'border-primary-100 text-ink/70 hover:border-primary-300'
              }`}
            >
              I'm a {role}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-ink/70">Full name</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Phone (10 digits)</label>
          <input
            type="tel"
            name="phone"
            required
            pattern="[0-9]{10}"
            value={form.phone}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/70">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-primary-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary-700 text-white font-semibold py-2.5 hover:bg-primary-800 disabled:opacity-60 transition-colors"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-700 font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

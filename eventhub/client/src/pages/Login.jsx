import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const user = await login(form)
      const redirectTo =
        location.state?.from?.pathname ||
        (user.role === 'admin' ? '/admin' : user.role === 'provider' ? '/provider' : '/client')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="font-display text-3xl font-semibold text-center text-ink">Welcome back</h1>
      <p className="text-center text-ink/60 mt-2 text-sm">Log in to manage bookings and more.</p>

      <form onSubmit={handleSubmit} className="mt-8 bg-white rounded-2xl shadow-card p-6 space-y-4">
        {error && <ErrorMessage message={error} />}
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
          <label className="text-sm font-medium text-ink/70">Password</label>
          <input
            type="password"
            name="password"
            required
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
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-center text-sm text-ink/60 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-700 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}

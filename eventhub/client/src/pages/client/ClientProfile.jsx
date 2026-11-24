import { useAuth } from '../../context/AuthContext.jsx'

export default function ClientProfile() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Profile</h1>
      <div className="mt-6 bg-white rounded-2xl border border-primary-100 shadow-card p-6 max-w-md space-y-4">
        <div>
          <p className="text-xs text-ink/40 uppercase tracking-wide">Name</p>
          <p className="text-ink font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-ink/40 uppercase tracking-wide">Email</p>
          <p className="text-ink font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-ink/40 uppercase tracking-wide">Phone</p>
          <p className="text-ink font-medium">{user.phone}</p>
        </div>
        <div>
          <p className="text-xs text-ink/40 uppercase tracking-wide">Member since</p>
          <p className="text-ink font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

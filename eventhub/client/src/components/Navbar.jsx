import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getNotifications, markNotificationsRead } from '../services/advancedService.js'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const navigate = useNavigate()

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/client'

  useEffect(() => {
    if (!isAuthenticated) return
    getNotifications()
      .then((data) => {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      })
      .catch(() => {})
  }, [isAuthenticated])

  const openNotifications = async () => {
    setNotificationsOpen((value) => !value)
    if (!notificationsOpen && unreadCount > 0) {
      await markNotificationsRead().catch(() => {})
      setUnreadCount(0)
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })))
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur border-b border-primary-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold text-primary-700 tracking-tight">
          Event<span className="text-marigold-400">Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/80">
          <Link to="/providers" className="hover:text-primary-700 transition-colors">
            Find Providers
          </Link>
          <Link to="/blogs" className="hover:text-primary-700 transition-colors">
            Blog
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="relative">
                <button
                  onClick={openNotifications}
                  className="relative h-9 w-9 rounded-full border border-primary-100 text-ink/70 flex items-center justify-center"
                  aria-label="Notifications"
                >
                  <span aria-hidden="true">●</span>
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 h-5 rounded-full bg-marigold-400 text-primary-900 text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-primary-100 bg-white shadow-card p-2">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-ink/50 p-3">No notifications yet.</p>
                    ) : notifications.slice(0, 6).map((item) => (
                      <Link
                        key={item._id}
                        to={item.link || dashboardPath}
                        onClick={() => setNotificationsOpen(false)}
                        className={`block rounded-lg px-3 py-2 ${item.isRead ? '' : 'bg-primary-50'}`}
                      >
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        <p className="text-xs text-ink/60 mt-0.5">{item.message}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to={dashboardPath}
                className="text-sm font-medium text-ink/80 hover:text-primary-700 transition-colors"
              >
                Hi, {user.name?.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-primary-700 text-white text-sm font-semibold px-5 py-2 hover:bg-primary-800 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink/80 hover:text-primary-700 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary-700 text-white text-sm font-semibold px-5 py-2 hover:bg-primary-800 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-ink"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-primary-100 px-4 py-4 space-y-3 bg-ivory">
          <Link to="/providers" onClick={() => setMenuOpen(false)} className="block text-ink/80">
            Find Providers
          </Link>
          <Link to="/blogs" onClick={() => setMenuOpen(false)} className="block text-ink/80">
            Blog
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="block text-ink/80">
                My Dashboard
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
                className="block text-primary-700 font-semibold"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-ink/80">
                Log in
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block text-primary-700 font-semibold">
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}

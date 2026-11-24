import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'eventhub_token'
const USER_KEY = 'eventhub_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, restore the session from localStorage, then confirm
  // the token is still valid by fetching the live profile from the API.
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY)
    const storedToken = localStorage.getItem(TOKEN_KEY)

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      authService
        .getMe()
        .then((data) => {
          setUser(data.user)
          localStorage.setItem(USER_KEY, JSON.stringify(data.user))
        })
        .catch(() => {
          // Token expired or invalid — clear the stale session
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const persistSession = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
  }

  const login = async (credentials) => {
    const data = await authService.login(credentials)
    persistSession(data)
    return data.user
  }

  const register = async (payload) => {
    const data = await authService.register(payload)
    persistSession(data)
    return data.user
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Even if the network call fails, still clear the local session
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

import api from './api.js'

export const register = async (data) => {
  const res = await api.post('/auth/register', data)
  return res.data
}

export const login = async (data) => {
  const res = await api.post('/auth/login', data)
  return res.data
}

export const logout = async () => {
  const res = await api.post('/auth/logout')
  return res.data
}

export const getMe = async () => {
  const res = await api.get('/auth/me')
  return res.data
}

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgotpassword', { email })
  return res.data
}

export const resetPassword = async (token, password) => {
  const res = await api.put(`/auth/resetpassword/${token}`, { password })
  return res.data
}

import api from './api.js'

export const getStats = async () => {
  const res = await api.get('/admin/stats')
  return res.data
}

export const getUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params })
  return res.data
}

export const approveProvider = async (id) => {
  const res = await api.put(`/admin/users/${id}/approve`)
  return res.data
}

export const rejectProvider = async (id) => {
  const res = await api.put(`/admin/users/${id}/reject`)
  return res.data
}

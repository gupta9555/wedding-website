import api from './api.js'

export const getProviders = async (params = {}) => {
  const res = await api.get('/providers', { params })
  return res.data
}

export const getProviderById = async (id) => {
  const res = await api.get(`/providers/${id}`)
  return res.data
}

export const getMyProviderProfile = async () => {
  const res = await api.get('/providers/profile/me')
  return res.data
}

export const saveMyProviderProfile = async (data) => {
  const res = await api.post('/providers/profile', data)
  return res.data
}

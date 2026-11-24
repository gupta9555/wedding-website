import api from './api.js'

export const getServices = async (params = {}) => {
  const res = await api.get('/services', { params })
  return res.data
}

export const getServiceById = async (id) => {
  const res = await api.get(`/services/${id}`)
  return res.data
}

export const getMyServices = async () => {
  const res = await api.get('/services/my')
  return res.data
}

export const createService = async (data) => {
  const res = await api.post('/services', data)
  return res.data
}

export const updateService = async (id, data) => {
  const res = await api.put(`/services/${id}`, data)
  return res.data
}

export const deleteService = async (id) => {
  const res = await api.delete(`/services/${id}`)
  return res.data
}

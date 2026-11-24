import api from './api.js'

export const createBooking = async (data) => {
  const res = await api.post('/bookings', data)
  return res.data
}

export const getClientBookings = async (params = {}) => {
  const res = await api.get('/bookings/client', { params })
  return res.data
}

export const getProviderBookings = async (params = {}) => {
  const res = await api.get('/bookings/provider', { params })
  return res.data
}

export const updateBookingStatus = async (id, status) => {
  const res = await api.put(`/bookings/${id}/status`, { status })
  return res.data
}

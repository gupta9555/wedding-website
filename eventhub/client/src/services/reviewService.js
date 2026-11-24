import api from './api.js'

export const getProviderReviews = async (providerId, params = {}) => {
  const res = await api.get(`/reviews/provider/${providerId}`, { params })
  return res.data
}

export const createReview = async (data) => {
  const res = await api.post('/reviews', data)
  return res.data
}

export const getReviewForBooking = async (bookingId) => {
  const res = await api.get(`/reviews/booking/${bookingId}`)
  return res.data
}

export const toggleReviewHelpful = async (reviewId) => {
  const res = await api.put(`/reviews/${reviewId}/helpful`)
  return res.data
}

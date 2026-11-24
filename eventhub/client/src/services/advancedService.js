import api from './api.js'

export const getFavorites = async () => (await api.get('/advanced/favorites')).data
export const toggleFavorite = async (providerId) =>
  (await api.put(`/advanced/favorites/${providerId}`)).data
export const getNotifications = async () =>
  (await api.get('/advanced/notifications')).data
export const markNotificationsRead = async () =>
  (await api.put('/advanced/notifications/read')).data
export const getProviderAnalytics = async () =>
  (await api.get('/advanced/analytics/provider')).data
export const updateUnavailableDates = async (dates) =>
  (await api.put('/advanced/availability', { dates })).data

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
})

// Attach JWT token automatically if present (used from Phase 3 onward)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventhub_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const checkServerHealth = async () => {
  const res = await api.get('/health')
  return res.data
}

export default api

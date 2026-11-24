import api from './api.js'

export const getCategories = async (type) => {
  const res = await api.get('/categories', { params: type ? { type } : {} })
  return res.data
}

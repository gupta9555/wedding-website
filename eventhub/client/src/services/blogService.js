import api from './api.js'

export const getBlogs = async (params = {}) => {
  const res = await api.get('/blogs', { params })
  return res.data
}

export const getBlogById = async (idOrSlug) => {
  const res = await api.get(`/blogs/${idOrSlug}`)
  return res.data
}

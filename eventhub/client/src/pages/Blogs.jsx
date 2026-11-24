import { useEffect, useState } from 'react'
import { getBlogs } from '../services/blogService.js'
import BlogCard from '../components/BlogCard.jsx'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getBlogs({ limit: 12 })
      .then((data) => setBlogs(data.blogs || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load blogs right now.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-4xl font-semibold text-ink">The EventHub Blog</h1>
      <p className="text-ink/60 mt-1">Tips and inspiration from our providers.</p>

      <div className="mt-10">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : blogs.length === 0 ? (
          <p className="text-center text-ink/50 py-16">No blog posts yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((b) => <BlogCard key={b._id} blog={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}

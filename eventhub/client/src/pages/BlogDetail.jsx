import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBlogById } from '../services/blogService.js'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function BlogDetail() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getBlogById(slug)
      .then((data) => setBlog(data.blog))
      .catch((err) => setError(err.response?.data?.message || 'This post could not be found.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Loader />
  if (error) return <div className="max-w-2xl mx-auto px-4 py-16"><ErrorMessage message={error} /></div>
  if (!blog) return null

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/blogs" className="text-sm text-primary-700 font-semibold hover:underline">&larr; Back to blog</Link>
      {blog.coverImage && (
        <img src={blog.coverImage} alt="" className="w-full h-64 object-cover rounded-2xl mt-6" />
      )}
      <span className="text-xs font-semibold text-marigold-600 uppercase tracking-wide mt-6 block">
        {blog.category}
      </span>
      <h1 className="font-display text-4xl font-semibold text-ink mt-2">{blog.title}</h1>
      <p className="text-sm text-ink/50 mt-2">
        By {blog.author?.name || 'EventHub'} · {new Date(blog.createdAt).toLocaleDateString()}
      </p>
      <div className="prose prose-p:text-ink/80 max-w-none mt-8 whitespace-pre-line leading-relaxed">
        {blog.content}
      </div>
      {blog.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {blog.tags.map((t) => (
            <span key={t} className="rounded-full bg-primary-50 text-primary-700 px-3 py-1 text-xs font-medium">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}

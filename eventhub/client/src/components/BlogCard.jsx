import { Link } from 'react-router-dom'

export default function BlogCard({ blog }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group block rounded-2xl bg-white border border-primary-100 shadow-card overflow-hidden hover:-translate-y-0.5 transition-transform"
    >
      <div className="h-40 bg-primary-50">
        {blog.coverImage ? (
          <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-200 font-display text-3xl">
            EventHub
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-semibold text-marigold-600 uppercase tracking-wide">
          {blog.category}
        </span>
        <h3 className="font-display text-xl font-semibold mt-1 text-ink group-hover:text-primary-700 transition-colors">
          {blog.title}
        </h3>
        <p className="text-sm text-ink/50 mt-2">
          By {blog.author?.name || 'EventHub'} · {new Date(blog.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  )
}

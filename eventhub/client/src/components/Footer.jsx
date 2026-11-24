import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-primary-100 bg-primary-900 text-primary-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold">
            Event<span className="text-marigold-400">Hub</span>
          </p>
          <p className="mt-3 text-sm text-primary-200">
            Find the perfect services for your special event — from mehndi to weddings,
            birthdays to baby showers.
          </p>
        </div>

        <div>
          <p className="font-semibold text-marigold-300 text-sm tracking-wide uppercase">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-200">
            <li><Link to="/providers" className="hover:text-white">Find Providers</Link></li>
            <li><Link to="/blogs" className="hover:text-white">Blog</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-marigold-300 text-sm tracking-wide uppercase">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-200">
            <li>Wedding Photography</li>
            <li>Mehndi Artists</li>
            <li>Decorators</li>
            <li>Caterers</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-marigold-300 text-sm tracking-wide uppercase">Get Started</p>
          <ul className="mt-3 space-y-2 text-sm text-primary-200">
            <li><Link to="/register" className="hover:text-white">Sign up as a client</Link></li>
            <li><Link to="/register" className="hover:text-white">List your business</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-800 py-5 text-center text-xs text-primary-300">
        © {new Date().getFullYear()} EventHub. Built for celebrations.
      </div>
    </footer>
  )
}

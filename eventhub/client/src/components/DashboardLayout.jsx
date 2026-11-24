import { NavLink } from 'react-router-dom'

export default function DashboardLayout({ title, links, children }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid md:grid-cols-[220px_1fr] gap-8">
      <aside>
        <h2 className="font-display text-2xl font-semibold text-primary-800 mb-4">{title}</h2>
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-ink/70 hover:bg-primary-50 hover:text-primary-700'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main>{children}</main>
    </div>
  )
}

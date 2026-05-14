import { NavLink } from 'react-router-dom'

interface AdminNavItem {
  to: string
  label: string
}

const items: AdminNavItem[] = [
  { to: '/admin', label: 'Categories & items' },
  { to: '/admin/delivery', label: 'Delivery onboarding' },
  { to: '/admin/reset', label: 'Reset data' },
]

export function AdminNav() {
  return (
    <nav className="admin-nav" aria-label="Administration sections">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/admin'}
          className={({ isActive }) =>
            `admin-nav__link ${isActive ? 'admin-nav__link--active' : ''}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

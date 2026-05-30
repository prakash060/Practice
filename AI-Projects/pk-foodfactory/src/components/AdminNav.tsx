import { NavLink } from 'react-router-dom'

interface AdminNavItem {
  to: string
  label: string
}

const items: AdminNavItem[] = [
  { to: '/admin', label: 'Categories & items' },
  { to: '/admin/orders', label: 'Orders & delivery' },
  { to: '/admin/users', label: 'All users' },
  { to: '/admin/delivery', label: 'Delivery onboarding' },
  { to: '/admin/reset', label: 'Reset data' },
  { to: '/admin/seed', label: 'Generate demo data' },
  { to: '/admin/seed-agents', label: 'Generate demo agents' },
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

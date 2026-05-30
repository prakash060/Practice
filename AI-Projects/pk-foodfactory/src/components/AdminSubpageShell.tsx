import type { ReactNode } from 'react'
import { AdminNav } from './AdminNav'
import { AppHeaderApp } from './AppHeader'

export interface AdminSubpageStat {
  value: ReactNode
  label: string
}

interface AdminSubpageShellProps {
  title: string
  subtitle: string
  stats?: AdminSubpageStat[]
  loadError?: string | null
  children: ReactNode
}

export function AdminSubpageShell({
  title,
  subtitle,
  stats = [],
  loadError,
  children,
}: AdminSubpageShellProps) {
  return (
    <main className="app-shell admin-shell">
      <AppHeaderApp />

      <section className="admin-header">
        <div className="admin-header__content">
          <p className="admin-header__kicker">Administration</p>
          <h1 className="admin-header__title">{title}</h1>
          <p className="admin-header__subtitle">{subtitle}</p>
        </div>
        {stats.length > 0 ? (
          <div className="admin-header__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="admin-stat">
                <span className="admin-stat__value">{stat.value}</span>
                <span className="admin-stat__label">{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="panel">
        <AdminNav />
      </section>

      {loadError ? (
        <section className="panel">
          <p className="error-message">{loadError}</p>
        </section>
      ) : null}

      {children}
    </main>
  )
}

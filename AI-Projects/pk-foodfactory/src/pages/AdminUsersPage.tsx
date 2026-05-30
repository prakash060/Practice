import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminNav } from '../components/AdminNav'
import { AppHeaderApp } from '../components/AppHeader'
import { ChevronLeftIcon, RefreshIcon, UserIcon } from '../components/Icons'
import { adminUsersAPI, type AuthType, type UserPublic } from '../services/api'
import { formatPhoneDisplay } from '../utils/phoneCountry'

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

function formatJoined(iso?: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function authLabel(authType?: AuthType): string {
  if (authType === 'password') return 'Password'
  if (authType === 'otp') return 'OTP'
  return authType ?? '—'
}

function lastLoginLabel(method?: AuthType | null): string {
  if (!method) return '—'
  if (method === 'password') return 'Password'
  if (method === 'otp') return 'Mobile OTP'
  return method
}

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    setIsLoading(true)
    try {
      const list = await adminUsersAPI.list()
      setUsers(list)
    } catch (err) {
      setError(axiosErrorMessage(err, 'Could not load users'))
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="app-shell admin-shell">
      <AppHeaderApp />
      <AdminNav />

      <section className="admin-page">
        <button
          type="button"
          className="back-button btn-icon admin-page__back"
          onClick={() => navigate('/admin')}
        >
          <ChevronLeftIcon />
          <span>Back to menu</span>
        </button>

        <header className="admin-page__hero">
          <h1>All users</h1>
          <p>
            View every registered customer account with contact details, verification status, and
            sign-in preferences.
          </p>
        </header>

        <div className="panel admin-order__toolbar">
          <p className="item-description">
            {isLoading ? 'Loading…' : `${users.length} registered user${users.length === 1 ? '' : 's'}`}
          </p>
          <button
            type="button"
            className="back-button btn-icon"
            onClick={() => void load()}
            disabled={isLoading}
          >
            <RefreshIcon />
            <span>Refresh</span>
          </button>
        </div>

        {error ? <p className="error-message">{error}</p> : null}

        <div className="auth-card admin-card">
          <div className="admin-list__header">
            <h2>Registered accounts</h2>
            <span className="admin-list__count">{users.length}</span>
          </div>

          {isLoading ? <p className="empty-state">Loading users…</p> : null}

          {!isLoading && !error && users.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty__title">No users yet</p>
              <p className="admin-empty__hint">New sign-ups will appear here.</p>
            </div>
          ) : null}

          {!isLoading && !error && users.length > 0 ? (
            <ul className="admin-item-list">
              {users.map((u) => (
                <li key={u.id} className="admin-item">
                  <div className="admin-item__thumb admin-item__thumb--avatar" aria-hidden>
                    <UserIcon />
                  </div>
                  <div className="admin-item__body">
                    <h3>
                      {u.name}
                      {u.isAdmin ? (
                        <span className="order-status-badge order-status-badge--paid"> Admin</span>
                      ) : null}
                    </h3>
                    <p className="admin-item__meta">
                      <strong>Email:</strong> {u.email}
                      {u.emailVerified ? ' · verified' : ' · not verified'}
                    </p>
                    <p className="admin-item__meta">
                      <strong>Mobile:</strong> {formatPhoneDisplay(u.phone) || u.phone}
                      {u.phoneVerified ? ' · verified' : ' · not verified'}
                    </p>
                    <p className="admin-item__meta">
                      <strong>Address:</strong> {u.address}
                    </p>
                    <p className="admin-item__meta">
                      <strong>Sign-in:</strong> {authLabel(u.authType)}
                      {u.lastLoginMethod
                        ? ` · last used ${lastLoginLabel(u.lastLoginMethod)}`
                        : ''}
                    </p>
                    <p className="admin-item__meta">
                      <strong>Joined:</strong> {formatJoined(u.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </main>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { AdminSubpageShell } from '../components/AdminSubpageShell'
import { RefreshIcon, UserIcon } from '../components/Icons'
import { adminUsersAPI, type AuthType, type UserPublic } from '../services/api'
import { useToast } from '../state/ToastContext'
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
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserPublic[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const deletableUsers = useMemo(() => users.filter((u) => !u.isAdmin), [users])
  const deletableIds = useMemo(() => deletableUsers.map((u) => u.id), [deletableUsers])

  const allDeletableSelected =
    deletableIds.length > 0 && deletableIds.every((id) => selectedIds.has(id))
  const someDeletableSelected = deletableIds.some((id) => selectedIds.has(id))
  const selectAllIndeterminate = someDeletableSelected && !allDeletableSelected

  const load = useCallback(async () => {
    setError('')
    setIsLoading(true)
    try {
      const list = await adminUsersAPI.list()
      setUsers(list)
      setSelectedIds(new Set())
    } catch (err) {
      setError(axiosErrorMessage(err, 'Could not load users'))
      setUsers([])
      setSelectedIds(new Set())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allDeletableSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(deletableIds))
  }

  const handleDeleteSelected = async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return

    const confirmed = window.confirm(
      `Delete ${ids.length} selected user account${ids.length === 1 ? '' : 's'}? This cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    setError('')
    try {
      const res = await adminUsersAPI.bulkDelete(ids)
      showToast(res.message, 'success')
      if (res.skipped > 0) {
        showToast(`${res.skipped} account(s) were skipped (admin cannot be deleted).`, 'info')
      }
      await load()
    } catch (err) {
      const msg = axiosErrorMessage(err, 'Could not delete users')
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const headerStats = useMemo(
    () => [
      { value: isLoading ? '…' : users.length, label: 'Registered' },
      { value: isLoading ? '…' : deletableIds.length, label: 'Deletable' },
      { value: selectedIds.size, label: 'Selected' },
    ],
    [users.length, deletableIds.length, selectedIds.size, isLoading]
  )

  return (
    <AdminSubpageShell
      title="All users"
      subtitle="View every registered customer account with contact details, verification status, and sign-in preferences. Select accounts to remove (admin accounts are protected)."
      stats={headerStats}
      loadError={error || null}
    >
      <section className="panel admin-stack">
        <div className="admin-toolbar">
          <h2 className="admin-section-title">Registered accounts</h2>
          <div className="admin-order__actions">
            {selectedIds.size > 0 ? (
              <button
                type="button"
                className="back-button admin-item__delete"
                onClick={() => void handleDeleteSelected()}
                disabled={isLoading || isDeleting}
              >
                {isDeleting ? 'Deleting…' : `Delete selected (${selectedIds.size})`}
              </button>
            ) : null}
            <button
              type="button"
              className="back-button btn-icon"
              onClick={() => void load()}
              disabled={isLoading || isDeleting}
            >
              <RefreshIcon />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="auth-card admin-card">
          <div className="admin-list__header admin-list__header--select">
            <label className="admin-users-select-all">
              <input
                type="checkbox"
                checked={allDeletableSelected}
                ref={(el) => {
                  if (el) el.indeterminate = selectAllIndeterminate
                }}
                onChange={toggleSelectAll}
                disabled={isLoading || isDeleting || deletableIds.length === 0}
                aria-label="Select all users except admin"
              />
              <span>Select all</span>
            </label>
            <h3 className="profile-heading">Accounts</h3>
            <span className="admin-list__count">{users.length}</span>
          </div>

          {deletableIds.length === 0 && users.some((u) => u.isAdmin) ? (
            <p className="item-description">
              Only the admin account is listed. Admin accounts cannot be selected or deleted.
            </p>
          ) : null}

          {isLoading ? <p className="empty-state">Loading users…</p> : null}

          {!isLoading && !error && users.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty__title">No users yet</p>
              <p className="admin-empty__hint">New sign-ups will appear here.</p>
            </div>
          ) : null}

          {!isLoading && !error && users.length > 0 ? (
            <ul className="admin-item-list">
              {users.map((u) => {
                const isProtected = Boolean(u.isAdmin)
                const isSelected = selectedIds.has(u.id)

                return (
                  <li
                    key={u.id}
                    className={`admin-item admin-item--with-select${
                      isSelected ? ' admin-item--selected' : ''
                    }${isProtected ? ' admin-item--protected' : ''}`}
                  >
                    <label className="admin-users-row-check">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isProtected || isLoading || isDeleting}
                        onChange={(ev) => toggleOne(u.id, ev.target.checked)}
                        aria-label={
                          isProtected
                            ? `${u.name} (admin, cannot delete)`
                            : `Select ${u.name}`
                        }
                      />
                    </label>
                    <div className="admin-item__thumb admin-item__thumb--avatar" aria-hidden>
                      <UserIcon />
                    </div>
                    <div className="admin-item__body">
                      <h3>
                        {u.name}
                        {u.isAdmin ? (
                          <span className="order-status-badge order-status-badge--paid">
                            {' '}
                            Admin
                          </span>
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
                )
              })}
            </ul>
          ) : null}
        </div>
      </section>
    </AdminSubpageShell>
  )
}

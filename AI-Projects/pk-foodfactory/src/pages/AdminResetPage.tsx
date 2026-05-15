import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminNav } from '../components/AdminNav'
import { AppHeaderApp } from '../components/AppHeader'
import {
  AlertIcon,
  ChevronLeftIcon,
  RotateLeftIcon,
  TrashIcon,
} from '../components/Icons'
import { adminResetAPI, type ResetResponse, type ResetSummary } from '../services/api'
import { useFoodContext } from '../state/FoodContext'
import { useToast } from '../state/ToastContext'

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

type ScopeKey = 'delivery-agents' | 'categories' | 'food-items' | 'orders' | 'users' | 'all'

interface ScopeCardProps {
  id: ScopeKey
  title: string
  subtitle: string
  itemsLabel: string
  count: number | string
  danger?: boolean
  busy: boolean
  disabled?: boolean
  /** Returns a confirmation prompt string for `window.confirm`. */
  confirmText: string
  onRun: () => Promise<void>
}

function ScopeCard({
  title,
  subtitle,
  itemsLabel,
  count,
  danger,
  busy,
  disabled,
  confirmText,
  onRun,
}: ScopeCardProps) {
  const handleClick = async () => {
    if (busy || disabled) return
    if (!window.confirm(confirmText)) return
    await onRun()
  }
  return (
    <article className={`reset-card ${danger ? 'reset-card--danger' : ''}`}>
      <header className="reset-card__head">
        <h3>{title}</h3>
        <span className="reset-card__count">
          {count} <span className="reset-card__count-label">{itemsLabel}</span>
        </span>
      </header>
      <p className="reset-card__body">{subtitle}</p>
      <button
        type="button"
        className={`back-button reset-card__btn btn-icon ${danger ? 'admin-item__delete' : ''}`}
        disabled={busy || disabled}
        onClick={handleClick}
      >
        {danger ? <TrashIcon /> : <RotateLeftIcon />}
        <span>{busy ? 'Clearing…' : disabled ? 'Nothing to clear' : 'Reset'}</span>
      </button>
    </article>
  )
}

export default function AdminResetPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { reloadMenu } = useFoodContext()

  const [summary, setSummary] = useState<ResetSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busyScope, setBusyScope] = useState<ScopeKey | null>(null)
  const [confirmAll, setConfirmAll] = useState('')

  const loadSummary = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await adminResetAPI.summary()
      setSummary(data)
    } catch (err) {
      setLoadError(axiosErrorMessage(err, 'Could not load current data counts'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadSummary()
  }, [])

  const reportSuccess = (label: string, res: ResetResponse) => {
    const parts: string[] = []
    if (res.deliveryAgents !== undefined) parts.push(`${res.deliveryAgents} delivery agent${res.deliveryAgents === 1 ? '' : 's'}`)
    if (res.categories !== undefined) parts.push(`${res.categories} categor${res.categories === 1 ? 'y' : 'ies'}`)
    if (res.foodItems !== undefined) parts.push(`${res.foodItems} food item${res.foodItems === 1 ? '' : 's'}`)
    if (res.orders !== undefined) parts.push(`${res.orders} order${res.orders === 1 ? '' : 's'}`)
    if (res.users !== undefined) parts.push(`${res.users} user${res.users === 1 ? '' : 's'}`)
    const detail = parts.length ? ` (${parts.join(', ')})` : ''
    showToast(`${label} cleared${detail}`, 'success')
  }

  const runScope = async (scope: ScopeKey, runner: () => Promise<ResetResponse>, label: string) => {
    setBusyScope(scope)
    try {
      const res = await runner()
      reportSuccess(label, res)
      await loadSummary()
      // Categories/food items live in FoodContext; refresh it so the home page
      // shows the new empty state immediately for users still on the menu page.
      if (scope === 'categories' || scope === 'food-items' || scope === 'all') {
        try {
          await reloadMenu()
        } catch {
          // non-fatal: summary refresh above already happened
        }
      }
    } catch (err) {
      showToast(axiosErrorMessage(err, `Could not reset ${label.toLowerCase()}`), 'error')
    } finally {
      setBusyScope(null)
    }
  }

  const handleAllSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (confirmAll.trim().toUpperCase() !== 'RESET') return
    if (!window.confirm('This will permanently delete delivery agents, categories, food items, AND orders. Continue?')) return
    setBusyScope('all')
    try {
      const res = await adminResetAPI.all(confirmAll.trim().toUpperCase())
      reportSuccess('Everything', res)
      setConfirmAll('')
      await loadSummary()
      try {
        await reloadMenu()
      } catch {
        // non-fatal
      }
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not reset everything'), 'error')
    } finally {
      setBusyScope(null)
    }
  }

  return (
    <main className="app-shell">
      <AppHeaderApp />

      <section className="category-hero category-hero--danger">
        <div className="category-hero__content">
          <p className="category-hero__kicker">Administration</p>
          <h2 className="category-hero__title">♻️ Reset data</h2>
          <p className="category-hero__subtitle">
            Permanently delete data from the database. Useful when starting from a clean slate.
            Your admin account is always preserved.
          </p>
        </div>
      </section>

      <section className="panel">
        <AdminNav />
      </section>

      {loadError ? (
        <section className="panel">
          <p className="error-message">{loadError}</p>
        </section>
      ) : null}

      <section className="panel reset-grid">
        <ScopeCard
          id="delivery-agents"
          title="Delivery agents"
          subtitle="Removes every onboarded rider. Orders that were already assigned will fall back to 'Waiting for rider'."
          itemsLabel="agents"
          count={isLoading ? '…' : (summary?.deliveryAgents ?? 0)}
          busy={busyScope === 'delivery-agents'}
          disabled={!isLoading && (summary?.deliveryAgents ?? 0) === 0}
          confirmText={`Remove all ${summary?.deliveryAgents ?? 0} delivery agents?`}
          onRun={() => runScope('delivery-agents', adminResetAPI.deliveryAgents, 'Delivery agents')}
        />

        <ScopeCard
          id="categories"
          title="Categories & items"
          subtitle="Deletes every category AND every food item beneath them. The menu becomes empty."
          itemsLabel={`cat • ${isLoading ? '…' : (summary?.foodItems ?? 0)} items`}
          count={isLoading ? '…' : (summary?.categories ?? 0)}
          busy={busyScope === 'categories'}
          disabled={!isLoading && (summary?.categories ?? 0) === 0 && (summary?.foodItems ?? 0) === 0}
          confirmText={`Remove ALL ${summary?.categories ?? 0} categories and ${summary?.foodItems ?? 0} food items?`}
          onRun={() => runScope('categories', adminResetAPI.categories, 'Categories & items')}
        />

        <ScopeCard
          id="food-items"
          title="Food items only"
          subtitle="Removes every dish but keeps the categories. Useful when redoing the menu without losing your category setup."
          itemsLabel="items"
          count={isLoading ? '…' : (summary?.foodItems ?? 0)}
          busy={busyScope === 'food-items'}
          disabled={!isLoading && (summary?.foodItems ?? 0) === 0}
          confirmText={`Remove all ${summary?.foodItems ?? 0} food items? (Categories will remain.)`}
          onRun={() => runScope('food-items', adminResetAPI.foodItems, 'Food items')}
        />

        <ScopeCard
          id="orders"
          title="Orders"
          subtitle="Clears every customer order along with its payment/delivery status. Cannot be undone."
          itemsLabel="orders"
          count={isLoading ? '…' : (summary?.orders ?? 0)}
          busy={busyScope === 'orders'}
          disabled={!isLoading && (summary?.orders ?? 0) === 0}
          confirmText={`Remove all ${summary?.orders ?? 0} orders?`}
          onRun={() => runScope('orders', adminResetAPI.orders, 'Orders')}
        />

        <ScopeCard
          id="users"
          title="Users"
          subtitle="Removes every customer account. Your admin login (and the configured ADMIN_EMAIL) is always preserved so you don't get locked out."
          itemsLabel="users"
          count={isLoading ? '…' : (summary?.users ?? 0)}
          danger
          busy={busyScope === 'users'}
          disabled={!isLoading && (summary?.users ?? 0) === 0}
          confirmText={`Remove all ${summary?.users ?? 0} user accounts? (Your admin login is preserved.)`}
          onRun={() => runScope('users', adminResetAPI.users, 'Users')}
        />
      </section>

      <section className="panel reset-all">
        <h3 className="profile-heading">Reset everything</h3>
        <p className="reset-all__lede">
          One-shot reset for delivery agents, categories, food items, orders AND user accounts.
          Your admin login (and the configured <code>ADMIN_EMAIL</code>) is preserved so you don't
          get locked out. Type <code>RESET</code> below to enable the button.
        </p>
        <form className="auth-form reset-all__form" onSubmit={handleAllSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reset-confirm">Confirmation</label>
            <input
              id="reset-confirm"
              type="text"
              value={confirmAll}
              onChange={(e) => setConfirmAll(e.target.value)}
              placeholder="Type RESET to enable"
              autoComplete="off"
              disabled={busyScope === 'all'}
            />
          </div>
          <button
            type="submit"
            className="proceed-payment-button admin-item__delete reset-all__btn btn-icon"
            disabled={busyScope === 'all' || confirmAll.trim().toUpperCase() !== 'RESET'}
          >
            <AlertIcon />
            <span>
              {busyScope === 'all' ? 'Resetting everything…' : 'Reset everything'}
            </span>
          </button>
        </form>
      </section>

      <section className="panel admin-footer-actions">
        <button
          type="button"
          className="back-button btn-icon"
          onClick={() => navigate('/admin')}
        >
          <ChevronLeftIcon />
          <span>Back to admin</span>
        </button>
      </section>
    </main>
  )
}

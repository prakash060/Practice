import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import {
  CheckIcon,
  LogoutIcon,
  RefreshIcon,
  TruckIcon,
  XIcon,
} from '../components/Icons'
import { agentOrdersAPI, type DeliveryStatus, type OrderDoc } from '../services/api'
import { useDeliveryAuth } from '../state/DeliveryAuthContext'
import { useToast } from '../state/ToastContext'

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function statusLabel(s?: DeliveryStatus): string {
  switch (s) {
    case 'assigned':
      return 'Assigned'
    case 'out_for_delivery':
      return 'Out for delivery'
    case 'delivered':
      return 'Delivered'
    case 'not_delivered':
      return 'Not delivered'
    case 'unassigned':
    default:
      return 'Unassigned'
  }
}

interface OrderCardProps {
  order: OrderDoc
  busy: boolean
  onUpdate: (orderId: string, status: DeliveryStatus, notes?: string) => Promise<void>
}

function OrderCard({ order, busy, onUpdate }: OrderCardProps) {
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)
  const status = order.deliveryStatus ?? 'assigned'
  const isFinal = status === 'delivered' || status === 'not_delivered'

  const cust = order.customerDetails || {}

  return (
    <article className="order-row delivery-order">
      <div className="order-row__top">
        <div>
          <strong>Order #{order.orderId}</strong>
          <p className="item-description">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="order-row__right">
          <span className={`status-pill status-pill--${status}`}>{statusLabel(status)}</span>
          <span className="item-total">₹{order.totalAmount}</span>
        </div>
      </div>

      <div className="delivery-order__customer">
        <p>
          <strong>{cust.name || 'Customer'}</strong>
          {cust.phone ? ` • ${cust.phone}` : ''}
        </p>
        {cust.address ? <p className="item-description">{cust.address}</p> : null}
      </div>

      <div className="order-row__items">
        {order.items.slice(0, 4).map((it) => (
          <span key={`${order.orderId}-${it.foodId}`} className="order-chip">
            {it.name} × {it.quantity}
          </span>
        ))}
        {order.items.length > 4 ? (
          <span className="order-chip order-chip--muted">+{order.items.length - 4} more</span>
        ) : null}
      </div>

      {order.deliveryNotes ? (
        <p className="item-description delivery-order__notes">Note: {order.deliveryNotes}</p>
      ) : null}

      {!isFinal ? (
        <>
          {showNotes ? (
            <div className="form-group">
              <label htmlFor={`notes-${order.orderId}`}>Reason / notes (optional)</label>
              <textarea
                id={`notes-${order.orderId}`}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                placeholder="e.g. Customer not reachable"
              />
            </div>
          ) : null}

          <div className="delivery-order__actions">
            {status === 'assigned' ? (
              <button
                type="button"
                className="back-button btn-icon"
                disabled={busy}
                onClick={() => onUpdate(order.orderId, 'out_for_delivery')}
              >
                <TruckIcon />
                <span>Mark out for delivery</span>
              </button>
            ) : null}
            <button
              type="button"
              className="proceed-payment-button delivery-order__btn btn-icon"
              disabled={busy}
              onClick={() => onUpdate(order.orderId, 'delivered', notes.trim() || undefined)}
            >
              <CheckIcon />
              <span>Mark delivered</span>
            </button>
            <button
              type="button"
              className="back-button admin-item__delete btn-icon"
              disabled={busy}
              onClick={() => {
                if (!showNotes) {
                  setShowNotes(true)
                  return
                }
                void onUpdate(order.orderId, 'not_delivered', notes.trim() || undefined)
              }}
            >
              <XIcon />
              <span>{showNotes ? 'Confirm not delivered' : 'Mark not delivered'}</span>
            </button>
          </div>
        </>
      ) : (
        <p className="item-description">
          Finalised on {formatDate(order.deliveryStatusUpdatedAt)}
        </p>
      )}
    </article>
  )
}

export default function DeliveryDashboardPage() {
  const { agent, logout } = useDeliveryAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null)

  const loadOrders = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await agentOrdersAPI.list()
      setOrders(data)
    } catch (err) {
      setError(axiosErrorMessage(err, 'Could not load orders'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter(
      (o) => o.deliveryStatus === 'assigned' || o.deliveryStatus === 'out_for_delivery'
    )
  }, [orders, filter])

  const handleUpdate = async (
    orderId: string,
    status: DeliveryStatus,
    notes?: string
  ) => {
    setBusyOrderId(orderId)
    try {
      const updated = await agentOrdersAPI.updateStatus(orderId, { status, notes })
      setOrders((cur) =>
        cur.map((o) =>
          o.orderId === orderId
            ? {
                ...o,
                deliveryStatus: updated.deliveryStatus,
                deliveryNotes: updated.deliveryNotes,
                deliveryStatusUpdatedAt: updated.deliveryStatusUpdatedAt,
              }
            : o
        )
      )
      showToast(
        status === 'delivered'
          ? 'Marked as delivered'
          : status === 'not_delivered'
            ? 'Marked as not delivered'
            : 'Status updated',
        'success'
      )
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not update status'), 'error')
    } finally {
      setBusyOrderId(null)
    }
  }

  return (
    <main className="app-shell delivery-shell">
      <header className="brand-header brand-header--flow">
        <div className="brand-header__left">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark__dot" />
          </div>
          <div>
            <p className="eyebrow">Delivery dashboard</p>
            <h1 className="brand-title">{agent ? `Hi ${agent.name.split(' ')[0]}` : 'Rider'}</h1>
          </div>
        </div>
        <div className="brand-header__right brand-header__actions">
          <button type="button" className="back-button btn-icon" onClick={logout}>
            <LogoutIcon />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <section className="panel delivery-toolbar">
        <div className="admin-filter-row">
          <label htmlFor="delivery-filter">Show</label>
          <select
            id="delivery-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'open' | 'all')}
          >
            <option value="open">Open (assigned + out for delivery)</option>
            <option value="all">All assigned to me</option>
          </select>
        </div>
        <button
          type="button"
          className="back-button btn-icon"
          onClick={() => void loadOrders()}
        >
          <RefreshIcon />
          <span>Refresh</span>
        </button>
      </section>

      <section className="checkout-content">
        <div className="checkout-summary">
          {isLoading ? <p className="empty-state">Loading your orders…</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          {!isLoading && !error && visibleOrders.length === 0 ? (
            <p className="empty-state">
              {filter === 'open'
                ? 'No active orders right now. You will see assignments here as they come in.'
                : 'No orders have been assigned to you yet.'}
            </p>
          ) : null}

          {!isLoading && !error && visibleOrders.length > 0 ? (
            <div className="orders-list">
              {visibleOrders.map((o) => (
                <OrderCard
                  key={o.orderId}
                  order={o}
                  busy={busyOrderId === o.orderId}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}

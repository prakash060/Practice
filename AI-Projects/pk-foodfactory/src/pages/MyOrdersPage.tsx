import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import { ChevronLeftIcon } from '../components/Icons'
import { ordersAPI, type DeliveryStatus, type OrderDoc } from '../services/api'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

function deliveryLabel(s?: DeliveryStatus): string {
  switch (s) {
    case 'assigned':
      return 'Rider assigned'
    case 'out_for_delivery':
      return 'Out for delivery'
    case 'delivered':
      return 'Delivered'
    case 'not_delivered':
      return 'Not delivered'
    case 'unassigned':
    default:
      return 'Waiting for rider'
  }
}

export default function MyOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setIsLoading(true)
        setError('')
        const res = await ordersAPI.getMyOrders()
        if (!cancelled) setOrders(res)
      } catch (e: any) {
        const msg = e?.response?.data?.error || 'Failed to load orders'
        if (!cancelled) setError(String(msg))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const hasOrders = orders.length > 0
  const title = useMemo(() => (hasOrders ? `My orders (${orders.length})` : 'My orders'), [hasOrders, orders.length])

  return (
    <main className="checkout-page">
      <AppHeaderApp />
      <header className="checkout-header">
        <button
          type="button"
          className="back-button btn-icon"
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon />
          <span>Back to Home</span>
        </button>
        <h1>{title}</h1>
      </header>

      <section className="checkout-content">
        <div className="checkout-summary">
          {isLoading ? <p className="empty-state">Loading your orders…</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          {!isLoading && !error && !hasOrders ? (
            <p className="empty-state">No orders yet.</p>
          ) : null}

          {!isLoading && !error && hasOrders ? (
            <div className="orders-list">
              {orders.map((o) => {
                const dStatus = o.deliveryStatus ?? 'unassigned'
                return (
                  <article key={o.orderId} className="order-row">
                    <div className="order-row__top">
                      <div>
                        <strong>Order #{o.orderId}</strong>
                        <p className="item-description">{formatDate(o.createdAt)}</p>
                      </div>
                      <div className="order-row__right">
                        <span className={`order-status order-status--${o.paymentStatus}`}>
                          {o.paymentStatus}
                        </span>
                        <span className={`status-pill status-pill--${dStatus}`}>
                          {deliveryLabel(dStatus)}
                        </span>
                        <span className="item-total">₹{o.totalAmount}</span>
                      </div>
                    </div>
                    <div className="order-row__items">
                      {o.items.slice(0, 3).map((it) => (
                        <span key={`${o.orderId}-${it.foodId}`} className="order-chip">
                          {it.name} × {it.quantity}
                        </span>
                      ))}
                      {o.items.length > 3 ? (
                        <span className="order-chip order-chip--muted">
                          +{o.items.length - 3} more
                        </span>
                      ) : null}
                    </div>
                    {o.deliveryAgent ? (
                      <div className="order-row__delivery">
                        <div
                          className="order-row__delivery-photo"
                          style={{
                            backgroundImage: o.deliveryAgent.photoUrl
                              ? `url(${o.deliveryAgent.photoUrl})`
                              : undefined,
                          }}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="item-description">
                            <strong>{o.deliveryAgent.name}</strong>
                            {o.deliveryAgent.phone ? ` • ${o.deliveryAgent.phone}` : ''}
                          </p>
                          <p className="item-description">
                            {o.deliveryAgent.vehicleType}
                            {o.deliveryAgent.vehicleNumber
                              ? ` • ${o.deliveryAgent.vehicleNumber}`
                              : ''}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {o.deliveryNotes ? (
                      <p className="item-description">Rider note: {o.deliveryNotes}</p>
                    ) : null}
                  </article>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}


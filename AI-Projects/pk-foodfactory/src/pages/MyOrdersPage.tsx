import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import { ordersAPI, type OrderDoc } from '../services/api'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
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
        <button type="button" className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
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
              {orders.map((o) => (
                <article key={o.orderId} className="order-row">
                  <div className="order-row__top">
                    <div>
                      <strong>Order #{o.orderId}</strong>
                      <p className="item-description">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="order-row__right">
                      <span className={`order-status order-status--${o.paymentStatus}`}>{o.paymentStatus}</span>
                      <span className="item-total">₹{o.totalAmount}</span>
                    </div>
                  </div>
                  <div className="order-row__items">
                    {o.items.slice(0, 3).map((it) => (
                      <span key={`${o.orderId}-${it.foodId}`} className="order-chip">
                        {it.name} × {it.quantity}
                      </span>
                    ))}
                    {o.items.length > 3 ? <span className="order-chip order-chip--muted">+{o.items.length - 3} more</span> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}


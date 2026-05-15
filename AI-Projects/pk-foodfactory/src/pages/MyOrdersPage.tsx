import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import {
  AlertIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  HashIcon,
  PackageIcon,
  PhoneIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserIcon,
  XIcon,
  type IconProps,
} from '../components/Icons'
import { ordersAPI, type DeliveryStatus, type OrderDoc } from '../services/api'

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

function deliveryStatusIcon(s?: DeliveryStatus) {
  const iconProps: IconProps = { size: 14 }
  switch (s) {
    case 'assigned':
      return <UserIcon {...iconProps} />
    case 'out_for_delivery':
      return <TruckIcon {...iconProps} />
    case 'delivered':
      return <CheckIcon {...iconProps} />
    case 'not_delivered':
      return <XIcon {...iconProps} />
    case 'unassigned':
    default:
      return <ClockIcon {...iconProps} />
  }
}

function paymentStatusIcon(status: OrderDoc['paymentStatus']) {
  const iconProps: IconProps = { size: 14 }
  switch (status) {
    case 'paid':
      return <CheckIcon {...iconProps} />
    case 'pending':
      return <ClockIcon {...iconProps} />
    case 'failed':
    case 'refunded':
      return <AlertIcon {...iconProps} />
    default:
      return <ClockIcon {...iconProps} />
  }
}

function OrderCardSkeleton() {
  return (
    <article className="order-card order-card--skeleton" aria-hidden="true">
      <div className="order-card__head">
        <div>
          <span className="skeleton skeleton--line skeleton--w-40" />
          <span className="skeleton skeleton--line skeleton--w-30" />
        </div>
        <div>
          <span className="skeleton skeleton--line skeleton--w-20" />
        </div>
      </div>
      <div className="order-card__statuses">
        <span className="skeleton skeleton--pill" />
        <span className="skeleton skeleton--pill" />
      </div>
      <div className="order-card__items">
        <span className="skeleton skeleton--chip" />
        <span className="skeleton skeleton--chip" />
        <span className="skeleton skeleton--chip" />
      </div>
    </article>
  )
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

  const subtitle = useMemo(() => {
    if (isLoading) return 'Fetching your recent activity…'
    if (error) return 'We had trouble loading your orders.'
    if (!hasOrders) return "You haven't placed any orders yet."
    return `You have ${orders.length} order${orders.length === 1 ? '' : 's'}.`
  }, [isLoading, error, hasOrders, orders.length])

  return (
    <main className="my-orders-page">
      <AppHeaderApp />

      <section className="orders-hero">
        <button
          type="button"
          className="back-button btn-icon orders-hero__back"
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon />
          <span>Back to Home</span>
        </button>
        <div className="orders-hero__content">
          <p className="orders-hero__kicker">
            <ReceiptIcon size={14} />
            <span>Your activity</span>
          </p>
          <div className="orders-hero__heading">
            <h1>My orders</h1>
            {hasOrders ? (
              <span className="orders-hero__count" aria-label={`${orders.length} orders`}>
                {orders.length}
              </span>
            ) : null}
          </div>
          <p className="orders-hero__subtitle">{subtitle}</p>
        </div>
      </section>

      <section className="orders-content">
        {error ? (
          <div className="orders-banner orders-banner--error" role="alert">
            <AlertIcon />
            <span>{error}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="orders-list">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        ) : !error && !hasOrders ? (
          <div className="orders-empty">
            <div className="orders-empty__icon" aria-hidden="true">
              <ShoppingBagIcon size={32} />
            </div>
            <h2>No orders yet</h2>
            <p>
              Once you place your first order it will show up here with live
              delivery updates.
            </p>
            <button
              type="button"
              className="proceed-payment-button btn-icon"
              onClick={() => navigate('/')}
            >
              <ShoppingBagIcon />
              <span>Browse the menu</span>
            </button>
          </div>
        ) : null}

        {!isLoading && !error && hasOrders ? (
          <div className="orders-list">
            {orders.map((o) => {
              const dStatus = o.deliveryStatus ?? 'unassigned'
              const visibleItems = o.items.slice(0, 3)
              const extraItemCount = Math.max(o.items.length - visibleItems.length, 0)
              const itemUnitCount = o.items.reduce((sum, it) => sum + it.quantity, 0)

              return (
                <article key={o.orderId} className="order-card">
                  <header className="order-card__head">
                    <div className="order-card__heading">
                      <h3 className="order-card__id">
                        <span className="order-card__id-icon" aria-hidden="true">
                          <HashIcon size={14} />
                        </span>
                        Order {o.orderId}
                      </h3>
                      <p className="order-card__date">
                        <ClockIcon size={14} />
                        <span>{formatDate(o.createdAt)}</span>
                      </p>
                    </div>
                    <div className="order-card__total">
                      <span className="order-card__total-label">Total</span>
                      <strong>₹{o.totalAmount}</strong>
                    </div>
                  </header>

                  <div className="order-card__statuses">
                    <span
                      className={`status-pill status-pill--${o.paymentStatus} status-pill--icon`}
                    >
                      {paymentStatusIcon(o.paymentStatus)}
                      <span>{o.paymentStatus}</span>
                    </span>
                    <span
                      className={`status-pill status-pill--${dStatus} status-pill--icon`}
                    >
                      {deliveryStatusIcon(dStatus)}
                      <span>{deliveryLabel(dStatus)}</span>
                    </span>
                  </div>

                  <div className="order-card__items-wrap">
                    <p className="order-card__items-label">
                      <PackageIcon size={14} />
                      <span>
                        {itemUnitCount} item{itemUnitCount === 1 ? '' : 's'}
                      </span>
                    </p>
                    <div className="order-card__items">
                      {visibleItems.map((it) => (
                        <span
                          key={`${o.orderId}-${it.foodId}`}
                          className="order-chip"
                        >
                          {it.name}
                          <span className="order-chip__sep">×</span>
                          <strong>{it.quantity}</strong>
                        </span>
                      ))}
                      {extraItemCount > 0 ? (
                        <span className="order-chip order-chip--muted">
                          +{extraItemCount} more
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {o.deliveryAgent ? (
                    <div className="order-card__rider">
                      <div
                        className="order-card__rider-avatar"
                        style={{
                          backgroundImage: o.deliveryAgent.photoUrl
                            ? `url(${o.deliveryAgent.photoUrl})`
                            : undefined,
                        }}
                        aria-hidden="true"
                      >
                        {o.deliveryAgent.photoUrl ? null : <UserIcon size={20} />}
                      </div>
                      <div className="order-card__rider-info">
                        <p className="order-card__rider-name">
                          <strong>{o.deliveryAgent.name}</strong>
                          <span className="order-card__rider-role">Your rider</span>
                        </p>
                        <div className="order-card__rider-meta">
                          {o.deliveryAgent.phone ? (
                            <a
                              href={`tel:${o.deliveryAgent.phone}`}
                              className="order-card__rider-chip"
                            >
                              <PhoneIcon size={14} />
                              <span>{o.deliveryAgent.phone}</span>
                            </a>
                          ) : null}
                          <span className="order-card__rider-chip order-card__rider-chip--muted">
                            <TruckIcon size={14} />
                            <span>
                              {o.deliveryAgent.vehicleType}
                              {o.deliveryAgent.vehicleNumber
                                ? ` • ${o.deliveryAgent.vehicleNumber}`
                                : ''}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {o.deliveryNotes ? (
                    <div className="order-card__note" role="note">
                      <AlertIcon size={16} />
                      <div>
                        <strong>Rider note</strong>
                        <p>{o.deliveryNotes}</p>
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </main>
  )
}

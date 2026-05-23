import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminNav } from '../components/AdminNav'
import { AgentAvatar } from '../components/AgentAvatar'
import { AppHeaderApp } from '../components/AppHeader'
import {
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  HashIcon,
  PackageIcon,
  RefreshIcon,
  TruckIcon,
} from '../components/Icons'
import {
  DELIVERY_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  deliveryLabelAdmin,
  deliveryStatusIcon,
  formatOrderDate,
  paymentStatusIcon,
} from '../lib/orderDisplay'
import {
  adminOrdersAPI,
  deliveryAgentsAPI,
  type DeliveryAgentDoc,
  type DeliveryStatus,
  type OrderDoc,
} from '../services/api'
import { useToast } from '../state/ToastContext'

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

type OrderFilter = 'all' | 'active' | 'done'

interface AdminOrderRowProps {
  order: OrderDoc
  agents: DeliveryAgentDoc[]
  busy: boolean
  onSave: (
    orderId: string,
    patch: {
      deliveryStatus: DeliveryStatus
      deliveryAgentId: string | null
      deliveryNotes: string
      paymentStatus: OrderDoc['paymentStatus']
      autoAssign?: boolean
    }
  ) => Promise<void>
}

function AdminOrderRow({ order, agents, busy, onSave }: AdminOrderRowProps) {
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(
    order.deliveryStatus ?? 'unassigned'
  )
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus)
  const [agentId, setAgentId] = useState(order.deliveryAgentId ?? '')
  const [notes, setNotes] = useState(order.deliveryNotes ?? '')

  useEffect(() => {
    setDeliveryStatus(order.deliveryStatus ?? 'unassigned')
    setPaymentStatus(order.paymentStatus)
    setAgentId(order.deliveryAgentId ?? '')
    setNotes(order.deliveryNotes ?? '')
  }, [order])

  const cust = order.customerDetails ?? {}
  const isFinal =
    order.deliveryStatus === 'delivered' || order.deliveryStatus === 'not_delivered'

  return (
    <article className="order-row admin-order">
      <div className="order-row__top">
        <div>
          <strong className="admin-order__id">
            <HashIcon size={14} />
            Order {order.orderId}
          </strong>
          <p className="item-description">{formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="order-row__right">
          <span className="item-total">₹{order.totalAmount}</span>
        </div>
      </div>

      <div className="admin-order__customer">
        <p>
          <strong>{cust.name || 'Customer'}</strong>
          {cust.phone ? ` • ${cust.phone}` : ''}
          {cust.email ? ` • ${cust.email}` : ''}
        </p>
        {cust.address ? <p className="item-description">{cust.address}</p> : null}
      </div>

      <div className="order-card__statuses">
        <span className={`status-pill status-pill--${order.paymentStatus} status-pill--icon`}>
          {paymentStatusIcon(order.paymentStatus)}
          <span>{order.paymentStatus}</span>
        </span>
        <span
          className={`status-pill status-pill--${order.deliveryStatus ?? 'unassigned'} status-pill--icon`}
        >
          {deliveryStatusIcon(order.deliveryStatus)}
          <span>{deliveryLabelAdmin(order.deliveryStatus)}</span>
        </span>
      </div>

      <div className="order-row__items">
        {order.items.slice(0, 5).map((it) => (
          <span key={`${order.orderId}-${it.foodId}`} className="order-chip">
            <PackageIcon size={12} />
            {it.name} × {it.quantity}
          </span>
        ))}
        {order.items.length > 5 ? (
          <span className="order-chip order-chip--muted">+{order.items.length - 5} more</span>
        ) : null}
      </div>

      {order.deliveryAgent ? (
        <div className="order-card__rider admin-order__rider-current">
          <AgentAvatar
            photoUrl={order.deliveryAgent.photoUrl}
            name={order.deliveryAgent.name}
            size="xs"
          />
          <span>
            Current rider: <strong>{order.deliveryAgent.name}</strong>
          </span>
        </div>
      ) : null}

      <div className="admin-order__controls">
        <div className="form-group">
          <label htmlFor={`pay-${order.orderId}`}>Payment</label>
          <select
            id={`pay-${order.orderId}`}
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value as OrderDoc['paymentStatus'])
            }
            disabled={busy}
          >
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`agent-${order.orderId}`}>Rider</label>
          <select
            id={`agent-${order.orderId}`}
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            disabled={busy}
          >
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.status})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={`del-${order.orderId}`}>Delivery status</label>
          <select
            id={`del-${order.orderId}`}
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
            disabled={busy}
          >
            {DELIVERY_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {deliveryLabelAdmin(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`notes-${order.orderId}`}>Delivery notes</label>
        <textarea
          id={`notes-${order.orderId}`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
          disabled={busy}
          placeholder="Visible to customer on My orders"
        />
      </div>

      <div className="admin-order__actions">
        <button
          type="button"
          className="proceed-payment-button btn-icon"
          disabled={busy}
          onClick={() =>
            void onSave(order.orderId, {
              deliveryStatus,
              deliveryAgentId: agentId || null,
              deliveryNotes: notes,
              paymentStatus,
            })
          }
        >
          <CheckIcon />
          <span>Save changes</span>
        </button>
        {!agentId &&
        (deliveryStatus === 'assigned' || deliveryStatus === 'out_for_delivery') ? (
          <button
            type="button"
            className="back-button btn-icon"
            disabled={busy}
            onClick={() =>
              void onSave(order.orderId, {
                deliveryStatus,
                deliveryAgentId: null,
                deliveryNotes: notes,
                paymentStatus,
                autoAssign: true,
              })
            }
          >
            <TruckIcon />
            <span>Auto-assign rider</span>
          </button>
        ) : null}
        {isFinal && order.deliveryStatusUpdatedAt ? (
          <span className="item-description">
            <ClockIcon size={14} />
            Updated {formatOrderDate(order.deliveryStatusUpdatedAt)}
          </span>
        ) : null}
      </div>
    </article>
  )
}

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [agents, setAgents] = useState<DeliveryAgentDoc[]>([])
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) {
      setIsLoading(true)
      setError('')
    }
    try {
      const [orderList, agentList] = await Promise.all([
        adminOrdersAPI.list(),
        deliveryAgentsAPI.list(),
      ])
      setOrders(orderList)
      setAgents(agentList)
    } catch (err) {
      const msg = axiosErrorMessage(err, 'Could not load orders')
      if (!quiet) setError(msg)
      else showToast(msg, 'error')
    } finally {
      if (!quiet) setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void load()
  }, [load])

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return orders
    if (filter === 'active') {
      return orders.filter(
        (o) =>
          o.deliveryStatus === 'unassigned' ||
          o.deliveryStatus === 'assigned' ||
          o.deliveryStatus === 'out_for_delivery'
      )
    }
    return orders.filter(
      (o) => o.deliveryStatus === 'delivered' || o.deliveryStatus === 'not_delivered'
    )
  }, [orders, filter])

  const handleSave = async (
    orderId: string,
    patch: {
      deliveryStatus: DeliveryStatus
      deliveryAgentId: string | null
      deliveryNotes: string
      paymentStatus: OrderDoc['paymentStatus']
      autoAssign?: boolean
    }
  ) => {
    setBusyOrderId(orderId)
    try {
      const updated = await adminOrdersAPI.updateDelivery(orderId, patch)
      setOrders((cur) => cur.map((o) => (o.orderId === orderId ? updated : o)))
      showToast('Order updated', 'success')
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not update order'), 'error')
    } finally {
      setBusyOrderId(null)
    }
  }

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
          <h1>Orders & delivery</h1>
          <p>
            View every order, assign riders, and update payment and delivery status. Customers
            see the same status on My orders.
          </p>
        </header>

        <div className="panel admin-order__toolbar">
          <div className="admin-filter-row">
            <label htmlFor="admin-order-filter">Show</label>
            <select
              id="admin-order-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as OrderFilter)}
            >
              <option value="all">All orders</option>
              <option value="active">In progress</option>
              <option value="done">Completed</option>
            </select>
          </div>
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
        {isLoading ? <p className="empty-state">Loading orders…</p> : null}

        {!isLoading && !error && visibleOrders.length === 0 ? (
          <p className="empty-state">No orders in this view.</p>
        ) : null}

        {!isLoading && !error && visibleOrders.length > 0 ? (
          <div className="orders-list admin-orders-list">
            {visibleOrders.map((o) => (
              <AdminOrderRow
                key={o.orderId}
                order={o}
                agents={agents}
                busy={busyOrderId === o.orderId}
                onSave={handleSave}
              />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}

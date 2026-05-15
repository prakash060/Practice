import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ClockIcon,
  EditIcon,
  LockIcon,
  MapPinIcon,
  PackageIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TruckIcon,
  ZapIcon,
} from '../components/Icons'
import { GENERIC_FOOD_IMAGE } from '../constants/categories'
import { DELIVERY_FEE_INR } from '../constants/pricing'
import { useAuth } from '../state/AuthContext'
import { useFood } from '../hooks/useFood'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems, getCategoryMeta } = useFood()
  const { user } = useAuth()

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal])
  const finalAmount = useMemo(
    () => subtotal + DELIVERY_FEE_INR + tax,
    [subtotal, tax]
  )
  const totalUnits = useMemo(
    () => cartItems.reduce((sum, it) => sum + it.quantity, 0),
    [cartItems]
  )

  const handleProceedToPayment = () => {
    if (cartItems.length > 0) {
      navigate('/payment')
    }
  }

  const handleBackToMenu = () => {
    navigate('/')
  }

  const isEmpty = cartItems.length === 0

  return (
    <main className="payment-shell">
      <AppHeaderApp />

      <section className="pm-hero">
        <button
          type="button"
          className="back-button btn-icon pm-hero__back"
          onClick={handleBackToMenu}
        >
          <ChevronLeftIcon />
          <span>Continue Shopping</span>
        </button>
        <div className="pm-hero__content">
          <p className="pm-hero__kicker">
            <ReceiptIcon size={14} />
            <span>Step 1 of 2</span>
          </p>
          <h1>Review your order</h1>
          <p className="pm-hero__subtitle">
            {isEmpty
              ? 'Your cart is empty — add a few dishes from the menu.'
              : (
                <>
                  Verify items and delivery before paying{' '}
                  <strong>₹{finalAmount}</strong>.
                </>
              )}
          </p>
        </div>
      </section>

      {isEmpty ? (
        <section className="orders-empty">
          <div className="orders-empty__icon" aria-hidden="true">
            <ShoppingBagIcon size={32} />
          </div>
          <h2>Nothing to review yet</h2>
          <p>Pick a few dishes from the menu and they'll show up here.</p>
          <button
            type="button"
            className="proceed-payment-button btn-icon"
            onClick={handleBackToMenu}
          >
            <ShoppingBagIcon />
            <span>Browse the menu</span>
          </button>
        </section>
      ) : (
        <section className="pm-layout">
          <aside className="pm-summary">
            <h2 className="pm-summary__title">Order summary</h2>
            <ul className="pm-summary__list">
              <li>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </li>
              <li>
                <span>Delivery fee</span>
                <span>₹{DELIVERY_FEE_INR}</span>
              </li>
              <li>
                <span>Tax (5%)</span>
                <span>₹{tax}</span>
              </li>
            </ul>
            <div className="pm-summary__total">
              <span>Total</span>
              <strong>₹{finalAmount}</strong>
            </div>
            <div className="pm-trust">
              <span className="pm-trust__chip">
                <ZapIcon size={14} />
                <span>30-min delivery</span>
              </span>
              <span className="pm-trust__chip">
                <ShieldCheckIcon size={14} />
                <span>Live tracking</span>
              </span>
            </div>
            <button
              type="button"
              className="proceed-payment-button btn-icon pm-cta__btn"
              onClick={handleProceedToPayment}
              disabled={isEmpty}
            >
              <LockIcon />
              <span>Proceed to Payment</span>
              <ArrowRightIcon />
            </button>
            <p className="pm-cta__note">
              <ShieldCheckIcon size={14} />
              <span>
                You'll be able to choose UPI, Card, or Net Banking on the next
                step.
              </span>
            </p>
          </aside>

          <div className="pm-detail">
            <article className="co-section">
              <header className="co-section__head">
                <h2>
                  <span className="co-section__icon" aria-hidden="true">
                    <PackageIcon size={16} />
                  </span>
                  Items in your order
                </h2>
                <span className="co-section__count">
                  {totalUnits} item{totalUnits === 1 ? '' : 's'}
                </span>
              </header>

              <ul className="co-item-list">
                {cartItems.map((item) => {
                  const meta = getCategoryMeta(item.category)
                  const imgSrc =
                    item.imageUrl || meta.imageUrl || GENERIC_FOOD_IMAGE
                  const lineTotal = item.price * item.quantity
                  return (
                    <li key={item.id} className="co-item">
                      <div
                        className="co-item__thumb"
                        style={{ backgroundImage: `url(${imgSrc})` }}
                        aria-hidden="true"
                      >
                        <span className="co-item__emoji">{meta.emoji}</span>
                      </div>
                      <div className="co-item__body">
                        <p className="co-item__name">
                          <strong>{item.name}</strong>
                          <span className="co-item__category">
                            {meta.label || item.category}
                          </span>
                        </p>
                        <p className="co-item__meta">
                          <span className="co-item__qty">
                            Qty <strong>{item.quantity}</strong>
                          </span>
                          <span className="co-item__sep">·</span>
                          <span>₹{item.price} each</span>
                        </p>
                      </div>
                      <div className="co-item__total">₹{lineTotal}</div>
                    </li>
                  )
                })}
              </ul>
            </article>

            <article className="co-section">
              <header className="co-section__head">
                <h2>
                  <span className="co-section__icon" aria-hidden="true">
                    <MapPinIcon size={16} />
                  </span>
                  Delivery address
                </h2>
                <button
                  type="button"
                  className="co-section__action btn-icon"
                  onClick={() => navigate('/profile')}
                >
                  <EditIcon size={14} />
                  <span>Edit</span>
                </button>
              </header>

              <div className="co-address">
                <div className="co-address__avatar" aria-hidden="true">
                  <MapPinIcon size={20} />
                </div>
                <div className="co-address__body">
                  <p className="co-address__name">
                    <strong>{user?.name ?? 'You'}</strong>
                    {user?.phone ? (
                      <span className="co-address__phone">{user.phone}</span>
                    ) : null}
                  </p>
                  <p className="co-address__line">
                    {user?.address?.trim() || (
                      <span className="co-address__missing">
                        No address yet — add one from your profile.
                      </span>
                    )}
                  </p>
                  <p className="co-address__hint">
                    <span>Update anytime from your profile.</span>
                  </p>
                </div>
              </div>

              <div className="co-eta">
                <span className="co-eta__chip">
                  <TruckIcon size={14} />
                  <span>Out for delivery within 10 min of pickup</span>
                </span>
                <span className="co-eta__chip">
                  <ClockIcon size={14} />
                  <span>Estimated arrival: 25–35 min</span>
                </span>
              </div>
            </article>
          </div>
        </section>
      )}
    </main>
  )
}

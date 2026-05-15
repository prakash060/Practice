import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import {
  ArrowRightIcon,
  BankIcon,
  CheckIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  LockIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  type IconProps,
} from '../components/Icons'
import { DELIVERY_FEE_INR } from '../constants/pricing'
import { useFood } from '../hooks/useFood'

type PaymentScreen = 'checkout' | 'success'
type Method = 'upi' | 'card' | 'netbanking'

interface MethodCard {
  id: Method
  title: string
  description: string
  badges: string[]
  Icon: (props: IconProps) => ReactElement
}

const METHODS: MethodCard[] = [
  {
    id: 'upi',
    title: 'UPI',
    description: 'Pay instantly using any UPI app on your phone.',
    badges: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
    Icon: SmartphoneIcon,
  },
  {
    id: 'card',
    title: 'Credit / Debit card',
    description: 'Visa, Mastercard, RuPay and American Express accepted.',
    badges: ['Visa', 'Mastercard', 'RuPay', 'Amex'],
    Icon: CreditCardIcon,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    description: 'Securely log in to your bank to confirm the payment.',
    badges: ['HDFC', 'ICICI', 'SBI', 'Axis', '+more'],
    Icon: BankIcon,
  },
]

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, clearCart } = useFood()
  const [currentScreen, setCurrentScreen] = useState<PaymentScreen>('checkout')
  const [orderId, setOrderId] = useState<string>('')

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )
  const tax = useMemo(() => Math.round(subtotal * 0.05), [subtotal])
  const finalAmount = useMemo(
    () => subtotal + DELIVERY_FEE_INR + tax,
    [subtotal, tax]
  )

  useEffect(() => {
    if (cartItems.length === 0 && currentScreen !== 'success') {
      const t = setTimeout(() => navigate('/'), 1200)
      return () => clearTimeout(t)
    }
  }, [cartItems.length, currentScreen, navigate])

  useEffect(() => {
    const state = (location.state ?? {}) as { paidOrderId?: string }
    if (state.paidOrderId) {
      setOrderId(state.paidOrderId)
      setCurrentScreen('success')
      navigate('/payment', { replace: true })
    }
  }, [location.state, navigate])

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  const goToMethodPage = (method: Method) => {
    navigate(`/payment/${method}`)
  }

  useEffect(() => {
    if (currentScreen !== 'success') return
    clearCart()
    const t = setTimeout(() => {
      navigate('/', {
        replace: true,
        state: {
          orderId,
          status: 'Order placed successfully',
        },
      })
    }, 3000)
    return () => clearTimeout(t)
  }, [clearCart, currentScreen, navigate, orderId])

  if (cartItems.length === 0 && currentScreen !== 'success') {
    return (
      <main className="payment-shell">
        <AppHeaderApp />
        <div className="orders-banner orders-banner--error">
          Your cart is empty. Redirecting to the menu…
        </div>
      </main>
    )
  }

  if (currentScreen === 'success') {
    return (
      <main className="payment-shell">
        <AppHeaderApp />
        <section className="pm-success">
          <div className="pm-success__icon">
            <CheckIcon size={48} />
          </div>
          <h2>Payment successful</h2>
          <p>Your order has been placed.</p>
          {orderId ? (
            <p className="pm-success__id">
              Order ID: <strong>{orderId}</strong>
            </p>
          ) : null}
          <p className="pm-success__hint">Redirecting to home…</p>
        </section>
      </main>
    )
  }

  return (
    <main className="payment-shell">
      <AppHeaderApp />

      <section className="pm-hero">
        <button
          type="button"
          className="back-button btn-icon pm-hero__back"
          onClick={handleBackToCheckout}
          disabled={currentScreen !== 'checkout'}
        >
          <ChevronLeftIcon />
          <span>Edit Order</span>
        </button>
        <div className="pm-hero__content">
          <p className="pm-hero__kicker">
            <ReceiptIcon size={14} />
            <span>Step 2 of 2</span>
          </p>
          <h1>Choose a payment method</h1>
          <p className="pm-hero__subtitle">
            Pick how you'd like to pay <strong>₹{finalAmount}</strong>. All
            methods are secured end-to-end.
          </p>
        </div>
      </section>

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
              <LockIcon size={14} />
              <span>SSL secured</span>
            </span>
            <span className="pm-trust__chip">
              <ShieldCheckIcon size={14} />
              <span>PCI compliant</span>
            </span>
          </div>
        </aside>

        <div className="pm-method-list">
          <h2 className="pm-method-list__title">Payment options</h2>
          <p className="pm-method-list__hint">
            We never store your card or banking details.
          </p>

          {METHODS.map(({ id, title, description, badges, Icon }) => (
            <button
              key={id}
              type="button"
              className="pm-method-card"
              onClick={() => goToMethodPage(id)}
            >
              <span className="pm-method-card__icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <span className="pm-method-card__body">
                <span className="pm-method-card__title">{title}</span>
                <span className="pm-method-card__desc">{description}</span>
                <span className="pm-method-card__badges">
                  {badges.map((b) => (
                    <span key={b} className="pm-method-card__badge">
                      {b}
                    </span>
                  ))}
                </span>
              </span>
              <span className="pm-method-card__arrow" aria-hidden="true">
                <ArrowRightIcon size={18} />
              </span>
            </button>
          ))}

          <p className="pm-footer-note">
            <ShieldCheckIcon size={14} />
            <span>
              Your details are processed over a secure, encrypted channel.
            </span>
          </p>
        </div>
      </section>
    </main>
  )
}

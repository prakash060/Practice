import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import {
  AlertIcon,
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
import { BRAND_PAYMENT_NAME } from '../constants/brand'
import { DELIVERY_FEE_INR } from '../constants/pricing'
import { useFood } from '../hooks/useFood'
import { useAuth } from '../state/AuthContext'
import { ordersAPI, paymentAPI } from '../services/api'

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

function normalizeIndianPhone(raw?: string): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '').slice(-10)
  return /^[6-9]\d{9}$/.test(digits) ? digits : ''
}

function isEmailValid(email?: string): boolean {
  return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function razorpayFailureMessage(failRes?: {
  error?: { code?: string; description?: string; reason?: string }
}): string {
  const code = failRes?.error?.code
  const desc = failRes?.error?.description
  switch (code) {
    case 'BAD_REQUEST_ERROR':
      return 'Invalid payment details. Please try again.'
    case 'GATEWAY_ERROR':
      return 'Bank or UPI app rejected the payment. Please try another method.'
    case 'NETWORK_ERROR':
      return 'Network issue during payment. Please check your connection and retry.'
    case 'SERVER_ERROR':
      return 'Razorpay server error. Please retry in a moment.'
    default:
      return desc || 'Payment failed. Please try again or choose another method.'
  }
}

/**
 * Razorpay's strict `method` filter (e.g. `{ netbanking: true, others: false }`) can resolve
 * to an empty instrument set in test mode or for merchants where only a subset of methods is
 * enabled, which surfaces as "No appropriate payment method found". We instead pre-select the
 * preferred method on Razorpay's default page and let the merchant's enabled methods render
 * naturally — this matches what users expect from "Razorpay's default page" while still landing
 * them on the method they picked.
 */
function buildPreferredMethod(preferred: Method): { method: Method } {
  return { method: preferred }
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, clearCart } = useFood()
  const { user } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<PaymentScreen>('checkout')
  const [orderId, setOrderId] = useState<string>('')
  const [activeMethod, setActiveMethod] = useState<Method | null>(null)
  const [error, setError] = useState<string>('')

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

  const REDIRECT_DELAY_MS = 10000
  const [redirectSecondsLeft, setRedirectSecondsLeft] = useState<number>(
    Math.round(REDIRECT_DELAY_MS / 1000)
  )

  const goToHome = useCallback(() => {
    navigate('/', {
      replace: true,
      state: {
        orderId,
        status: 'Order placed successfully',
      },
    })
  }, [navigate, orderId])

  useEffect(() => {
    if (currentScreen !== 'success') {
      setRedirectSecondsLeft(Math.round(REDIRECT_DELAY_MS / 1000))
      return
    }

    const startedAt = Date.now()
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(
        0,
        Math.ceil((REDIRECT_DELAY_MS - elapsed) / 1000)
      )
      setRedirectSecondsLeft(remaining)
    }, 250)
    const redirect = window.setTimeout(goToHome, REDIRECT_DELAY_MS)

    return () => {
      window.clearInterval(tick)
      window.clearTimeout(redirect)
    }
  }, [currentScreen, goToHome])

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  const startPayment = async (method: Method) => {
    if (activeMethod) return
    setActiveMethod(method)
    setError('')

    try {
      const phone = normalizeIndianPhone(user?.phone)
      if (!phone || !isEmailValid(user?.email)) {
        setError(
          'Please complete your profile with a valid email and a 10-digit Indian mobile number before paying.'
        )
        setActiveMethod(null)
        return
      }

      if (cartItems.length === 0) {
        setError('Your cart is empty.')
        setActiveMethod(null)
        return
      }

      const orderData = {
        amount: finalAmount,
        currency: 'INR',
        items: cartItems.map((item) => ({
          foodId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        customerDetails: {
          name: user?.name,
          email: user?.email,
          phone,
          address: user?.address,
        },
      }

      const response = await ordersAPI.createCheckoutOrder(orderData)

      if (!(window as unknown as { Razorpay?: unknown }).Razorpay) {
        throw new Error(
          'Razorpay script not loaded. Please refresh the page and try again.'
        )
      }

      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.razorpayOrderId,
        name: BRAND_PAYMENT_NAME,
        description: 'Food Order Payment',
        notes: {
          razorpayOrderId: response.razorpayOrderId,
          userEmail: user?.email ?? '',
          preferredMethod: method,
        },
        handler: async (rpRes: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            const verified = await paymentAPI.verifyPayment({
              razorpay_order_id: rpRes.razorpay_order_id,
              razorpay_payment_id: rpRes.razorpay_payment_id,
              razorpay_signature: rpRes.razorpay_signature,
            })
            clearCart()
            setOrderId(verified.orderId)
            setCurrentScreen('success')
          } catch (e) {
            console.error('Payment verification failed:', e)
            setError('Payment verification failed. Please contact support.')
          } finally {
            setActiveMethod(null)
          }
        },
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
          contact: phone,
          ...buildPreferredMethod(method),
        },
        theme: { color: '#6b5ef7' },
        modal: {
          ondismiss: () => setActiveMethod(null),
        },
      }

      const RazorpayCtor = (window as unknown as {
        Razorpay: new (opts: unknown) => {
          open: () => void
          on: (event: string, cb: (res: unknown) => void) => void
        }
      }).Razorpay
      const rzp = new RazorpayCtor(options)
      rzp.on('payment.failed', (failRes: unknown) => {
        setActiveMethod(null)
        setError(
          razorpayFailureMessage(
            failRes as { error?: { code?: string; description?: string } }
          )
        )
      })
      rzp.open()
    } catch (err: unknown) {
      console.error('Payment initiation failed:', err)
      const axiosErr = err as {
        response?: { data?: { error?: string }; status?: number }
        message?: string
      }
      const backendMsg = axiosErr?.response?.data?.error
      const status = axiosErr?.response?.status
      setError(
        backendMsg ||
          (status === 502
            ? 'Payment gateway error. Please try again or use another method.'
            : status === 503
              ? 'Payment gateway is unavailable right now. Please try again in a moment or contact support.'
              : axiosErr?.message ||
                'Failed to start the payment gateway. Please check your connection and try again.')
      )
      setActiveMethod(null)
    }
  }

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
          <p className="pm-success__hint">
            {redirectSecondsLeft > 0
              ? `Redirecting to home in ${redirectSecondsLeft} second${redirectSecondsLeft === 1 ? '' : 's'}…`
              : 'Redirecting to home…'}
          </p>
          <button
            type="button"
            className="proceed-payment-button btn-icon pm-cta__btn"
            onClick={goToHome}
          >
            <ArrowRightIcon />
            <span>Go to home now</span>
          </button>
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
          disabled={!!activeMethod}
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
            Selecting a method opens Razorpay's secure checkout. We never see
            or store your card or banking details.
          </p>

          {error ? (
            <div
              className="orders-banner orders-banner--error pm-detail__error"
              role="alert"
            >
              <AlertIcon />
              <span>{error}</span>
            </div>
          ) : null}

          {METHODS.map(({ id, title, description, badges, Icon }) => {
            const isLoading = activeMethod === id
            return (
              <button
                key={id}
                type="button"
                className="pm-method-card"
                onClick={() => startPayment(id)}
                disabled={!!activeMethod}
                aria-busy={isLoading}
              >
                <span className="pm-method-card__icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <span className="pm-method-card__body">
                  <span className="pm-method-card__title">{title}</span>
                  <span className="pm-method-card__desc">
                    {isLoading ? 'Opening Razorpay…' : description}
                  </span>
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
            )
          })}

          <p className="pm-footer-note">
            <ShieldCheckIcon size={14} />
            <span>
              Your details are processed over a secure, encrypted Razorpay
              channel.
            </span>
          </p>
        </div>
      </section>
    </main>
  )
}

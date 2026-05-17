import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import {
  AlertIcon,
  ArrowRightIcon,
  BankIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  CreditCardIcon,
  LockIcon,
  QrCodeIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  XIcon,
  type IconProps,
} from '../components/Icons'
import { DELIVERY_FEE_INR } from '../constants/pricing'
import { useFood } from '../hooks/useFood'
import { useAuth } from '../state/AuthContext'
import { ordersAPI, paymentAPI } from '../services/api'

type PaymentScreen = 'checkout' | 'qr' | 'success'
type ModalMethod = 'upi' | 'card' | 'netbanking'
type Method = ModalMethod | 'upi_qr'

const QR_POLL_INTERVAL_MS = 3000

interface QrSession {
  qrCodeId: string
  imageUrl: string
  amount: number
  expiresAt: string
}

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
  {
    id: 'upi_qr',
    title: 'Scan & Pay (UPI QR)',
    description: 'Show a QR code — scan with any UPI app and pay.',
    badges: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
    Icon: QrCodeIcon,
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
function buildPreferredMethod(preferred: ModalMethod): { method: ModalMethod } {
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
  const [qrSession, setQrSession] = useState<QrSession | null>(null)
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(0)
  const [qrCancelling, setQrCancelling] = useState<boolean>(false)
  const cancelledQrRef = useRef<string | null>(null)

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
    if (
      cartItems.length === 0 &&
      currentScreen !== 'success' &&
      currentScreen !== 'qr'
    ) {
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

  // QR countdown — drives the "expires in N min" chip.
  useEffect(() => {
    if (currentScreen !== 'qr' || !qrSession) {
      setQrSecondsLeft(0)
      return
    }
    const expiresAtMs = new Date(qrSession.expiresAt).getTime()
    const updateLeft = () => {
      const left = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000))
      setQrSecondsLeft(left)
    }
    updateLeft()
    const tick = window.setInterval(updateLeft, 1000)
    return () => window.clearInterval(tick)
  }, [currentScreen, qrSession])

  // QR polling — checks payment status every QR_POLL_INTERVAL_MS.
  useEffect(() => {
    if (currentScreen !== 'qr' || !qrSession) return
    const qrCodeId = qrSession.qrCodeId
    let cancelled = false

    const poll = async () => {
      if (cancelled) return
      if (cancelledQrRef.current === qrCodeId) return
      try {
        const result = await paymentAPI.getUpiQrStatus(qrCodeId)
        if (cancelled || cancelledQrRef.current === qrCodeId) return
        if (result.status === 'completed' && result.orderId) {
          clearCart()
          setOrderId(result.orderId)
          setQrSession(null)
          setCurrentScreen('success')
        } else if (result.status === 'failed') {
          setError(
            'The QR code expired or was cancelled. Please start a new payment.'
          )
          setQrSession(null)
          setCurrentScreen('checkout')
        }
      } catch (err) {
        // Transient network errors are fine — next tick will retry.
        console.warn('UPI QR poll failed:', err)
      }
    }

    const id = window.setInterval(poll, QR_POLL_INTERVAL_MS)
    void poll()
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [currentScreen, qrSession, clearCart])

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  const reportPaymentError = useCallback((err: unknown, fallback: string) => {
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
            : axiosErr?.message || fallback)
    )
  }, [])

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

      if (method === 'upi_qr') {
        const qr = await paymentAPI.createUpiQr(orderData)
        cancelledQrRef.current = null
        setQrSession({
          qrCodeId: qr.qrCodeId,
          imageUrl: qr.imageUrl,
          amount: qr.amount,
          expiresAt: qr.expiresAt,
        })
        setCurrentScreen('qr')
        setActiveMethod(null)
        return
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
        name: 'PK Food Factory',
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
          ...buildPreferredMethod(method as ModalMethod),
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
      reportPaymentError(
        err,
        'Failed to start the payment gateway. Please check your connection and try again.'
      )
      setActiveMethod(null)
    }
  }

  const cancelQrSession = useCallback(
    async (silent = false) => {
      if (!qrSession) {
        setCurrentScreen('checkout')
        return
      }
      const qrCodeId = qrSession.qrCodeId
      cancelledQrRef.current = qrCodeId
      setQrCancelling(true)
      try {
        await paymentAPI.cancelUpiQr(qrCodeId)
      } catch (err) {
        if (!silent) {
          console.warn('UPI QR cancel failed:', err)
        }
      } finally {
        setQrCancelling(false)
        setQrSession(null)
        setCurrentScreen('checkout')
      }
    },
    [qrSession]
  )

  if (
    cartItems.length === 0 &&
    currentScreen !== 'success' &&
    currentScreen !== 'qr'
  ) {
    return (
      <main className="payment-shell">
        <AppHeaderApp />
        <div className="orders-banner orders-banner--error">
          Your cart is empty. Redirecting to the menu…
        </div>
      </main>
    )
  }

  if (currentScreen === 'qr' && qrSession) {
    const minutes = Math.floor(qrSecondsLeft / 60)
    const seconds = qrSecondsLeft % 60
    const expiresLabel = `${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`
    const amountInr = (qrSession.amount / 100).toFixed(2).replace(/\.00$/, '')

    return (
      <main className="payment-shell">
        <AppHeaderApp />
        <section className="pm-qr">
          <header className="pm-qr__header">
            <p className="pm-hero__kicker">
              <QrCodeIcon size={14} />
              <span>Scan & Pay</span>
            </p>
            <h2>Open any UPI app and scan</h2>
            <p className="pm-qr__subtitle">
              GPay, PhonePe, Paytm, BHIM — anything that supports UPI works.
              We'll confirm payment automatically.
            </p>
          </header>

          <div className="pm-qr__card">
            <img
              src={qrSession.imageUrl}
              alt="Razorpay UPI QR code"
              className="pm-qr__image"
              width={280}
              height={280}
            />
            <div className="pm-qr__amount">
              <span className="pm-qr__amount-label">Amount</span>
              <strong>₹{amountInr}</strong>
            </div>
            <div className="pm-qr__chip">
              <ClockIcon size={14} />
              <span>
                {qrSecondsLeft > 0
                  ? `Expires in ${expiresLabel}`
                  : 'QR code expired'}
              </span>
            </div>
            <p className="pm-qr__waiting" role="status">
              Waiting for payment confirmation…
            </p>
          </div>

          <button
            type="button"
            className="back-button btn-icon pm-qr__cancel"
            onClick={() => cancelQrSession()}
            disabled={qrCancelling}
          >
            <XIcon size={16} />
            <span>{qrCancelling ? 'Cancelling…' : 'Cancel & choose another method'}</span>
          </button>
        </section>
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

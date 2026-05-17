import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import {
  AlertIcon,
  BankIcon,
  CheckIcon,
  ChevronLeftIcon,
  CreditCardIcon,
  LockIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  ZapIcon,
  type IconProps,
} from '../components/Icons'
import { DELIVERY_FEE_INR } from '../constants/pricing'
import { useFood } from '../hooks/useFood'
import { useAuth } from '../state/AuthContext'
import { ordersAPI, paymentAPI } from '../services/api'

type Method = 'upi' | 'card' | 'netbanking'

interface MethodTheme {
  title: string
  subtitle: string
  Icon: (props: IconProps) => ReactElement
  accent: string
  /** Razorpay's UI display label (kept identical to previous behaviour) */
  rzpLabel: string
}

const METHOD_THEME: Record<Method, MethodTheme> = {
  upi: {
    title: 'UPI',
    subtitle: 'Pay instantly using any UPI app on your phone.',
    Icon: SmartphoneIcon,
    accent: '#6b5ef7',
    rzpLabel: 'Pay via UPI',
  },
  card: {
    title: 'Credit / Debit card',
    subtitle: 'Visa, Mastercard, RuPay and Amex accepted.',
    Icon: CreditCardIcon,
    accent: '#1e457a',
    rzpLabel: 'Pay via Card',
  },
  netbanking: {
    title: 'Net Banking',
    subtitle: 'Securely log in to your bank to confirm the payment.',
    Icon: BankIcon,
    accent: '#1f6f3b',
    rzpLabel: 'Pay via Netbanking',
  },
}

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', hint: 'phone@oksbi' },
  { id: 'phonepe', label: 'PhonePe', hint: 'phone@ybl' },
  { id: 'paytm', label: 'Paytm', hint: 'phone@paytm' },
  { id: 'bhim', label: 'BHIM', hint: 'phone@upi' },
]

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI' },
  { id: 'sbi', name: 'State Bank of India', short: 'SBI' },
  { id: 'axis', name: 'Axis Bank', short: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra', short: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National Bank', short: 'PNB' },
  { id: 'bob', name: 'Bank of Baroda', short: 'BoB' },
  { id: 'yes', name: 'Yes Bank', short: 'YES' },
]

const CARD_BRANDS = ['Visa', 'Mastercard', 'RuPay', 'Amex']

function isMethod(value: string | undefined): value is Method {
  return value === 'upi' || value === 'card' || value === 'netbanking'
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

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

export default function PaymentMethodPage() {
  const navigate = useNavigate()
  const params = useParams()
  const { cartItems, clearCart } = useFood()
  const { user } = useAuth()

  const methodParam = params.method
  const method = isMethod(methodParam) ? methodParam : null

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // UPI form state (decorative — real payment goes through Razorpay Checkout)
  const [upiId, setUpiId] = useState('')

  // Card form state
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  // Net banking form state
  const [selectedBank, setSelectedBank] = useState<string>('')

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
    if (!method) {
      navigate('/payment', { replace: true })
      return
    }
    if (cartItems.length === 0) {
      const t = setTimeout(() => navigate('/'), 800)
      return () => clearTimeout(t)
    }
  }, [cartItems.length, method, navigate])

  /** Prefer the user's chosen method first; keep Razorpay defaults as fallback. */
  const buildCheckoutDisplay = (preferred: Method) => {
    const sequence: Method[] =
      preferred === 'upi'
        ? ['upi', 'card', 'netbanking']
        : preferred === 'card'
          ? ['card', 'upi', 'netbanking']
          : ['netbanking', 'upi', 'card']
    return {
      display: {
        sequence,
        preferences: {
          show_default_blocks: true,
        },
      },
    }
  }

  const handlePay = async () => {
    if (!method) return
    try {
      setIsProcessing(true)
      setError('')

      const phone = normalizeIndianPhone(user?.phone)
      if (!phone || !isEmailValid(user?.email)) {
        setError(
          'Please complete your profile with a valid email and a 10-digit Indian mobile number before paying.'
        )
        setIsProcessing(false)
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

      if (!(window as any).Razorpay) {
        throw new Error('Razorpay script not loaded')
      }

      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.razorpayOrderId,
        name: 'PK Food Factory',
        description: 'Food Order Payment',
        config: buildCheckoutDisplay(method),
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
            navigate('/payment', {
              replace: true,
              state: { paidOrderId: verified.orderId },
            })
          } catch (e) {
            console.error('Payment verification failed:', e)
            setError('Payment verification failed. Please contact support.')
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
          contact: phone,
        },
        theme: { color: '#6b5ef7' },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on(
        'payment.failed',
        (failRes: { error?: { code?: string; description?: string } }) => {
          setIsProcessing(false)
          setError(razorpayFailureMessage(failRes))
        }
      )
      rzp.open()
    } catch (err: unknown) {
      console.error('Payment initiation failed:', err)
      const axiosErr = err as { response?: { data?: { error?: string }; status?: number } }
      const backendMsg = axiosErr?.response?.data?.error
      const status = axiosErr?.response?.status
      setError(
        backendMsg ||
          (status === 502
            ? 'Payment gateway error. Check Razorpay keys on the server or try again.'
            : 'Failed to start the payment gateway. Please check your connection and try again.')
      )
    } finally {
      setIsProcessing(false)
    }
  }

  if (!method) return null
  const theme = METHOD_THEME[method]
  const { Icon } = theme

  // ----- per-method body -----
  let methodBody: ReactElement | null = null

  if (method === 'upi') {
    methodBody = (
      <div className="pm-form">
        <div className="pm-upi-grid">
          <div className="pm-upi-input">
            <label htmlFor="upi-id">Your UPI ID</label>
            <div className="pm-input-wrap">
              <SmartphoneIcon size={16} />
              <input
                id="upi-id"
                type="text"
                placeholder="yourname@bank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                autoComplete="off"
                disabled={isProcessing}
              />
            </div>
            <p className="pm-form__hint">
              You'll get a payment request on the linked UPI app.
            </p>
          </div>
          <div className="pm-upi-qr" aria-hidden="true">
            <div className="pm-upi-qr__inner">
              <QrCodeIcon size={56} />
              <span>Scan with any UPI app</span>
            </div>
          </div>
        </div>

        <div className="pm-divider">
          <span>or pick an app</span>
        </div>

        <div className="pm-upi-apps">
          {UPI_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              className="pm-upi-app"
              onClick={() => setUpiId((cur) => cur || `your${app.hint.slice(5)}`)}
              disabled={isProcessing}
            >
              <span className="pm-upi-app__badge">
                {app.label.slice(0, 1)}
              </span>
              <span>
                <strong>{app.label}</strong>
                <span className="pm-upi-app__hint">{app.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  } else if (method === 'card') {
    const previewNumber = cardNumber || '•••• •••• •••• ••••'
    const previewName = cardHolder.trim() || 'YOUR NAME'
    const previewExpiry = cardExpiry || 'MM/YY'
    methodBody = (
      <div className="pm-form">
        <div className="pm-card-preview" aria-hidden="true">
          <div className="pm-card-preview__row">
            <span className="pm-card-preview__brand">PK FOOD FACTORY</span>
            <CreditCardIcon size={22} />
          </div>
          <div className="pm-card-preview__chip" />
          <div className="pm-card-preview__number">{previewNumber}</div>
          <div className="pm-card-preview__bottom">
            <div>
              <span className="pm-card-preview__label">Card holder</span>
              <span className="pm-card-preview__value">{previewName}</span>
            </div>
            <div>
              <span className="pm-card-preview__label">Expires</span>
              <span className="pm-card-preview__value">{previewExpiry}</span>
            </div>
          </div>
        </div>

        <div className="pm-card-grid">
          <div className="pm-card-field pm-card-field--full">
            <label htmlFor="card-number">Card number</label>
            <div className="pm-input-wrap">
              <CreditCardIcon size={16} />
              <input
                id="card-number"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="pm-card-field pm-card-field--full">
            <label htmlFor="card-holder">Name on card</label>
            <div className="pm-input-wrap">
              <input
                id="card-holder"
                type="text"
                autoComplete="cc-name"
                placeholder="As printed on the card"
                value={cardHolder}
                onChange={(e) =>
                  setCardHolder(e.target.value.toUpperCase().slice(0, 32))
                }
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="pm-card-field">
            <label htmlFor="card-expiry">Expiry</label>
            <div className="pm-input-wrap">
              <input
                id="card-expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                disabled={isProcessing}
              />
            </div>
          </div>
          <div className="pm-card-field">
            <label htmlFor="card-cvv">CVV</label>
            <div className="pm-input-wrap">
              <LockIcon size={16} />
              <input
                id="card-cvv"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="•••"
                value={cardCvv}
                onChange={(e) =>
                  setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                disabled={isProcessing}
                maxLength={4}
              />
            </div>
          </div>
        </div>

        <div className="pm-card-brands">
          {CARD_BRANDS.map((b) => (
            <span key={b} className="pm-card-brand">
              {b}
            </span>
          ))}
        </div>
      </div>
    )
  } else if (method === 'netbanking') {
    methodBody = (
      <div className="pm-form">
        <p className="pm-form__hint pm-form__hint--lead">
          Choose your bank — we'll take you to its secure login page to confirm
          the payment.
        </p>
        <div className="pm-bank-grid">
          {BANKS.map((b) => {
            const isSelected = selectedBank === b.id
            return (
              <button
                key={b.id}
                type="button"
                className={`pm-bank-tile ${isSelected ? 'pm-bank-tile--selected' : ''}`}
                onClick={() => setSelectedBank(b.id)}
                disabled={isProcessing}
                aria-pressed={isSelected}
              >
                <span className="pm-bank-tile__logo">{b.short}</span>
                <span className="pm-bank-tile__name">{b.name}</span>
                {isSelected ? (
                  <span className="pm-bank-tile__check">
                    <CheckIcon size={14} />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <main className="payment-shell">
      <AppHeaderApp />

      <section
        className={`pm-hero pm-hero--${method}`}
        style={{ ['--method-accent' as never]: theme.accent }}
      >
        <button
          type="button"
          className="back-button btn-icon pm-hero__back"
          onClick={() => navigate('/payment')}
          disabled={isProcessing}
        >
          <ChevronLeftIcon />
          <span>Change Payment Method</span>
        </button>
        <div className="pm-hero__content pm-hero__content--with-icon">
          <span className="pm-hero__method-icon" aria-hidden="true">
            <Icon size={28} />
          </span>
          <div>
            <p className="pm-hero__kicker">
              <ZapIcon size={14} />
              <span>Secure checkout</span>
            </p>
            <h1>{theme.title}</h1>
            <p className="pm-hero__subtitle">{theme.subtitle}</p>
          </div>
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

        <div className="pm-detail">
          <div className="pm-detail__card">
            {error ? (
              <div
                className="orders-banner orders-banner--error pm-detail__error"
                role="alert"
              >
                <AlertIcon />
                <span>{error}</span>
              </div>
            ) : null}

            {methodBody}

            <div className="pm-cta">
              <button
                type="button"
                className="proceed-payment-button btn-icon pm-cta__btn"
                onClick={handlePay}
                disabled={isProcessing}
              >
                <LockIcon />
                <span>
                  {isProcessing
                    ? 'Processing payment…'
                    : `Pay ₹${finalAmount} securely`}
                </span>
              </button>
              <p className="pm-cta__note">
                <ShieldCheckIcon size={14} />
                <span>
                  By continuing you agree to our terms. Your card and bank
                  details are never stored on our servers.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

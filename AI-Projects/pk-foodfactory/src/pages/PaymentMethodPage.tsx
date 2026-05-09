import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import { DELIVERY_FEE_INR } from '../constants/pricing'
import { useFood } from '../hooks/useFood'
import { useAuth } from '../state/AuthContext'
import { ordersAPI, paymentAPI } from '../services/api'

type Method = 'upi' | 'card' | 'netbanking' | 'wallet'

type CustomerDetails = {
  name?: string
  email?: string
  phone?: string
}

const METHOD_UI: Record<Method, { title: string; icon: string; subtitle: string }> = {
  upi: { title: 'UPI', icon: '📱', subtitle: 'Google Pay, PhonePe, Paytm, etc.' },
  card: { title: 'Card', icon: '💳', subtitle: 'Credit / Debit card via Razorpay' },
  netbanking: { title: 'Net Banking', icon: '🏦', subtitle: 'Pay via your bank using Razorpay' },
  wallet: { title: 'Wallet', icon: '👛', subtitle: 'Paytm, Amazon Pay and others (as enabled)' },
}

function isMethod(value: string | undefined): value is Method {
  return value === 'upi' || value === 'card' || value === 'netbanking' || value === 'wallet'
}

export default function PaymentMethodPage() {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()
  const { cartItems, clearCart } = useFood()
  const { user } = useAuth()

  const methodParam = params.method
  const method = isMethod(methodParam) ? methodParam : null

  const [orderId, setOrderId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const state = (location.state ?? {}) as { customer?: CustomerDetails }
  const [customerName, setCustomerName] = useState(state.customer?.name ?? '')
  const [customerEmail, setCustomerEmail] = useState(state.customer?.email ?? '')
  const [customerPhone, setCustomerPhone] = useState(state.customer?.phone ?? '')

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )
  const finalAmount = useMemo(
    () => total + DELIVERY_FEE_INR + Math.round(total * 0.05),
    [total]
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

  const getCheckoutConfig = (preferred: Method) => {
    const titles: Record<Method, string> = {
      upi: 'Pay via UPI',
      card: 'Pay via Card',
      netbanking: 'Pay via Netbanking',
      wallet: 'Pay via Wallet',
    }

    return {
      display: {
        blocks: {
          preferred: {
            name: titles[preferred],
            instruments: [{ method: preferred }],
          },
        },
        sequence: ['block.preferred'],
        preferences: {
          show_default_blocks: false,
        },
      },
    }
  }

  const handlePay = async () => {
    if (!method) return
    try {
      setIsProcessing(true)
      setError('')

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
          name: customerName.trim() || undefined,
          email: customerEmail.trim() || undefined,
          phone: customerPhone.trim() || undefined,
          address: user?.address,
        },
      }

      const response = await ordersAPI.createCheckoutOrder(orderData)
      setOrderId(response.orderId)

      if (response.checkoutDummy) {
        await paymentAPI.verifyPayment({
          razorpay_order_id: response.razorpayOrderId,
          razorpay_payment_id: 'dummy_payment_id',
          razorpay_signature: 'dummy',
        })
        clearCart()
        navigate('/', {
          replace: true,
          state: {
            orderId: response.orderId,
            status: 'Order placed successfully (dummy payment)',
          },
        })
        return
      }

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
        config: getCheckoutConfig(method),
        handler: async (rpRes: any) => {
          try {
            await paymentAPI.verifyPayment({
              razorpay_order_id: rpRes.razorpay_order_id,
              razorpay_payment_id: rpRes.razorpay_payment_id,
              razorpay_signature: rpRes.razorpay_signature,
            })
            clearCart()
            navigate('/payment', { replace: true, state: { paidOrderId: response.orderId } })
          } catch (e) {
            console.error('Payment verification failed:', e)
            setError('Payment verification failed. Please contact support.')
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          contact: customerPhone.trim(),
        },
        theme: { color: '#6b5ef7' },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      console.error('Payment initiation failed:', err)
      const backendMsg = err?.response?.data?.error
      setError(backendMsg || 'Failed to start Razorpay Checkout. Please check backend credentials and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!method) return null
  const ui = METHOD_UI[method]

  return (
    <main className="payment-page">
      <AppHeaderApp />
      <header className="payment-header">
        <button type="button" className="back-button" onClick={() => navigate('/payment')} disabled={isProcessing}>
          ← Back
        </button>
        <h1>{ui.title}</h1>
      </header>

      <section className="payment-content">
        <div className="payment-container">
          <div className="payment-summary">
            <h2>
              {ui.icon} {ui.title}
            </h2>
            <p className="payment-disclaimer">{ui.subtitle}</p>

            <div className="summary-item">
              <span>Total Amount</span>
              <strong>₹{finalAmount}</strong>
            </div>
          </div>

          <div className="payment-methods">
            <h2>Customer details (optional)</h2>
            {error && <p className="error-message">{error}</p>}

            <div className="form-group">
              <label htmlFor="customerName">Name</label>
              <input
                id="customerName"
                type="text"
                placeholder="Your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail">Email</label>
              <input
                id="customerEmail"
                type="email"
                placeholder="you@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone">Phone</label>
              <input
                id="customerPhone"
                type="tel"
                placeholder="9999999999"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </div>

          <button type="button" className="proceed-payment-button" onClick={handlePay} disabled={isProcessing}>
            {isProcessing ? 'Opening Razorpay...' : `Pay with Razorpay (${ui.title})`}
          </button>

          {orderId ? <p className="payment-disclaimer">Created order: #{orderId}</p> : null}
        </div>
      </section>
    </main>
  )
}


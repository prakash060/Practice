import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useFood } from '../hooks/useFood'
import { paymentAPI } from '../services/api'

type PaymentScreen = 'checkout' | 'success'
type PreferredMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'all'
type CustomerDetails = {
  name?: string
  email?: string
  phone?: string
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, clearCart } = useFood()
  const [currentScreen, setCurrentScreen] = useState<PaymentScreen>('checkout')
  const [orderId, setOrderId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )
  const finalAmount = useMemo(() => total + 50 + Math.round(total * 0.05), [total])

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
      // clear state so refresh/back doesn't keep replaying success
      navigate('/payment', { replace: true })
    }
  }, [location.state, navigate])

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  const goToMethodPage = (method: Exclude<PreferredMethod, 'all'>) => {
    const customer: CustomerDetails = {
      name: customerName.trim() || undefined,
      email: customerEmail.trim() || undefined,
      phone: customerPhone.trim() || undefined,
    }
    navigate(`/payment/${method}`, { state: { customer } })
  }

  const getCheckoutConfig = (preferred: PreferredMethod) => {
    if (preferred === 'all') return undefined

    const titles: Record<Exclude<PreferredMethod, 'all'>, string> = {
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

  const initiatePayment = async (preferred: PreferredMethod = 'all') => {
    try {
      setIsProcessing(true)
      setError('')

      // Prepare order data
      const orderData = {
        amount: finalAmount,
        currency: 'INR',
        items: cartItems.map(item => ({
          foodId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customerDetails: {
          name: customerName.trim() || undefined,
          email: customerEmail.trim() || undefined,
          phone: customerPhone.trim() || undefined,
        }
      }

      // Create order on backend
      const response = await paymentAPI.createOrder(orderData)
      setOrderId(response.orderId)

      if (!(window as any).Razorpay) {
        throw new Error('Razorpay script not loaded')
      }

      // Initialize Razorpay
      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.razorpayOrderId,
        name: 'PK Food Factory',
        description: 'Food Order Payment',
        config: getCheckoutConfig(preferred),
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            handlePaymentSuccess()
          } catch (error) {
            console.error('Payment verification failed:', error)
            setError('Payment verification failed. Please contact support.')
            setCurrentScreen('checkout')
          }
        },
        prefill: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          contact: customerPhone.trim(),
        },
        theme: {
          color: '#6b5ef7'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      const backendMsg = error?.response?.data?.error
      setError(backendMsg || 'Failed to start Razorpay Checkout. Please check backend credentials and try again.')
      setCurrentScreen('checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = () => {
    setCurrentScreen('success')
    clearCart()
    // Redirect to home after 3 seconds
    setTimeout(() => {
      navigate('/')
    }, 3000)
  }

  if (cartItems.length === 0 && currentScreen !== 'success') {
    return (
      <main className="payment-page">
        <div className="payment-container">
          <p className="empty-state">Your cart is empty. Redirecting to menu...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="payment-page">
      <header className="payment-header">
        <button 
          type="button" 
          className="back-button" 
          onClick={handleBackToCheckout}
          disabled={currentScreen === 'success'}
        >
          ← Back
        </button>
        <h1>Payment</h1>
      </header>

      <section className="payment-content">
        {currentScreen === 'success' ? (
          <div className="payment-container">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Payment Successful!</h2>
              <p>Your order has been placed successfully.</p>
              <p className="order-id">Order ID: #{orderId}</p>
              <p className="redirect-message">Redirecting to home...</p>
            </div>
          </div>
        ) : currentScreen === 'checkout' ? (
          <div className="payment-container">
            <div className="payment-summary">
              <h2>Checkout</h2>
              <div className="summary-item">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="summary-item">
                <span>Delivery Fee</span>
                <span>₹50</span>
              </div>
              <div className="summary-item">
                <span>Tax (5%)</span>
                <span>₹{Math.round(total * 0.05)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
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

              <h2 style={{ marginTop: 8 }}>Choose a payment option</h2>
              <p className="payment-disclaimer" style={{ marginTop: 0 }}>
                All options open the Razorpay Checkout gateway. This just takes you directly to the method you prefer.
              </p>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('upi')} disabled={isProcessing}>
                  <div className="method-icon">📱</div>
                  <div className="method-info">
                    <strong>UPI</strong>
                    <p>Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                  <div className="method-arrow">{isProcessing ? '...' : '→'}</div>
                </button>
              </div>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('card')} disabled={isProcessing}>
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <strong>Credit / Debit Card</strong>
                    <p>Visa, MasterCard, RuPay</p>
                  </div>
                  <div className="method-arrow">{isProcessing ? '...' : '→'}</div>
                </button>
              </div>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('netbanking')} disabled={isProcessing}>
                  <div className="method-icon">🏦</div>
                  <div className="method-info">
                    <strong>Net Banking</strong>
                    <p>HDFC, ICICI, SBI, Axis, etc.</p>
                  </div>
                  <div className="method-arrow">{isProcessing ? '...' : '→'}</div>
                </button>
              </div>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('wallet')} disabled={isProcessing}>
                  <div className="method-icon">👛</div>
                  <div className="method-info">
                    <strong>Digital Wallet</strong>
                    <p>Paytm Wallet, Amazon Pay</p>
                  </div>
                  <div className="method-arrow">{isProcessing ? '...' : '→'}</div>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="proceed-payment-button"
              onClick={() => initiatePayment('all')}
              disabled={isProcessing}
            >
              {isProcessing ? 'Opening Razorpay...' : 'Pay with Razorpay (all methods)'}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}

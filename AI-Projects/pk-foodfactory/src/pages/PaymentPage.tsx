import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import { ChevronLeftIcon } from '../components/Icons'
import { DELIVERY_FEE_INR } from '../constants/pricing'
import { useFood } from '../hooks/useFood'

type PaymentScreen = 'checkout' | 'success'
type Method = 'upi' | 'card' | 'netbanking' | 'wallet'

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cartItems, clearCart } = useFood()
  const [currentScreen, setCurrentScreen] = useState<PaymentScreen>('checkout')
  const [orderId, setOrderId] = useState<string>('')

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )
  const finalAmount = useMemo(
    () => total + DELIVERY_FEE_INR + Math.round(total * 0.05),
    [total]
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
      // clear state so refresh/back doesn't keep replaying success
      navigate('/payment', { replace: true })
    }
  }, [location.state, navigate])

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  const goToMethodPage = (method: Method) => {
    navigate(`/payment/${method}`)
  }

  // When user comes back to this page after paying on a method page,
  // we show a brief success state then redirect home.
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
      <main className="payment-page">
        <AppHeaderApp />
        <div className="payment-container">
          <p className="empty-state">Your cart is empty. Redirecting to menu...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="payment-page">
      <AppHeaderApp />
      <header className="payment-header">
        <button
          type="button"
          className="back-button btn-icon"
          onClick={handleBackToCheckout}
          disabled={currentScreen === 'success'}
        >
          <ChevronLeftIcon />
          <span>Back</span>
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
                <span>₹{DELIVERY_FEE_INR}</span>
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
              <h2 style={{ marginTop: 8 }}>Choose a payment option</h2>
              <p className="payment-disclaimer" style={{ marginTop: 0 }}>
                All options open the Razorpay Checkout gateway. This just takes you directly to the method you prefer.
              </p>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('upi')}>
                  <div className="method-icon">📱</div>
                  <div className="method-info">
                    <strong>UPI</strong>
                    <p>Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('card')}>
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <strong>Credit / Debit Card</strong>
                    <p>Visa, MasterCard, RuPay</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('netbanking')}>
                  <div className="method-icon">🏦</div>
                  <div className="method-info">
                    <strong>Net Banking</strong>
                    <p>HDFC, ICICI, SBI, Axis, etc.</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>

              <div className="method-option">
                <button type="button" className="method-button" onClick={() => goToMethodPage('wallet')}>
                  <div className="method-icon">👛</div>
                  <div className="method-info">
                    <strong>Digital Wallet</strong>
                    <p>Paytm Wallet, Amazon Pay</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>

              <p className="form-hint" style={{ marginTop: 10 }}>
                Select any one payment method above to proceed.
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

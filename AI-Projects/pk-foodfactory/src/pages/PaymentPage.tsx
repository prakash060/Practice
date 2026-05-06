import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFood } from '../hooks/useFood'

type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useFood()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle')

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const finalAmount = total + 50 + Math.round(total * 0.05)

  const handlePayment = () => {
    if (cartItems.length === 0) return

    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentStatus('success')
      // Clear cart after successful payment
      clearCart()
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }, 2000)
  }

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  if (cartItems.length === 0 && paymentStatus !== 'success') {
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
          disabled={isProcessing}
        >
          ← Back to Checkout
        </button>
        <h1>Payment</h1>
      </header>

      <section className="payment-content">
        <div className="payment-container">
          {paymentStatus === 'success' ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Payment Successful!</h2>
              <p>Your order has been placed successfully.</p>
              <p className="order-id">Order ID: #PK{Math.floor(Math.random() * 100000)}</p>
              <p className="redirect-message">Redirecting to home...</p>
            </div>
          ) : (
            <>
              <div className="payment-summary">
                <h2>Order Summary</h2>
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
                <h2>Select Payment Method</h2>

                <div className="method-option">
                  <input
                    type="radio"
                    id="upi"
                    name="payment"
                    value="upi"
                    checked={selectedMethod === 'upi'}
                    onChange={() => setSelectedMethod('upi')}
                    disabled={isProcessing}
                  />
                  <label htmlFor="upi">
                    <div className="method-icon">📱</div>
                    <div className="method-info">
                      <strong>UPI</strong>
                      <p>Google Pay, PhonePe, Paytm, etc.</p>
                    </div>
                  </label>
                </div>

                <div className="method-option">
                  <input
                    type="radio"
                    id="card"
                    name="payment"
                    value="card"
                    checked={selectedMethod === 'card'}
                    onChange={() => setSelectedMethod('card')}
                    disabled={isProcessing}
                  />
                  <label htmlFor="card">
                    <div className="method-icon">💳</div>
                    <div className="method-info">
                      <strong>Credit / Debit Card</strong>
                      <p>Visa, MasterCard, RuPay</p>
                    </div>
                  </label>
                </div>

                <div className="method-option">
                  <input
                    type="radio"
                    id="netbanking"
                    name="payment"
                    value="netbanking"
                    checked={selectedMethod === 'netbanking'}
                    onChange={() => setSelectedMethod('netbanking')}
                    disabled={isProcessing}
                  />
                  <label htmlFor="netbanking">
                    <div className="method-icon">🏦</div>
                    <div className="method-info">
                      <strong>Net Banking</strong>
                      <p>HDFC, ICICI, SBI, Axis, etc.</p>
                    </div>
                  </label>
                </div>

                <div className="method-option">
                  <input
                    type="radio"
                    id="wallet"
                    name="payment"
                    value="wallet"
                    checked={selectedMethod === 'wallet'}
                    onChange={() => setSelectedMethod('wallet')}
                    disabled={isProcessing}
                  />
                  <label htmlFor="wallet">
                    <div className="method-icon">👛</div>
                    <div className="method-info">
                      <strong>Digital Wallet</strong>
                      <p>Paytm Wallet, Amazon Pay</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="payment-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleBackToCheckout}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pay-button"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${finalAmount}`}
                </button>
              </div>

              <p className="payment-disclaimer">
                Note: This is a demo app. No real payment will be processed.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

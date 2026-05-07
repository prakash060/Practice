import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFood } from '../hooks/useFood'
import { UPIPayment } from '../components/PaymentMethods/UPIPayment'
import { CardPayment } from '../components/PaymentMethods/CardPayment'
import { NetBankingPayment } from '../components/PaymentMethods/NetBankingPayment'
import { WalletPayment } from '../components/PaymentMethods/WalletPayment'

type PaymentScreen = 'selection' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'success'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useFood()
  const [currentScreen, setCurrentScreen] = useState<PaymentScreen>('selection')

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const finalAmount = total + 50 + Math.round(total * 0.05)

  const handleBackToCheckout = () => {
    if (currentScreen !== 'selection') {
      setCurrentScreen('selection')
    } else {
      navigate('/checkout')
    }
  }

  const handlePaymentSuccess = () => {
    setCurrentScreen('success')
    clearCart()
    // Redirect to home after 2 seconds
    setTimeout(() => {
      navigate('/')
    }, 2000)
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
              <p className="order-id">Order ID: #PK{Math.floor(Math.random() * 100000)}</p>
              <p className="redirect-message">Redirecting to home...</p>
            </div>
          </div>
        ) : currentScreen === 'selection' ? (
          <div className="payment-container">
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
                <button
                  type="button"
                  className="method-button"
                  onClick={() => setCurrentScreen('upi')}
                >
                  <div className="method-icon">📱</div>
                  <div className="method-info">
                    <strong>UPI</strong>
                    <p>Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>

              <div className="method-option">
                <button
                  type="button"
                  className="method-button"
                  onClick={() => setCurrentScreen('card')}
                >
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <strong>Credit / Debit Card</strong>
                    <p>Visa, MasterCard, RuPay</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>

              <div className="method-option">
                <button
                  type="button"
                  className="method-button"
                  onClick={() => setCurrentScreen('netbanking')}
                >
                  <div className="method-icon">🏦</div>
                  <div className="method-info">
                    <strong>Net Banking</strong>
                    <p>HDFC, ICICI, SBI, Axis, etc.</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>

              <div className="method-option">
                <button
                  type="button"
                  className="method-button"
                  onClick={() => setCurrentScreen('wallet')}
                >
                  <div className="method-icon">👛</div>
                  <div className="method-info">
                    <strong>Digital Wallet</strong>
                    <p>Paytm Wallet, Amazon Pay</p>
                  </div>
                  <div className="method-arrow">→</div>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="cancel-button"
              onClick={handleBackToCheckout}
            >
              Cancel
            </button>
          </div>
        ) : currentScreen === 'upi' ? (
          <UPIPayment amount={finalAmount} onSuccess={handlePaymentSuccess} onBack={() => setCurrentScreen('selection')} />
        ) : currentScreen === 'card' ? (
          <CardPayment amount={finalAmount} onSuccess={handlePaymentSuccess} onBack={() => setCurrentScreen('selection')} />
        ) : currentScreen === 'netbanking' ? (
          <NetBankingPayment amount={finalAmount} onSuccess={handlePaymentSuccess} onBack={() => setCurrentScreen('selection')} />
        ) : currentScreen === 'wallet' ? (
          <WalletPayment amount={finalAmount} onSuccess={handlePaymentSuccess} onBack={() => setCurrentScreen('selection')} />
        ) : null}
      </section>
    </main>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFood } from '../hooks/useFood'
import { paymentAPI } from '../services/api'

type PaymentScreen = 'selection' | 'success' | 'processing'

export default function PaymentPage() {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useFood()
  const [currentScreen, setCurrentScreen] = useState<PaymentScreen>('selection')
  const [orderId, setOrderId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>('')

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const finalAmount = total + 50 + Math.round(total * 0.05)

  const handleBackToCheckout = () => {
    if (currentScreen !== 'selection') {
      setCurrentScreen('selection')
    } else {
      navigate('/checkout')
    }
  }

  const initiatePayment = async () => {
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
          // Add customer details here if available
        }
      }

      // Create order on backend
      const response = await paymentAPI.createOrder(orderData)
      setOrderId(response.orderId)

      // Initialize Razorpay
      const options = {
        key: response.key,
        amount: response.amount,
        currency: response.currency,
        order_id: response.razorpayOrderId,
        name: 'PK Food Factory',
        description: 'Food Order Payment',
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
            setCurrentScreen('selection')
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#6b5ef7'
        },
        modal: {
          ondismiss: () => {
            setCurrentScreen('selection')
            setIsProcessing(false)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()

    } catch (error) {
      console.error('Payment initiation failed:', error)
      setError('Failed to initiate payment. Please try again.')
      setCurrentScreen('selection')
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

              {error && <p className="error-message">{error}</p>}

              <div className="method-option">
                <button
                  type="button"
                  className="method-button"
                  onClick={initiatePayment}
                  disabled={isProcessing}
                >
                  <div className="method-icon">📱</div>
                  <div className="method-info">
                    <strong>UPI</strong>
                    <p>Google Pay, PhonePe, Paytm, etc.</p>
                  </div>
                  <div className="method-arrow">{isProcessing ? '...' : '→'}</div>
                </button>
              </div>

              <div className="method-option">
                <button
                  type="button"
                  className="method-button"
                  onClick={initiatePayment}
                  disabled={isProcessing}
                >
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <strong>Credit / Debit Card</strong>
                    <p>Visa, MasterCard, RuPay</p>
                  </div>
                  <div className="method-arrow">{isProcessing ? '...' : '→'}</div>
                </button>
              </div>

              <div className="method-option">
                <button
                  type="button"
                  className="method-button"
                  onClick={initiatePayment}
                  disabled={isProcessing}
                >
                  <div className="method-icon">🏦</div>
                  <div className="method-info">
                    <strong>Net Banking</strong>
                    <p>HDFC, ICICI, SBI, Axis, etc.</p>
                  </div>
                  <div className="method-arrow">{isProcessing ? '...' : '→'}</div>
                </button>
              </div>

              <div className="method-option">
                <button
                  type="button"
                  className="method-button"
                  onClick={initiatePayment}
                  disabled={isProcessing}
                >
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
              className="cancel-button"
              onClick={handleBackToCheckout}
            >
              Cancel
            </button>
          </div>
        ) : null}
      </section>
    </main>
  )
}

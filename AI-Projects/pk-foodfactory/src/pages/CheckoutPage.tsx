import { useNavigate } from 'react-router-dom'
import { useFood } from '../hooks/useFood'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cartItems } = useFood()

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleProceedToPayment = () => {
    if (cartItems.length > 0) {
      navigate('/payment')
    }
  }

  const handleBackToMenu = () => {
    navigate('/')
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <button type="button" className="back-button" onClick={handleBackToMenu}>
          ← Back to Menu
        </button>
        <h1>Order Review</h1>
      </header>

      <section className="checkout-content">
        <div className="checkout-summary">
          <h2>Order Details</h2>
          {cartItems.length === 0 ? (
            <p className="empty-state">Your cart is empty.</p>
          ) : (
            <>
              <div className="checkout-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <div>
                      <strong>{item.name}</strong>
                      <p className="item-description">{item.quantity} quantity</p>
                    </div>
                    <span className="item-total">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-divider"></div>

              <div className="checkout-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="total-row">
                  <span>Delivery Fee</span>
                  <span>₹50</span>
                </div>
                <div className="total-row">
                  <span>Tax (5%)</span>
                  <span>₹{Math.round(total * 0.05)}</span>
                </div>
                <div className="total-row total-amount">
                  <span>Total Amount</span>
                  <strong>₹{total + 50 + Math.round(total * 0.05)}</strong>
                </div>
              </div>

              <div className="delivery-info">
                <h3>Delivery Address</h3>
                <p>123 Main Street, City, State - 123456</p>
                <p className="note">Note: For this demo, address is predefined.</p>
              </div>

              <button 
                type="button" 
                className="proceed-payment-button"
                onClick={handleProceedToPayment}
              >
                Proceed to Payment
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  )
}

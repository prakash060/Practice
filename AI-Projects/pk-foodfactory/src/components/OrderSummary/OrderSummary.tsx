import type { CartItem } from '../../state/FoodContext'

interface OrderSummaryProps {
  cartItems: CartItem[]
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onCheckout?: () => void
}

export function OrderSummary({ cartItems, onRemoveItem, onClearCart, onCheckout }: OrderSummaryProps) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <section className="order-summary">
      <div className="order-summary__header">
        <h2>Your order</h2>
        <button type="button" className="clear-button" onClick={onClearCart}>
          Clear
        </button>
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-state">No items in the cart yet.</p>
      ) : (
        <div className="order-summary__items">
          {cartItems.map((item) => (
            <div key={item.id} className="order-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.quantity} × ₹{item.price}</p>
              </div>
              <button type="button" className="remove-button" onClick={() => onRemoveItem(item.id)}>
                −
              </button>
            </div>
          ))}
          <div className="order-summary__total">
            <span>Total</span>
            <strong>₹{total}</strong>
          </div>
          {onCheckout && (
            <button 
              type="button" 
              className="checkout-button" 
              onClick={onCheckout}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          )}
        </div>
      )}
    </section>
  )
}

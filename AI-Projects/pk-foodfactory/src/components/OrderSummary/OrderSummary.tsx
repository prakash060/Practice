import type { CartItem } from '../../state/FoodContext'
import { ArrowRightIcon, TrashIcon } from '../Icons'

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
        <button
          type="button"
          className="clear-button btn-icon"
          onClick={onClearCart}
          aria-label="Clear cart"
          title="Clear cart"
        >
          <TrashIcon />
          <span>Clear</span>
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
              <button
                type="button"
                className="remove-button icon-only"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Remove ${item.name}`}
                title={`Remove ${item.name}`}
              >
                <TrashIcon />
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
              className="checkout-button btn-icon"
              onClick={onCheckout}
              disabled={cartItems.length === 0}
            >
              <span>Proceed to Checkout</span>
              <ArrowRightIcon />
            </button>
          )}
        </div>
      )}
    </section>
  )
}

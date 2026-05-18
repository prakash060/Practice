import type { CartItem } from '../../state/FoodContext'
import { ArrowRightIcon, ShoppingBagIcon, TrashIcon } from '../Icons'

interface OrderSummaryProps {
  cartItems: CartItem[]
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onCheckout?: () => void
  /** Inside slide-out cart drawer — flatter chrome. */
  variant?: 'default' | 'drawer'
}

export function OrderSummary({
  cartItems,
  onRemoveItem,
  onClearCart,
  onCheckout,
  variant = 'default',
}: OrderSummaryProps) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const isEmpty = cartItems.length === 0

  return (
    <section
      className={`order-summary ${variant === 'drawer' ? 'order-summary--drawer' : ''}`}
      aria-label="Shopping cart"
    >
      <div className="order-summary__header">
        <div className="order-summary__title-wrap">
          <h2 className="order-summary__title">Your order</h2>
          {!isEmpty ? (
            <span className="order-summary__badge">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          ) : null}
        </div>
        {!isEmpty ? (
          <button
            type="button"
            className="order-summary__clear btn-icon"
            onClick={onClearCart}
            aria-label="Clear cart"
            title="Clear cart"
          >
            <TrashIcon size={14} />
            <span>Clear</span>
          </button>
        ) : null}
      </div>

      {isEmpty ? (
        <div className="order-summary__empty">
          <span className="order-summary__empty-icon" aria-hidden="true">
            <ShoppingBagIcon size={28} />
          </span>
          <p className="order-summary__empty-title">Your cart is empty</p>
          <p className="order-summary__empty-hint">
            Tap <strong>Add to cart</strong> on any dish to start your order.
          </p>
        </div>
      ) : (
        <>
          <ul className="order-summary__list">
            {cartItems.map((item) => (
              <li key={item.id} className="order-summary__line">
                <div className="order-summary__line-main">
                  <span className="order-summary__line-name">{item.name}</span>
                  <span className="order-summary__line-meta">
                    {item.quantity} × ₹{item.price}
                  </span>
                </div>
                <div className="order-summary__line-end">
                  <span className="order-summary__line-total">
                    ₹{item.price * item.quantity}
                  </span>
                  <button
                    type="button"
                    className="order-summary__line-remove icon-only"
                    onClick={() => onRemoveItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    title={`Remove ${item.name}`}
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="order-summary__footer">
            <div className="order-summary__total">
              <span>Subtotal</span>
              <strong>₹{total}</strong>
            </div>
            {onCheckout ? (
              <button
                type="button"
                className="order-summary__checkout btn-icon"
                onClick={onCheckout}
              >
                <span>Proceed to checkout</span>
                <ArrowRightIcon size={16} />
              </button>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}

import { useCallback, useEffect, useId } from 'react'
import type { CartItem } from '../../state/FoodContext'
import { useFood } from '../../hooks/useFood'
import { OrderSummary } from '../OrderSummary/OrderSummary'
import { CartIcon, XIcon } from '../Icons'

export interface CartDrawerProps {
  cartItems: CartItem[]
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onCheckout: () => void
}

/** Header cart button — use on the menu page only. */
export function CartTrigger() {
  const { cartItems, cartDrawerOpen, setCartDrawerOpen } = useFood()
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <button
      type="button"
      className="header-cart-trigger"
      onClick={() => setCartDrawerOpen(true)}
      aria-expanded={cartDrawerOpen}
      aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart'}
    >
      <CartIcon size={22} />
      {itemCount > 0 ? (
        <span className="header-cart-trigger__badge" aria-hidden="true">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      ) : null}
    </button>
  )
}

export function CartDrawer({
  cartItems,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartDrawerProps) {
  const panelId = useId()
  const { cartDrawerOpen, setCartDrawerOpen } = useFood()

  const close = useCallback(() => setCartDrawerOpen(false), [setCartDrawerOpen])

  useEffect(() => {
    if (!cartDrawerOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [cartDrawerOpen])

  useEffect(() => {
    if (!cartDrawerOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [cartDrawerOpen, close])

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    close()
    onCheckout()
  }

  if (!cartDrawerOpen) return null

  return (
    <div className="cart-drawer">
      <button
        type="button"
        className="cart-drawer__backdrop"
        onClick={close}
        aria-label="Close cart"
        tabIndex={-1}
      />
      <aside
        id={panelId}
        className="cart-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
      >
        <div className="cart-drawer__panel-head">
          <button
            type="button"
            className="cart-drawer__close icon-only"
            onClick={close}
            aria-label="Close cart"
          >
            <XIcon size={18} />
          </button>
        </div>
        <div className="cart-drawer__panel-body">
          <OrderSummary
            cartItems={cartItems}
            onRemoveItem={onRemoveItem}
            onClearCart={onClearCart}
            onCheckout={handleCheckout}
            variant="drawer"
          />
        </div>
      </aside>
    </div>
  )
}

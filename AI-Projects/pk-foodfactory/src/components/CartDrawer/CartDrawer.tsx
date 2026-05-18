import { useCallback, useEffect, useId } from 'react'
import type { CartItem } from '../../state/FoodContext'
import { OrderSummary } from '../OrderSummary/OrderSummary'
import { ShoppingBagIcon, XIcon } from '../Icons'

export interface CartDrawerProps {
  cartItems: CartItem[]
  onRemoveItem: (itemId: string) => void
  onClearCart: () => void
  onCheckout: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({
  cartItems,
  onRemoveItem,
  onClearCart,
  onCheckout,
  open,
  onOpenChange,
}: CartDrawerProps) {
  const panelId = useId()
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    close()
    onCheckout()
  }

  return (
    <>
      <button
        type="button"
        className="cart-trigger"
        onClick={() => onOpenChange(true)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
      >
        <span className="cart-trigger__icon" aria-hidden="true">
          <ShoppingBagIcon size={22} />
        </span>
        <span className="cart-trigger__label">Cart</span>
        {itemCount > 0 ? (
          <span className="cart-trigger__badge" aria-label={`${itemCount} items in cart`}>
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        ) : null}
      </button>

      {open ? (
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
      ) : null}
    </>
  )
}

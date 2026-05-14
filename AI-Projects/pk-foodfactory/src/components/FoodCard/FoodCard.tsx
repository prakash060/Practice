import type { FoodItem } from '../../types/food'
import { useMemo, useState } from 'react'
import { GENERIC_FOOD_IMAGE } from '../../constants/categories'
import { useFood } from '../../hooks/useFood'

function IconMinus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface FoodCardProps {
  item: FoodItem
}

export function FoodCard({ item }: FoodCardProps) {
  const { cartItems, addToCart, removeFromCart, getCategoryMeta } = useFood()
  const fallback = useMemo(
    () => getCategoryMeta(item.category).imageUrl || GENERIC_FOOD_IMAGE,
    [getCategoryMeta, item.category]
  )
  const initialSrc = item.imageUrl || fallback
  const [imageSrc, setImageSrc] = useState(initialSrc)

  const quantity = cartItems.find((line) => line.id === item.id)?.quantity ?? 0

  return (
    <article className="food-card">
      <div className="food-card__image">
        <img
          src={imageSrc}
          alt={item.name}
          loading="lazy"
          onError={() => {
            if (imageSrc !== fallback) setImageSrc(fallback)
          }}
        />
        <div className="food-card__image-overlay">
          <span className="food-card__badge">{item.category}</span>
        </div>
      </div>
      <div className="food-card__content">
        <div className="food-card__header">
          <h3>{item.name}</h3>
          <span className="food-card__price">₹{item.price}</span>
        </div>
        <p>{item.description}</p>
      </div>
      <div className="food-card__actions">
        <div
          className="qty-stepper"
          role="group"
          aria-label={`Quantity for ${item.name}`}
        >
          <button
            type="button"
            className="qty-stepper__btn qty-stepper__btn--minus"
            onClick={() => removeFromCart(item.id)}
            disabled={quantity === 0}
            aria-label="Decrease quantity"
          >
            <IconMinus />
          </button>
          <span className="qty-stepper__count" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="qty-stepper__btn qty-stepper__btn--plus"
            onClick={() => addToCart(item)}
            aria-label="Increase quantity"
          >
            <IconPlus />
          </button>
        </div>
      </div>
    </article>
  )
}

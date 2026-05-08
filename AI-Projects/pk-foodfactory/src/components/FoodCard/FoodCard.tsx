import type { FoodItem } from '../../types/food'
import { useMemo, useState } from 'react'
import { getCategoryMeta } from '../../constants/categories'
import { useFood } from '../../hooks/useFood'

interface FoodCardProps {
  item: FoodItem
}

export function FoodCard({ item }: FoodCardProps) {
  const { cartItems, addToCart, removeFromCart } = useFood()
  const fallback = useMemo(() => getCategoryMeta(item.category).imageUrl, [item.category])
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
        {quantity === 0 ? (
          <button type="button" className="food-card__button" onClick={() => addToCart(item)}>
            Add
          </button>
        ) : (
          <div className="qty-stepper" role="group" aria-label={`Change quantity for ${item.name}`}>
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => removeFromCart(item.id)}
              aria-label="Remove one"
            >
              −
            </button>
            <span className="qty-stepper__count" aria-label={`Quantity ${quantity}`}>
              {quantity}
            </span>
            <button
              type="button"
              className="qty-stepper__btn"
              onClick={() => addToCart(item)}
              aria-label="Add one"
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

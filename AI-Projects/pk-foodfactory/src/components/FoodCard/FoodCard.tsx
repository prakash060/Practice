import type { FoodItem } from '../../types/food'
import { useMemo, useState } from 'react'
import { getCategoryMeta } from '../../constants/categories'

interface FoodCardProps {
  item: FoodItem
  onAddToCart: (item: FoodItem) => void
}

export function FoodCard({ item, onAddToCart }: FoodCardProps) {
  const fallback = useMemo(() => getCategoryMeta(item.category).imageUrl, [item.category])
  const initialSrc = item.imageUrl || fallback
  const [imageSrc, setImageSrc] = useState(initialSrc)
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
      <button type="button" className="food-card__button" onClick={() => onAddToCart(item)}>
        Add to order
      </button>
    </article>
  )
}

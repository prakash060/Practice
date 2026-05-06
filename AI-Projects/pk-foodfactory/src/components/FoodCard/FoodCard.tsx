import type { FoodItem } from '../../types/food'

interface FoodCardProps {
  item: FoodItem
  onAddToCart: (item: FoodItem) => void
}

export function FoodCard({ item, onAddToCart }: FoodCardProps) {
  return (
    <article className="food-card">
      <div className="food-card__image">
        <span>{item.category}</span>
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

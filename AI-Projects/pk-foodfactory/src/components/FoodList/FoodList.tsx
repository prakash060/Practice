import type { FoodItem } from '../../types/food'
import { FoodCard } from '../FoodCard/FoodCard'

interface FoodListProps {
  items: FoodItem[]
  onAddToCart: (item: FoodItem) => void
}

export function FoodList({ items, onAddToCart }: FoodListProps) {
  if (items.length === 0) {
    return <p className="empty-state">No dishes found for this category yet.</p>
  }

  return (
    <div className="food-grid">
      {items.map((item) => (
        <FoodCard key={item.id} item={item} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}

import type { FoodItem } from '../../types/food'
import { FoodCard } from '../FoodCard/FoodCard'

interface FoodListProps {
  items: FoodItem[]
}

export function FoodList({ items }: FoodListProps) {
  if (items.length === 0) {
    return <p className="empty-state">No dishes found for this category yet.</p>
  }

  return (
    <div className="food-grid">
      {items.map((item) => (
        <FoodCard key={item.id} item={item} />
      ))}
    </div>
  )
}

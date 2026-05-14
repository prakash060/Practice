import type { FoodItem } from '../types/food'
import { foodItemsAPI } from './api'
import { categories, type FoodCategory } from '../constants/categories'

function isKnownCategory(value: string): value is FoodCategory {
  return (categories as readonly string[]).includes(value)
}

/** Fetch the menu from the backend. Filters client-side guard: drop any unknown categories. */
export async function fetchFoodItems(category?: FoodCategory): Promise<FoodItem[]> {
  const docs = await foodItemsAPI.list(category)
  return docs
    .filter((d) => isKnownCategory(d.category))
    .map((d) => ({
      id: d.id,
      category: d.category as FoodCategory,
      name: d.name,
      description: d.description || '',
      price: d.price,
      imageUrl: d.imageUrl || undefined,
    }))
}

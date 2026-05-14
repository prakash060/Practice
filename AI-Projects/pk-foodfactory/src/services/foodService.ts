import type { Category, FoodItem } from '../types/food'
import { foodItemsAPI, categoriesAPI } from './api'

export async function fetchFoodItems(category?: string): Promise<FoodItem[]> {
  const docs = await foodItemsAPI.list(category)
  return docs.map((d) => ({
    id: d.id,
    category: d.category,
    name: d.name,
    description: d.description || '',
    price: d.price,
    imageUrl: d.imageUrl || null,
  }))
}

export async function fetchCategories(): Promise<Category[]> {
  const docs = await categoriesAPI.list()
  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    label: d.label || d.name,
    emoji: d.emoji || '🍽️',
    accent: d.accent || '#6b5ef7',
    imageUrl: d.imageUrl || null,
  }))
}

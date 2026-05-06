import type { FoodCategory } from '../constants/categories'

export interface FoodItem {
  id: string
  category: FoodCategory
  name: string
  description: string
  price: number
  imageUrl?: string
}

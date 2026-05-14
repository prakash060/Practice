export interface Category {
  id: string
  name: string
  label: string
  emoji: string
  accent: string
  imageUrl: string | null
}

export interface FoodItem {
  id: string
  category: string
  name: string
  description: string
  price: number
  imageUrl?: string | null
}

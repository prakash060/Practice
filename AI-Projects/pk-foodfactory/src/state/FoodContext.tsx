import { createContext, useContext, useMemo, useState } from 'react'
import { categories } from '../constants/categories'
import { getFoodItemsByCategory } from '../services/foodService'
import type { FoodItem } from '../types/food'

export interface CartItem extends FoodItem {
  quantity: number
}

interface FoodContextValue {
  categories: typeof categories
  selectedCategory: (typeof categories)[number]
  setSelectedCategory: (category: (typeof categories)[number]) => void
  menuItems: FoodItem[]
  cartItems: CartItem[]
  addToCart: (item: FoodItem) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
}

const FoodContext = createContext<FoodContextValue | undefined>(undefined)

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>(categories[0])
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const menuItems = useMemo(
    () => getFoodItemsByCategory(selectedCategory),
    [selectedCategory],
  )

  const addToCart = (item: FoodItem) => {
    setCartItems((current) => {
      const existing = current.find((line) => line.id === item.id)
      if (existing) {
        return current.map((line) =>
          line.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        )
      }

      return [...current, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems((current) =>
      current
        .map((line) =>
          line.id === itemId
            ? { ...line, quantity: Math.max(line.quantity - 1, 0) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    )
  }

  const clearCart = () => setCartItems([])

  return (
    <FoodContext.Provider
      value={{
        categories,
        selectedCategory,
        setSelectedCategory,
        menuItems,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </FoodContext.Provider>
  )
}

export function useFoodContext() {
  const context = useContext(FoodContext)
  if (!context) {
    throw new Error('useFoodContext must be used within FoodProvider')
  }

  return context
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { categories } from '../constants/categories'
import { fetchFoodItems } from '../services/foodService'
import type { FoodItem } from '../types/food'

export interface CartItem extends FoodItem {
  quantity: number
}

interface FoodContextValue {
  categories: typeof categories
  selectedCategory: (typeof categories)[number]
  setSelectedCategory: (category: (typeof categories)[number]) => void
  menuItems: FoodItem[]
  allItems: FoodItem[]
  cartItems: CartItem[]
  addToCart: (item: FoodItem) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  isLoadingMenu: boolean
  menuError: string | null
  reloadMenu: () => Promise<void>
}

const FoodContext = createContext<FoodContextValue | undefined>(undefined)

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>(categories[0])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [allItems, setAllItems] = useState<FoodItem[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)

  const reloadMenu = useCallback(async () => {
    setIsLoadingMenu(true)
    setMenuError(null)
    try {
      const items = await fetchFoodItems()
      setAllItems(items)
    } catch (err) {
      console.error('Failed to load menu:', err)
      setMenuError('Could not load the menu. Please try again later.')
    } finally {
      setIsLoadingMenu(false)
    }
  }, [])

  useEffect(() => {
    void reloadMenu()
  }, [reloadMenu])

  const menuItems = useMemo(
    () => allItems.filter((item) => item.category === selectedCategory),
    [allItems, selectedCategory]
  )

  const addToCart = (item: FoodItem) => {
    setCartItems((current) => {
      const existing = current.find((line) => line.id === item.id)
      if (existing) {
        return current.map((line) =>
          line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }
      return [...current, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems((current) =>
      current
        .map((line) =>
          line.id === itemId ? { ...line, quantity: Math.max(line.quantity - 1, 0) } : line,
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
        allItems,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isLoadingMenu,
        menuError,
        reloadMenu,
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

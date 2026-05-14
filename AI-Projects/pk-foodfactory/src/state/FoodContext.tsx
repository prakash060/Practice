import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchCategories, fetchFoodItems } from '../services/foodService'
import {
  DEFAULT_CATEGORY_ACCENT,
  DEFAULT_CATEGORY_EMOJI,
  GENERIC_FOOD_IMAGE,
} from '../constants/categories'
import type { Category, FoodItem } from '../types/food'

export interface CartItem extends FoodItem {
  quantity: number
}

interface FoodContextValue {
  categories: Category[]
  selectedCategory: string | null
  setSelectedCategory: (categoryName: string) => void
  menuItems: FoodItem[]
  allItems: FoodItem[]
  cartItems: CartItem[]
  addToCart: (item: FoodItem) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  isLoadingMenu: boolean
  menuError: string | null
  reloadMenu: () => Promise<void>
  /** Looks up category by name. Returns a default-filled object when missing. */
  getCategoryMeta: (categoryName: string) => Category
}

const FoodContext = createContext<FoodContextValue | undefined>(undefined)

function defaultCategoryMeta(name: string): Category {
  return {
    id: '',
    name,
    label: name || 'Uncategorized',
    emoji: DEFAULT_CATEGORY_EMOJI,
    accent: DEFAULT_CATEGORY_ACCENT,
    imageUrl: null,
  }
}

export function FoodProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategoryState] = useState<string | null>(null)
  const [allItems, setAllItems] = useState<FoodItem[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)

  const reloadMenu = useCallback(async () => {
    setIsLoadingMenu(true)
    setMenuError(null)
    try {
      const [cats, items] = await Promise.all([fetchCategories(), fetchFoodItems()])
      setCategories(cats)
      setAllItems(items)
      // Keep selection when still present; otherwise pick first available.
      setSelectedCategoryState((prev) => {
        if (prev && cats.some((c) => c.name === prev)) return prev
        return cats[0]?.name ?? null
      })
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

  const setSelectedCategory = useCallback((name: string) => {
    setSelectedCategoryState(name)
  }, [])

  const categoryByName = useMemo(() => {
    const map = new Map<string, Category>()
    for (const c of categories) map.set(c.name, c)
    return map
  }, [categories])

  const getCategoryMeta = useCallback(
    (name: string): Category => categoryByName.get(name) ?? defaultCategoryMeta(name),
    [categoryByName]
  )

  const menuItems = useMemo(
    () =>
      selectedCategory ? allItems.filter((item) => item.category === selectedCategory) : [],
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
        getCategoryMeta,
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

export { GENERIC_FOOD_IMAGE }

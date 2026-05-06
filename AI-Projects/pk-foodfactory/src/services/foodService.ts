import type { FoodItem } from '../types/food'

const foodItems: FoodItem[] = [
  {
    id: 'biryani-01',
    category: 'Biryani',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with spiced chicken and herbs.',
    price: 320,
  },
  {
    id: 'biryani-02',
    category: 'Biryani',
    name: 'Veg Biryani',
    description: 'Mixed vegetables layered with saffron rice and rich spices.',
    price: 280,
  },
  {
    id: 'icecream-01',
    category: 'Icecream',
    name: 'Mango Kulfi',
    description: 'Creamy mango kulfi topped with roasted pistachios.',
    price: 120,
  },
  {
    id: 'icecream-02',
    category: 'Icecream',
    name: 'Chocolate Scoop',
    description: 'Rich chocolate ice cream with crunchy chocolate chips.',
    price: 150,
  },
  {
    id: 'chat-01',
    category: 'Chats',
    name: 'Pani Puri',
    description: 'Crispy puris filled with spicy potato and tangy water.',
    price: 80,
  },
  {
    id: 'chat-02',
    category: 'Chats',
    name: 'Bhel Puri',
    description: 'Savory puffed rice with chutneys, sev, and fresh veggies.',
    price: 100,
  },
  {
    id: 'pizza-01',
    category: 'Pizza',
    name: 'Margherita Pizza',
    description: 'Classic pizza with mozzarella cheese, tomatoes, and fresh basil.',
    price: 350,
  },
  {
    id: 'pizza-02',
    category: 'Pizza',
    name: 'Paneer Tikka Pizza',
    description: 'Spiced paneer pieces with onions and peppers on a thin crust.',
    price: 400,
  },
  {
    id: 'sweets-01',
    category: 'Sweets',
    name: 'Gulab Jamun',
    description: 'Soft cheese balls in sugar syrup, served warm.',
    price: 150,
  },
  {
    id: 'sweets-02',
    category: 'Sweets',
    name: 'Jalebi',
    description: 'Crispy spiral sweets soaked in sugar syrup.',
    price: 120,
  },
]

export function getFoodItems(): FoodItem[] {
  return foodItems
}

export function getFoodItemsByCategory(category?: string): FoodItem[] {
  if (!category) {
    return foodItems
  }

  return foodItems.filter((item) => item.category === category)
}

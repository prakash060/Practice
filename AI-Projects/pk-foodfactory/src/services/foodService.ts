import type { FoodItem } from '../types/food'

const foodItems: FoodItem[] = [
  {
    id: 'biryani-01',
    category: 'Biryani',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice cooked with spiced chicken and herbs.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'biryani-02',
    category: 'Biryani',
    name: 'Veg Biryani',
    description: 'Mixed vegetables layered with saffron rice and rich spices.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1627662056594-4bdf2f2c0f2b?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'biryani-03',
    category: 'Biryani',
    name: 'Hyderabadi Dum Biryani',
    description: 'Slow-cooked dum biryani with aromatic spices and fried onions.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'biryani-04',
    category: 'Biryani',
    name: 'Egg Biryani',
    description: 'Fluffy rice with masala boiled eggs, mint and coriander.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1631515242809-497bb7d1cf8e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'icecream-01',
    category: 'Icecream',
    name: 'Mango Kulfi',
    description: 'Creamy mango kulfi topped with roasted pistachios.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1590080875514-6969c90a9a0d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'icecream-02',
    category: 'Icecream',
    name: 'Chocolate Scoop',
    description: 'Rich chocolate ice cream with crunchy chocolate chips.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'icecream-03',
    category: 'Icecream',
    name: 'Strawberry Sundae',
    description: 'Strawberry ice cream with sauce and crunchy nuts.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'icecream-04',
    category: 'Icecream',
    name: 'Vanilla Soft Serve',
    description: 'Classic soft serve with a smooth vanilla finish.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'chat-01',
    category: 'Chats',
    name: 'Pani Puri',
    description: 'Crispy puris filled with spicy potato and tangy water.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'chat-02',
    category: 'Chats',
    name: 'Bhel Puri',
    description: 'Savory puffed rice with chutneys, sev, and fresh veggies.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1617191519105-d07b98d25056?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'chat-03',
    category: 'Chats',
    name: 'Dahi Puri',
    description: 'Crispy puris with yogurt, chutneys and sev.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1626132647523-66c1f1b097e2?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'chat-04',
    category: 'Chats',
    name: 'Samosa Chaat',
    description: 'Crushed samosa topped with chutneys, yogurt and spices.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'pizza-01',
    category: 'Pizza',
    name: 'Margherita Pizza',
    description: 'Classic pizza with mozzarella cheese, tomatoes, and fresh basil.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1601924582975-7e1f4f09b5d4?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'pizza-02',
    category: 'Pizza',
    name: 'Paneer Tikka Pizza',
    description: 'Spiced paneer pieces with onions and peppers on a thin crust.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'pizza-03',
    category: 'Pizza',
    name: 'Pepperoni Pizza',
    description: 'Cheesy pepperoni with a crisp crust and oregano.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1601924928376-3ecf86f8d5b4?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'pizza-04',
    category: 'Pizza',
    name: 'Veggie Supreme',
    description: 'Loaded with peppers, onions, olives and sweet corn.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1594007654729-407eedc4be41?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'sweets-01',
    category: 'Sweets',
    name: 'Gulab Jamun',
    description: 'Soft cheese balls in sugar syrup, served warm.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1601050691044-7a3a32b6785d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'sweets-02',
    category: 'Sweets',
    name: 'Jalebi',
    description: 'Crispy spiral sweets soaked in sugar syrup.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1626082912217-0c0fe8e32d8a?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'sweets-03',
    category: 'Sweets',
    name: 'Rasgulla',
    description: 'Soft spongy balls soaked in light sugar syrup.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1601050690731-9412b28496cd?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'sweets-04',
    category: 'Sweets',
    name: 'Kaju Katli',
    description: 'Classic cashew fudge with a smooth, rich bite.',
    price: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1614707267537-2f50f9237fdf?auto=format&fit=crop&w=1400&q=80',
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

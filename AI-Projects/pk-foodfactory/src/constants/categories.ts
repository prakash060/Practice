export const categories = ['Biryani', 'Icecream', 'Chats', 'Pizza', 'Sweets'] as const
export type FoodCategory = (typeof categories)[number]

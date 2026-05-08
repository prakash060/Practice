export const categories = ['Biryani', 'Icecream', 'Chats', 'Pizza', 'Sweets'] as const
export type FoodCategory = (typeof categories)[number]

export const categoryMeta: Record<
  FoodCategory,
  { label: string; imageUrl: string; accent: string; emoji: string }
> = {
  Biryani: {
    label: 'Biryani',
    emoji: '🍚',
    accent: '#6b5ef7',
    imageUrl:
      'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=1400&q=80',
  },
  Icecream: {
    label: 'Ice cream',
    emoji: '🍦',
    accent: '#ff5fa2',
    imageUrl:
      'https://images.unsplash.com/photo-1514849302-984523450cf4?auto=format&fit=crop&w=1400&q=80',
  },
  Chats: {
    label: 'Chats',
    emoji: '🥗',
    accent: '#25c26e',
    imageUrl:
      'https://images.unsplash.com/photo-1604908176997-125f25cc500f?auto=format&fit=crop&w=1400&q=80',
  },
  Pizza: {
    label: 'Pizza',
    emoji: '🍕',
    accent: '#ff7a45',
    imageUrl:
      'https://images.unsplash.com/photo-1548365328-9f547db17b57?auto=format&fit=crop&w=1400&q=80',
  },
  Sweets: {
    label: 'Sweets',
    emoji: '🍩',
    accent: '#f6b73c',
    imageUrl:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=80',
  },
}

export function getCategoryMeta(category: FoodCategory) {
  return categoryMeta[category]
}

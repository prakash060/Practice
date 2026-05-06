interface CategoryTabsProps<T extends string> {
  categories: readonly T[]
  selectedCategory: T
  onSelectCategory: (category: T) => void
}

export function CategoryTabs<T extends string>({ categories, selectedCategory, onSelectCategory }: CategoryTabsProps<T>) {
  return (
    <div className="category-tabs">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`category-button ${category === selectedCategory ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

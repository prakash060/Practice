interface CategoryTabsProps<T extends string> {
  categories: readonly T[]
  selectedCategory: T
  onSelectCategory: (category: T) => void
  getCategoryImageUrl?: (category: T) => string | undefined
  getCategoryEmoji?: (category: T) => string | undefined
}

export function CategoryTabs<T extends string>({
  categories,
  selectedCategory,
  onSelectCategory,
  getCategoryImageUrl,
  getCategoryEmoji,
}: CategoryTabsProps<T>) {
  return (
    <div className="category-tabs">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`category-button ${category === selectedCategory ? 'active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          <span className="category-button__content">
            {getCategoryImageUrl?.(category) ? (
              <span
                className="category-button__thumb"
                style={{ backgroundImage: `url("${getCategoryImageUrl(category)}")` }}
                aria-hidden="true"
              />
            ) : null}
            <span className="category-button__label">
              {getCategoryEmoji?.(category) ? `${getCategoryEmoji(category)} ` : null}
              {category}
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}

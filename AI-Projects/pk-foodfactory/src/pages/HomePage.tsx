import { useNavigate } from 'react-router-dom'
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs'
import { FoodList } from '../components/FoodList/FoodList'
import { OrderSummary } from '../components/OrderSummary/OrderSummary'
import { getCategoryMeta } from '../constants/categories'
import { useFood } from '../hooks/useFood'

export default function HomePage() {
  const navigate = useNavigate()
  const { categories, selectedCategory, setSelectedCategory, menuItems, addToCart, cartItems, removeFromCart, clearCart } = useFood()

  const selectedMeta = getCategoryMeta(selectedCategory)

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout')
    }
  }

  return (
    <main className="app-shell">
      <header className="brand-header">
        <div className="brand-header__left">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark__dot" />
          </div>
          <div>
            <p className="eyebrow">PK Food Factory</p>
            <h1 className="brand-title">PK Meals</h1>
          </div>
        </div>
        <div className="brand-header__right">
          <div className="brand-pill">
            <span className="brand-pill__emoji">{selectedMeta.emoji}</span>
            <span className="brand-pill__text">{selectedMeta.label}</span>
          </div>
        </div>
      </header>

      <section className="category-hero" style={{ ['--accent' as any]: selectedMeta.accent }}>
        <div className="category-hero__bg" style={{ backgroundImage: `url(${selectedMeta.imageUrl})` }} />
        <div className="category-hero__content">
          <p className="category-hero__kicker">Today’s picks</p>
          <h2 className="category-hero__title">{selectedMeta.emoji} {selectedMeta.label}</h2>
          <p className="category-hero__subtitle">Tap a category, add items, and checkout in seconds.</p>
        </div>
      </section>

      <section className="panel">
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          getCategoryImageUrl={(c) => getCategoryMeta(c as any).imageUrl}
          getCategoryEmoji={(c) => getCategoryMeta(c as any).emoji}
        />
      </section>

      <section className="content-grid">
        <div className="content-grid__main">
          <h2>{selectedCategory} menu</h2>
          <FoodList items={menuItems} onAddToCart={addToCart} />
        </div>
        <aside className="content-grid__side">
          <OrderSummary cartItems={cartItems} onRemoveItem={removeFromCart} onClearCart={clearCart} onCheckout={handleCheckout} />
        </aside>
      </section>
    </main>
  )
}

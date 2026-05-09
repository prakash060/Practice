import { useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs'
import { FoodList } from '../components/FoodList/FoodList'
import { OrderSummary } from '../components/OrderSummary/OrderSummary'
import { getCategoryMeta } from '../constants/categories'
import { useFood } from '../hooks/useFood'

export default function HomePage() {
  const navigate = useNavigate()
  const { categories, selectedCategory, setSelectedCategory, menuItems, cartItems, removeFromCart, clearCart } = useFood()

  const selectedMeta = getCategoryMeta(selectedCategory)

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout')
    }
  }

  return (
    <main className="app-shell">
      <AppHeaderApp />

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
          <FoodList items={menuItems} />
        </div>
        <aside className="content-grid__side">
          <OrderSummary cartItems={cartItems} onRemoveItem={removeFromCart} onClearCart={clearCart} onCheckout={handleCheckout} />
        </aside>
      </section>
    </main>
  )
}

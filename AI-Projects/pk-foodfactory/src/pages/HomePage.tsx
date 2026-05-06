import { useNavigate } from 'react-router-dom'
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs'
import { FoodList } from '../components/FoodList/FoodList'
import { OrderSummary } from '../components/OrderSummary/OrderSummary'
import { useFood } from '../hooks/useFood'

export default function HomePage() {
  const navigate = useNavigate()
  const { categories, selectedCategory, setSelectedCategory, menuItems, addToCart, cartItems, removeFromCart, clearCart } = useFood()

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout')
    }
  }

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Food order service</p>
          <h1>PK Meals</h1>
          <p className="hero-copy">
            Select a category, pick your favorite dishes, and preview your order.
          </p>
        </div>
      </header>

      <section className="panel">
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
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

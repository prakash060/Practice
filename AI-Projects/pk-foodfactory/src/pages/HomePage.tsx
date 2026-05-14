import { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderApp } from '../components/AppHeader'
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs'
import { FoodList } from '../components/FoodList/FoodList'
import { OrderSummary } from '../components/OrderSummary/OrderSummary'
import { GENERIC_FOOD_IMAGE } from '../constants/categories'
import { useFood } from '../hooks/useFood'
import { useAuth } from '../state/AuthContext'
import { useToast } from '../state/ToastContext'

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isAdmin = Boolean(user?.isAdmin)
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    menuItems,
    cartItems,
    removeFromCart,
    clearCart,
    isLoadingMenu,
    menuError,
    getCategoryMeta,
  } = useFood()

  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories])
  const selectedMeta = selectedCategory ? getCategoryMeta(selectedCategory) : null
  const heroImage = selectedMeta?.imageUrl || GENERIC_FOOD_IMAGE
  const heroAccent = selectedMeta?.accent || '#6b5ef7'

  const { showToast } = useToast()

  useEffect(() => {
    const state = (location.state ?? {}) as { status?: string; orderId?: string }
    if (state.status) {
      const msg = state.orderId ? `${state.status} (Order #${state.orderId})` : state.status
      showToast(msg, 'success')
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate, showToast])

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout')
    }
  }

  const hasCategories = categories.length > 0

  return (
    <main className="app-shell">
      <AppHeaderApp />

      <section className="category-hero" style={{ ['--accent' as never]: heroAccent }}>
        <div className="category-hero__bg" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="category-hero__content">
          <p className="category-hero__kicker">Today’s picks</p>
          <h2 className="category-hero__title">
            {selectedMeta ? `${selectedMeta.emoji} ${selectedMeta.label}` : 'Welcome'}
          </h2>
          <p className="category-hero__subtitle">
            {hasCategories
              ? 'Tap a category, add items, and checkout in seconds.'
              : isAdmin
                ? 'No menu set up yet — head to Administration to add categories and items.'
                : 'The menu is being prepared. Please check back soon.'}
          </p>
        </div>
      </section>

      {hasCategories ? (
        <section className="panel">
          <CategoryTabs
            categories={categoryNames}
            selectedCategory={selectedCategory ?? categoryNames[0]}
            onSelectCategory={setSelectedCategory}
            getCategoryImageUrl={(c) => getCategoryMeta(c).imageUrl || undefined}
            getCategoryEmoji={(c) => getCategoryMeta(c).emoji}
          />
        </section>
      ) : null}

      <section className="content-grid">
        <div className="content-grid__main">
          {hasCategories && selectedMeta ? (
            <h2>{selectedMeta.label} menu</h2>
          ) : null}

          {menuError ? <p className="error-message">{menuError}</p> : null}

          {isLoadingMenu ? (
            <p className="empty-state">Loading menu…</p>
          ) : !hasCategories ? (
            <p className="empty-state">
              {isAdmin ? (
                <>
                  No categories yet.{' '}
                  <Link to="/admin">Open Administration</Link> to create your first one.
                </>
              ) : (
                <>The menu is empty right now. Please check back later.</>
              )}
            </p>
          ) : (
            <FoodList items={menuItems} />
          )}
        </div>
        <aside className="content-grid__side">
          <OrderSummary
            cartItems={cartItems}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onCheckout={handleCheckout}
          />
        </aside>
      </section>
    </main>
  )
}

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderApp } from '../components/AppHeader'
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs'
import { GENERIC_FOOD_IMAGE } from '../constants/categories'
import { useFood } from '../hooks/useFood'
import {
  categoriesAPI,
  foodItemsAPI,
  type CategoryDoc,
  type FoodItemDoc,
} from '../services/api'
import { useToast } from '../state/ToastContext'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

// ---------- Category form ----------
interface CategoryFormProps {
  onCreated: (cat: CategoryDoc) => void
}

function CategoryForm({ onCreated }: CategoryFormProps) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('')
  const [accent, setAccent] = useState('#6b5ef7')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const reset = () => {
    setName('')
    setLabel('')
    setEmoji('')
    setAccent('#6b5ef7')
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setError(null)
  }

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setError(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 2MB or smaller')
      setImageFile(null)
      setImagePreview(null)
      e.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Category name is required')
      return
    }
    setIsSubmitting(true)
    try {
      const created = await categoriesAPI.create({
        name: trimmedName,
        label: label.trim() || trimmedName,
        emoji: emoji.trim() || '🍽️',
        accent: accent.trim() || '#6b5ef7',
        image: imageFile,
        imageUrl: imageFile ? undefined : null,
      })
      showToast(`Category "${created.name}" added`, 'success')
      onCreated(created)
      reset()
    } catch (err) {
      setError(axiosErrorMessage(err, 'Could not create category'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="error-message">{error}</p> : null}

      <div className="form-group">
        <label htmlFor="cat-name">Category name</label>
        <input
          id="cat-name"
          type="text"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          disabled={isSubmitting}
          required
          maxLength={60}
          placeholder="e.g. Biryani"
        />
      </div>

      <div className="form-group">
        <label htmlFor="cat-label">Display label (optional)</label>
        <input
          id="cat-label"
          type="text"
          value={label}
          onChange={(ev) => setLabel(ev.target.value)}
          disabled={isSubmitting}
          maxLength={80}
          placeholder="Defaults to the name"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cat-emoji">Emoji</label>
          <input
            id="cat-emoji"
            type="text"
            value={emoji}
            onChange={(ev) => setEmoji(ev.target.value)}
            disabled={isSubmitting}
            maxLength={8}
            placeholder="🍽️"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cat-accent">Accent color</label>
          <input
            id="cat-accent"
            type="color"
            value={accent}
            onChange={(ev) => setAccent(ev.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="cat-image">Image (optional, ≤ 2MB)</label>
        <input
          id="cat-image"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={onImageChange}
          disabled={isSubmitting}
        />
        <div className="admin-preview">
          <img
            src={imagePreview || GENERIC_FOOD_IMAGE}
            alt={imagePreview ? 'Category image preview' : 'Default placeholder'}
          />
          <p className="form-hint">
            {imagePreview
              ? 'Preview of your selected image.'
              : 'No image selected — a generic placeholder will be used.'}
          </p>
        </div>
      </div>

      <div className="profile-actions">
        <button
          type="button"
          className="back-button"
          onClick={reset}
          disabled={isSubmitting}
        >
          Reset
        </button>
        <button
          type="submit"
          className="proceed-payment-button auth-submit profile-save"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save category'}
        </button>
      </div>
    </form>
  )
}

// ---------- Item form ----------
interface ItemFormProps {
  category: CategoryDoc
  onCreated: (item: FoodItemDoc) => void
}

function ItemForm({ category, onCreated }: ItemFormProps) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('2')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const reset = () => {
    setName('')
    setDescription('')
    setPrice('2')
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setError(null)
  }

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setError(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 2MB or smaller')
      setImageFile(null)
      setImagePreview(null)
      e.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Title is required')
      return
    }
    const priceNum = price.trim() === '' ? undefined : Number(price)
    if (priceNum !== undefined && (!Number.isFinite(priceNum) || priceNum < 0)) {
      setError('Price must be a non-negative number')
      return
    }
    setIsSubmitting(true)
    try {
      const created = await foodItemsAPI.create({
        category: category.name,
        name: trimmedName,
        description: description.trim(),
        price: priceNum,
        image: imageFile,
        imageUrl: imageFile ? undefined : null,
      })
      showToast(`Added "${created.name}"`, 'success')
      onCreated(created)
      reset()
    } catch (err) {
      setError(axiosErrorMessage(err, 'Could not save the item'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const fallbackImage = category.imageUrl || GENERIC_FOOD_IMAGE

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="error-message">{error}</p> : null}

      <div className="form-group">
        <label htmlFor="item-name">Title</label>
        <input
          id="item-name"
          type="text"
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          disabled={isSubmitting}
          required
          maxLength={120}
        />
      </div>

      <div className="form-group">
        <label htmlFor="item-desc">Description (optional)</label>
        <textarea
          id="item-desc"
          rows={3}
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          disabled={isSubmitting}
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label htmlFor="item-price">Price (₹)</label>
        <input
          id="item-price"
          type="number"
          min="0"
          step="0.5"
          value={price}
          onChange={(ev) => setPrice(ev.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="item-image">Image (optional, ≤ 2MB)</label>
        <input
          id="item-image"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={onImageChange}
          disabled={isSubmitting}
        />
        <div className="admin-preview">
          <img
            src={imagePreview || fallbackImage}
            alt={imagePreview ? 'Selected image preview' : 'Category default image'}
          />
          <p className="form-hint">
            {imagePreview
              ? 'Preview of your selected image.'
              : 'No image selected — the category image (or default) will be used.'}
          </p>
        </div>
      </div>

      <div className="profile-actions">
        <button
          type="button"
          className="back-button"
          onClick={reset}
          disabled={isSubmitting}
        >
          Reset
        </button>
        <button
          type="submit"
          className="proceed-payment-button auth-submit profile-save"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : 'Save item'}
        </button>
      </div>
    </form>
  )
}

// ---------- Main page ----------
export default function AdminPage() {
  const navigate = useNavigate()
  const { reloadMenu } = useFood()
  const { showToast } = useToast()

  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [items, setItems] = useState<FoodItemDoc[]>([])
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [isLoadingCats, setIsLoadingCats] = useState(true)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === selectedCategoryName) ?? null,
    [categories, selectedCategoryName]
  )

  const loadCategories = async () => {
    setIsLoadingCats(true)
    setLoadError(null)
    try {
      const cats = await categoriesAPI.list()
      setCategories(cats)
      setSelectedCategoryName((prev) => {
        if (prev && cats.some((c) => c.name === prev)) return prev
        return cats[0]?.name ?? null
      })
    } catch (err) {
      console.error(err)
      setLoadError('Could not load categories')
    } finally {
      setIsLoadingCats(false)
    }
  }

  const loadItems = async (categoryName: string) => {
    setIsLoadingItems(true)
    try {
      const data = await foodItemsAPI.list(categoryName)
      setItems(data)
    } catch (err) {
      console.error(err)
      showToast('Could not load items', 'error')
    } finally {
      setIsLoadingItems(false)
    }
  }

  useEffect(() => {
    void loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedCategoryName) {
      setItems([])
      return
    }
    void loadItems(selectedCategoryName)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryName])

  const handleCategoryCreated = (created: CategoryDoc) => {
    setCategories((cur) => [...cur, created].sort((a, b) => a.name.localeCompare(b.name)))
    setSelectedCategoryName(created.name)
    void reloadMenu()
  }

  const handleDeleteCategory = async (cat: CategoryDoc) => {
    const itemCount = items.filter((it) => it.category === cat.name).length
    const confirmMsg =
      `Delete category "${cat.name}"? This will also delete its items` +
      (itemCount ? ` (${itemCount} loaded here, more may exist).` : '.') +
      '\nThis cannot be undone.'
    if (!window.confirm(confirmMsg)) return
    try {
      const res = await categoriesAPI.remove(cat.id)
      setCategories((cur) => cur.filter((c) => c.id !== cat.id))
      setSelectedCategoryName((prev) =>
        prev === cat.name ? categories.find((c) => c.id !== cat.id)?.name ?? null : prev
      )
      showToast(
        `Deleted "${cat.name}"${res.itemsDeleted ? ` and ${res.itemsDeleted} item(s)` : ''}`,
        'success'
      )
      void reloadMenu()
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not delete category'), 'error')
    }
  }

  const handleItemCreated = (created: FoodItemDoc) => {
    setItems((cur) => [...cur, created].sort((a, b) => a.name.localeCompare(b.name)))
    void reloadMenu()
  }

  const handleDeleteItem = async (item: FoodItemDoc) => {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) return
    try {
      await foodItemsAPI.remove(item.id)
      setItems((cur) => cur.filter((it) => it.id !== item.id))
      showToast(`Deleted "${item.name}"`, 'success')
      void reloadMenu()
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not delete item'), 'error')
    }
  }

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  const heroAccent = selectedCategory?.accent || '#6b5ef7'
  const heroImage = selectedCategory?.imageUrl || GENERIC_FOOD_IMAGE
  const categoryNames = useMemo(() => categories.map((c) => c.name), [categories])

  return (
    <main className="app-shell">
      <AppHeaderApp />

      <section className="category-hero" style={{ ['--accent' as never]: heroAccent }}>
        <div className="category-hero__bg" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="category-hero__content">
          <p className="category-hero__kicker">Administration</p>
          <h2 className="category-hero__title">Manage categories &amp; items</h2>
          <p className="category-hero__subtitle">
            Start by creating a category, then add items under it. Images are optional.
          </p>
        </div>
      </section>

      {loadError ? (
        <section className="panel">
          <p className="error-message">{loadError}</p>
        </section>
      ) : null}

      {/* Step 1 — categories */}
      <section className="admin-grid">
        <div className="admin-grid__form">
          <div className="auth-card admin-card">
            <h2 className="profile-heading">Add a category</h2>
            <CategoryForm onCreated={handleCategoryCreated} />
          </div>
        </div>

        <div className="admin-grid__list">
          <div className="auth-card admin-card">
            <div className="admin-list__header">
              <h2 className="profile-heading">Existing categories</h2>
              <span className="admin-list__count">{categories.length}</span>
            </div>

            {isLoadingCats ? (
              <p className="empty-state">Loading…</p>
            ) : categories.length === 0 ? (
              <p className="empty-state">
                No categories yet. Add one using the form on the left.
              </p>
            ) : (
              <ul className="admin-item-list">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={`admin-item ${
                      cat.name === selectedCategoryName ? 'admin-item--active' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="admin-item__select"
                      onClick={() => setSelectedCategoryName(cat.name)}
                      aria-label={`Show items for ${cat.label || cat.name}`}
                    >
                      <span
                        className="admin-item__thumb"
                        style={{
                          backgroundImage: `url(${cat.imageUrl || GENERIC_FOOD_IMAGE})`,
                        }}
                        aria-hidden="true"
                      />
                      <span className="admin-item__body">
                        <h3>
                          {cat.emoji} {cat.label || cat.name}
                        </h3>
                        <p className="admin-item__meta">
                          name: <code>{cat.name}</code>
                        </p>
                      </span>
                    </button>
                    <div className="admin-item__actions">
                      <button
                        type="button"
                        className="back-button admin-item__delete"
                        onClick={() => handleDeleteCategory(cat)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Step 2 — items in selected category */}
      <section className="panel">
        <h2 className="admin-section-title">Items</h2>
        {categories.length === 0 ? (
          <p className="empty-state">Create a category first to add items.</p>
        ) : (
          <>
            <CategoryTabs
              categories={categoryNames}
              selectedCategory={selectedCategoryName ?? categoryNames[0]}
              onSelectCategory={(c) => setSelectedCategoryName(c)}
              getCategoryImageUrl={(c) =>
                categories.find((cat) => cat.name === c)?.imageUrl ?? undefined
              }
              getCategoryEmoji={(c) =>
                categories.find((cat) => cat.name === c)?.emoji ?? '🍽️'
              }
            />
          </>
        )}
      </section>

      {selectedCategory ? (
        <section className="admin-grid">
          <div className="admin-grid__form">
            <div className="auth-card admin-card">
              <h2 className="profile-heading">
                Add an item to {selectedCategory.label || selectedCategory.name}
              </h2>
              <ItemForm
                key={selectedCategory.id}
                category={selectedCategory}
                onCreated={handleItemCreated}
              />
            </div>
          </div>

          <div className="admin-grid__list">
            <div className="auth-card admin-card">
              <div className="admin-list__header">
                <h2 className="profile-heading">
                  {selectedCategory.label || selectedCategory.name} items
                </h2>
                <span className="admin-list__count">{sortedItems.length}</span>
              </div>

              {isLoadingItems ? (
                <p className="empty-state">Loading…</p>
              ) : sortedItems.length === 0 ? (
                <p className="empty-state">No items in this category yet.</p>
              ) : (
                <ul className="admin-item-list">
                  {sortedItems.map((item) => (
                    <li key={item.id} className="admin-item">
                      <div
                        className="admin-item__thumb"
                        style={{
                          backgroundImage: `url(${
                            item.imageUrl || selectedCategory.imageUrl || GENERIC_FOOD_IMAGE
                          })`,
                        }}
                        aria-hidden="true"
                      />
                      <div className="admin-item__body">
                        <h3>{item.name}</h3>
                        <p className="admin-item__meta">
                          ₹{item.price}
                          {item.imageUrl ? ' • custom image' : ' • default image'}
                        </p>
                        {item.description ? (
                          <p className="admin-item__desc">{item.description}</p>
                        ) : null}
                      </div>
                      <div className="admin-item__actions">
                        <button
                          type="button"
                          className="back-button admin-item__delete"
                          onClick={() => handleDeleteItem(item)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="panel admin-footer-actions">
        <button type="button" className="back-button" onClick={() => navigate('/')}>
          ← Back to menu
        </button>
      </section>
    </main>
  )
}

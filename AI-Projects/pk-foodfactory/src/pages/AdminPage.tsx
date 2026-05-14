import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderApp } from '../components/AppHeader'
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs'
import { categories, getCategoryMeta, type FoodCategory } from '../constants/categories'
import { useFood } from '../hooks/useFood'
import { foodItemsAPI, type FoodItemDoc } from '../services/api'
import { useToast } from '../state/ToastContext'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // matches multer limit on backend

export default function AdminPage() {
  const navigate = useNavigate()
  const { reloadMenu } = useFood()
  const { showToast } = useToast()

  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>(categories[0])
  const [items, setItems] = useState<FoodItemDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('2')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedMeta = getCategoryMeta(selectedCategory)

  const loadItems = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await foodItemsAPI.list(selectedCategory)
      setItems(data)
    } catch (err) {
      console.error(err)
      setLoadError('Could not load food items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  // Revoke the object URL when the preview is replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('2')
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
    setFormError(null)
  }

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setFormError(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError('Image must be 2MB or smaller')
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
    setFormError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('Title is required')
      return
    }

    const priceNum = price.trim() === '' ? undefined : Number(price)
    if (priceNum !== undefined && (!Number.isFinite(priceNum) || priceNum < 0)) {
      setFormError('Price must be a non-negative number')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await foodItemsAPI.create({
        category: selectedCategory,
        name: trimmedName,
        description: description.trim(),
        price: priceNum,
        image: imageFile,
        imageUrl: imageFile ? undefined : null,
      })
      setItems((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      showToast(`Added "${created.name}"`, 'success')
      resetForm()
      void reloadMenu()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error
        : null
      setFormError(msg || 'Could not save the item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (item: FoodItemDoc) => {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) return
    try {
      await foodItemsAPI.remove(item.id)
      setItems((current) => current.filter((it) => it.id !== item.id))
      showToast(`Deleted "${item.name}"`, 'success')
      void reloadMenu()
    } catch (err) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { error?: string })?.error
        : null
      showToast(msg || 'Could not delete the item', 'error')
    }
  }

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )

  return (
    <main className="app-shell">
      <AppHeaderApp />

      <section className="category-hero" style={{ ['--accent' as never]: selectedMeta.accent }}>
        <div
          className="category-hero__bg"
          style={{ backgroundImage: `url(${selectedMeta.imageUrl})` }}
        />
        <div className="category-hero__content">
          <p className="category-hero__kicker">Administration</p>
          <h2 className="category-hero__title">Manage menu items</h2>
          <p className="category-hero__subtitle">
            Pick a category, then add new dishes with an optional image. No image? We'll show the
            category default.
          </p>
        </div>
      </section>

      <section className="panel">
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(c) => setSelectedCategory(c)}
          getCategoryImageUrl={(c) => getCategoryMeta(c).imageUrl}
          getCategoryEmoji={(c) => getCategoryMeta(c).emoji}
        />
      </section>

      <section className="admin-grid">
        <div className="admin-grid__form">
          <div className="auth-card admin-card">
            <h2 className="profile-heading">Add a new {selectedMeta.label} item</h2>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {formError ? <p className="error-message">{formError}</p> : null}

              <div className="form-group">
                <label htmlFor="admin-name">Title</label>
                <input
                  id="admin-name"
                  type="text"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  disabled={isSubmitting}
                  required
                  maxLength={120}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-desc">Description (optional)</label>
                <textarea
                  id="admin-desc"
                  rows={3}
                  value={description}
                  onChange={(ev) => setDescription(ev.target.value)}
                  disabled={isSubmitting}
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-price">Price (₹)</label>
                <input
                  id="admin-price"
                  type="number"
                  min="0"
                  step="0.5"
                  value={price}
                  onChange={(ev) => setPrice(ev.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admin-image">Image (optional, ≤ 2MB)</label>
                <input
                  id="admin-image"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={onImageChange}
                  disabled={isSubmitting}
                />
                <div className="admin-preview">
                  <img
                    src={imagePreview || selectedMeta.imageUrl}
                    alt={imagePreview ? 'Selected image preview' : 'Category default image'}
                  />
                  <p className="form-hint">
                    {imagePreview
                      ? 'Preview of your selected image.'
                      : 'No image selected — the category default will be used.'}
                  </p>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  className="back-button"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                >
                  ← Back to menu
                </button>
                <button
                  type="submit"
                  className="proceed-payment-button auth-submit profile-save"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving…' : 'Add item'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="admin-grid__list">
          <div className="auth-card admin-card">
            <div className="admin-list__header">
              <h2 className="profile-heading">Existing {selectedMeta.label} items</h2>
              <span className="admin-list__count">{sortedItems.length}</span>
            </div>

            {loadError ? <p className="error-message">{loadError}</p> : null}

            {isLoading ? (
              <p className="empty-state">Loading…</p>
            ) : sortedItems.length === 0 ? (
              <p className="empty-state">
                No {selectedMeta.label.toLowerCase()} items yet. Add one using the form.
              </p>
            ) : (
              <ul className="admin-item-list">
                {sortedItems.map((item) => (
                  <li key={item.id} className="admin-item">
                    <div
                      className="admin-item__thumb"
                      style={{
                        backgroundImage: `url(${item.imageUrl || selectedMeta.imageUrl})`,
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
                        onClick={() => handleDelete(item)}
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
    </main>
  )
}

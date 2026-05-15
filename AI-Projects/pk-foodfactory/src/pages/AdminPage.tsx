import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminNav } from '../components/AdminNav'
import { AppHeaderApp } from '../components/AppHeader'
import { CategoryTabs } from '../components/CategoryTabs/CategoryTabs'
import {
  CheckIcon,
  ChevronLeftIcon,
  EditIcon,
  RotateLeftIcon,
  TrashIcon,
  XIcon,
} from '../components/Icons'
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

// ====================================================================
// Category form (create + edit)
// ====================================================================
interface CategoryFormProps {
  editing?: CategoryDoc | null
  onSaved: (cat: CategoryDoc, mode: 'create' | 'update') => void
  onCancelEdit?: () => void
}

function CategoryForm({ editing, onSaved, onCancelEdit }: CategoryFormProps) {
  const isEdit = Boolean(editing)
  const [name, setName] = useState(editing?.name ?? '')
  const [label, setLabel] = useState(editing?.label ?? '')
  const [emoji, setEmoji] = useState(editing?.emoji ?? '')
  const [accent, setAccent] = useState(editing?.accent ?? '#6b5ef7')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const clearLocalImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  const resetCreate = () => {
    setName('')
    setLabel('')
    setEmoji('')
    setAccent('#6b5ef7')
    clearLocalImage()
    setRemoveImage(false)
    setError(null)
  }

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setError(null)
    clearLocalImage()
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 2MB or smaller')
      e.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveImage(false)
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
      // Image rules:
      //  - new file → upload it
      //  - remove image checked → clear (imageUrl = null)
      //  - otherwise → don't touch (undefined)
      const imagePayload = imageFile
        ? { image: imageFile }
        : removeImage
          ? { imageUrl: null }
          : isEdit
            ? {}
            : { imageUrl: null }
      const payload = {
        name: trimmedName,
        label: label.trim() || trimmedName,
        emoji: emoji.trim() || '🍽️',
        accent: accent.trim() || '#6b5ef7',
        ...imagePayload,
      }
      const saved = isEdit
        ? await categoriesAPI.update(editing!.id, payload)
        : await categoriesAPI.create(payload)
      onSaved(saved, isEdit ? 'update' : 'create')
      if (!isEdit) resetCreate()
    } catch (err) {
      setError(axiosErrorMessage(err, isEdit ? 'Could not update category' : 'Could not create category'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentImageSrc =
    imagePreview ||
    (removeImage ? GENERIC_FOOD_IMAGE : editing?.imageUrl || GENERIC_FOOD_IMAGE)

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
        {isEdit && editing?.imageUrl ? (
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={removeImage}
              onChange={(ev) => {
                setRemoveImage(ev.target.checked)
                if (ev.target.checked) clearLocalImage()
              }}
              disabled={isSubmitting}
            />
            Remove current image (use default)
          </label>
        ) : null}
        <div className="admin-preview">
          <img
            src={currentImageSrc}
            alt={imagePreview ? 'New image preview' : 'Current image'}
          />
          <p className="form-hint">
            {imagePreview
              ? 'New image — saving will replace the current one.'
              : isEdit
                ? removeImage
                  ? 'Image will be cleared on save.'
                  : editing?.imageUrl
                    ? 'Current image. Pick a file to replace, or check the box above to clear it.'
                    : 'No image set. Pick a file to add one.'
                : 'No image selected — a generic placeholder will be used.'}
          </p>
        </div>
      </div>

      <div className="profile-actions">
        {isEdit ? (
          <button
            type="button"
            className="back-button btn-icon"
            onClick={() => onCancelEdit?.()}
            disabled={isSubmitting}
          >
            <XIcon />
            <span>Cancel</span>
          </button>
        ) : (
          <button
            type="button"
            className="back-button btn-icon"
            onClick={resetCreate}
            disabled={isSubmitting}
          >
            <RotateLeftIcon />
            <span>Reset</span>
          </button>
        )}
        <button
          type="submit"
          className="proceed-payment-button auth-submit profile-save btn-icon"
          disabled={isSubmitting}
        >
          <CheckIcon />
          <span>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save category'}
          </span>
        </button>
      </div>
    </form>
  )
}

// ====================================================================
// Item form (create + edit, with category move on edit)
// ====================================================================
interface ItemFormProps {
  /** Pre-selected category for new items, used as fallback display image. */
  category: CategoryDoc
  /** Existing item being edited (null = create mode). */
  editing?: FoodItemDoc | null
  /** All categories — exposed as a select when editing so admin can move an item. */
  allCategories: CategoryDoc[]
  onSaved: (item: FoodItemDoc, mode: 'create' | 'update') => void
  onCancelEdit?: () => void
}

function ItemForm({
  category,
  editing,
  allCategories,
  onSaved,
  onCancelEdit,
}: ItemFormProps) {
  const isEdit = Boolean(editing)
  const [categoryName, setCategoryName] = useState(editing?.category ?? category.name)
  const [name, setName] = useState(editing?.name ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [price, setPrice] = useState(editing ? String(editing.price) : '2')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const clearLocalImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(null)
    setImagePreview(null)
  }

  const resetCreate = () => {
    setCategoryName(category.name)
    setName('')
    setDescription('')
    setPrice('2')
    clearLocalImage()
    setRemoveImage(false)
    setError(null)
  }

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setError(null)
    clearLocalImage()
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image must be 2MB or smaller')
      e.target.value = ''
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setRemoveImage(false)
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
      const imagePayload = imageFile
        ? { image: imageFile }
        : removeImage
          ? { imageUrl: null }
          : isEdit
            ? {}
            : { imageUrl: null }
      const payload = {
        category: categoryName,
        name: trimmedName,
        description: description.trim(),
        price: priceNum,
        ...imagePayload,
      }
      const saved = isEdit
        ? await foodItemsAPI.update(editing!.id, payload)
        : await foodItemsAPI.create(payload)
      onSaved(saved, isEdit ? 'update' : 'create')
      if (!isEdit) resetCreate()
    } catch (err) {
      setError(axiosErrorMessage(err, isEdit ? 'Could not update item' : 'Could not save the item'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // For the preview, prefer the new file, then editing.imageUrl (unless removed),
  // then the *target* category's image (so moving updates the preview), then generic.
  const targetCategoryImage =
    allCategories.find((c) => c.name === categoryName)?.imageUrl || null
  const currentImageSrc =
    imagePreview ||
    (removeImage
      ? targetCategoryImage || GENERIC_FOOD_IMAGE
      : editing?.imageUrl || targetCategoryImage || GENERIC_FOOD_IMAGE)

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="error-message">{error}</p> : null}

      {isEdit ? (
        <div className="form-group">
          <label htmlFor="item-category">Category</label>
          <select
            id="item-category"
            value={categoryName}
            onChange={(ev) => setCategoryName(ev.target.value)}
            disabled={isSubmitting}
          >
            {allCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.emoji} {c.label || c.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

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
        {isEdit && editing?.imageUrl ? (
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={removeImage}
              onChange={(ev) => {
                setRemoveImage(ev.target.checked)
                if (ev.target.checked) clearLocalImage()
              }}
              disabled={isSubmitting}
            />
            Remove current image (use category default)
          </label>
        ) : null}
        <div className="admin-preview">
          <img
            src={currentImageSrc}
            alt={imagePreview ? 'New image preview' : 'Current image'}
          />
          <p className="form-hint">
            {imagePreview
              ? 'New image — saving will replace the current one.'
              : isEdit
                ? removeImage
                  ? 'Image will be cleared on save.'
                  : editing?.imageUrl
                    ? 'Current image. Pick a file to replace, or check the box above to clear it.'
                    : 'No image set. Pick a file to add one.'
                : 'No image selected — the category image (or default) will be used.'}
          </p>
        </div>
      </div>

      <div className="profile-actions">
        {isEdit ? (
          <button
            type="button"
            className="back-button btn-icon"
            onClick={() => onCancelEdit?.()}
            disabled={isSubmitting}
          >
            <XIcon />
            <span>Cancel</span>
          </button>
        ) : (
          <button
            type="button"
            className="back-button btn-icon"
            onClick={resetCreate}
            disabled={isSubmitting}
          >
            <RotateLeftIcon />
            <span>Reset</span>
          </button>
        )}
        <button
          type="submit"
          className="proceed-payment-button auth-submit profile-save btn-icon"
          disabled={isSubmitting}
        >
          <CheckIcon />
          <span>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save item'}
          </span>
        </button>
      </div>
    </form>
  )
}

// ====================================================================
// Admin page
// ====================================================================
export default function AdminPage() {
  const navigate = useNavigate()
  const { reloadMenu } = useFood()
  const { showToast } = useToast()

  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [items, setItems] = useState<FoodItemDoc[]>([])
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isLoadingCats, setIsLoadingCats] = useState(true)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === selectedCategoryName) ?? null,
    [categories, selectedCategoryName]
  )
  const editingCategory = useMemo(
    () => categories.find((c) => c.id === editingCategoryId) ?? null,
    [categories, editingCategoryId]
  )
  const editingItem = useMemo(
    () => items.find((it) => it.id === editingItemId) ?? null,
    [items, editingItemId]
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
      setEditingItemId(null)
      return
    }
    void loadItems(selectedCategoryName)
    setEditingItemId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryName])

  // -------- Category callbacks --------
  const handleCategorySaved = (saved: CategoryDoc, mode: 'create' | 'update') => {
    setCategories((cur) => {
      const next = mode === 'create' ? [...cur, saved] : cur.map((c) => (c.id === saved.id ? saved : c))
      return next.sort((a, b) => a.name.localeCompare(b.name))
    })
    if (mode === 'create') {
      setSelectedCategoryName(saved.name)
      showToast(`Category "${saved.name}" added`, 'success')
    } else {
      // If we renamed, update the selection so the tab stays on this category.
      setSelectedCategoryName((prev) =>
        prev === editingCategory?.name ? saved.name : prev
      )
      setEditingCategoryId(null)
      showToast(`Category "${saved.name}" updated`, 'success')
      if (selectedCategoryName) void loadItems(selectedCategoryName)
    }
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
      if (editingCategoryId === cat.id) setEditingCategoryId(null)
      showToast(
        `Deleted "${cat.name}"${res.itemsDeleted ? ` and ${res.itemsDeleted} item(s)` : ''}`,
        'success'
      )
      void reloadMenu()
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not delete category'), 'error')
    }
  }

  // -------- Item callbacks --------
  const handleItemSaved = (saved: FoodItemDoc, mode: 'create' | 'update') => {
    setItems((cur) => {
      if (mode === 'create') {
        return [...cur, saved].sort((a, b) => a.name.localeCompare(b.name))
      }
      // On update, an item may have been moved to a different category. If so,
      // drop it from the current list; otherwise replace in-place.
      if (selectedCategoryName && saved.category !== selectedCategoryName) {
        return cur.filter((it) => it.id !== saved.id)
      }
      return cur.map((it) => (it.id === saved.id ? saved : it))
    })
    if (mode === 'update') {
      setEditingItemId(null)
      showToast(`Updated "${saved.name}"`, 'success')
    } else {
      showToast(`Added "${saved.name}"`, 'success')
    }
    void reloadMenu()
  }

  const handleDeleteItem = async (item: FoodItemDoc) => {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) return
    try {
      await foodItemsAPI.remove(item.id)
      setItems((cur) => cur.filter((it) => it.id !== item.id))
      if (editingItemId === item.id) setEditingItemId(null)
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
            Create or edit categories, then add and edit items in each one. Images are optional.
          </p>
        </div>
      </section>

      <section className="panel">
        <AdminNav />
      </section>

      {loadError ? (
        <section className="panel">
          <p className="error-message">{loadError}</p>
        </section>
      ) : null}

      {/* ---- Step 1: Categories ---- */}
      <section className="admin-grid">
        <div className="admin-grid__form">
          <div className="auth-card admin-card">
            <h2 className="profile-heading">
              {editingCategory ? `Edit category: ${editingCategory.name}` : 'Add a category'}
            </h2>
            <CategoryForm
              key={editingCategory?.id ?? 'new-category'}
              editing={editingCategory}
              onSaved={handleCategorySaved}
              onCancelEdit={() => setEditingCategoryId(null)}
            />
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
                    } ${cat.id === editingCategoryId ? 'admin-item--editing' : ''}`}
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
                    <div className="admin-item__actions admin-item__actions--stack">
                      <button
                        type="button"
                        className="back-button admin-item__edit icon-only"
                        onClick={() => setEditingCategoryId(cat.id)}
                        aria-label={`Edit ${cat.label || cat.name}`}
                        title="Edit category"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        className="back-button admin-item__delete icon-only"
                        onClick={() => handleDeleteCategory(cat)}
                        aria-label={`Delete ${cat.label || cat.name}`}
                        title="Delete category"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ---- Step 2: Items ---- */}
      <section className="panel">
        <h2 className="admin-section-title">Items</h2>
        {categories.length === 0 ? (
          <p className="empty-state">Create a category first to add items.</p>
        ) : (
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
        )}
      </section>

      {selectedCategory ? (
        <section className="admin-grid">
          <div className="admin-grid__form">
            <div className="auth-card admin-card">
              <h2 className="profile-heading">
                {editingItem
                  ? `Edit item: ${editingItem.name}`
                  : `Add an item to ${selectedCategory.label || selectedCategory.name}`}
              </h2>
              <ItemForm
                key={editingItem?.id ?? `new-item-${selectedCategory.id}`}
                category={selectedCategory}
                editing={editingItem}
                allCategories={categories}
                onSaved={handleItemSaved}
                onCancelEdit={() => setEditingItemId(null)}
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
                    <li
                      key={item.id}
                      className={`admin-item ${
                        item.id === editingItemId ? 'admin-item--editing' : ''
                      }`}
                    >
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
                      <div className="admin-item__actions admin-item__actions--stack">
                        <button
                          type="button"
                          className="back-button admin-item__edit icon-only"
                          onClick={() => setEditingItemId(item.id)}
                          aria-label={`Edit ${item.name}`}
                          title="Edit item"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="back-button admin-item__delete icon-only"
                          onClick={() => handleDeleteItem(item)}
                          aria-label={`Delete ${item.name}`}
                          title="Delete item"
                        >
                          <TrashIcon />
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
        <button
          type="button"
          className="back-button btn-icon"
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon />
          <span>Back to menu</span>
        </button>
      </section>
    </main>
  )
}

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AdminNav } from '../components/AdminNav'
import { AppHeaderApp } from '../components/AppHeader'
import {
  CheckIcon,
  ChevronLeftIcon,
  EditIcon,
  PlusIcon,
  RotateLeftIcon,
  TrashIcon,
  XIcon,
} from '../components/Icons'
import {
  ImagePicker,
  buildImagePayload,
  imagePickerFromExisting,
  type ImagePickerValue,
} from '../components/ImagePicker'
import { GENERIC_FOOD_IMAGE } from '../constants/categories'
import { useFood } from '../hooks/useFood'
import {
  categoriesAPI,
  foodItemsAPI,
  type CategoryDoc,
  type FoodItemDoc,
} from '../services/api'
import { useToast } from '../state/ToastContext'

const CATEGORY_EMOJI_PRESETS = [
  '🍽️',
  '🍛',
  '🍕',
  '🍔',
  '🥤',
  '🍰',
  '🍗',
  '🥗',
  '🍜',
  '🧁',
  '☕',
  '🍩',
  '🍦',
  '🍱',
  '🥘',
  '🍣',
]

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

// ====================================================================
// Category form
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
  const [emoji, setEmoji] = useState(editing?.emoji ?? '🍽️')
  const [accent, setAccent] = useState(editing?.accent ?? '#6b5ef7')
  const [imagePicker, setImagePicker] = useState<ImagePickerValue>(() =>
    imagePickerFromExisting(editing?.imageUrl, GENERIC_FOOD_IMAGE)
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetCreate = () => {
    setName('')
    setLabel('')
    setEmoji('🍽️')
    setAccent('#6b5ef7')
    setImagePicker({ source: 'none', previewUrl: null, galleryId: null })
    setImageFile(null)
    setRemoveImage(false)
    setError(null)
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
      const imagePayload = buildImagePayload(imagePicker, imageFile, removeImage, isEdit)
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
      setError(
        axiosErrorMessage(err, isEdit ? 'Could not update category' : 'Could not create category')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="error-message admin-form__error">{error}</p> : null}

      <div className="admin-form__row">
        <div className="form-group">
          <label htmlFor="cat-name">Category name *</label>
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
          <label htmlFor="cat-label">Display label</label>
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
      </div>

      <div className="admin-form__row admin-form__row--narrow">
        <div className="form-group">
          <label htmlFor="cat-emoji">Icon (emoji)</label>
          <div className="emoji-input-wrap">
            <input
              id="cat-emoji"
              type="text"
              value={emoji}
              onChange={(ev) => setEmoji(ev.target.value)}
              disabled={isSubmitting}
              maxLength={8}
              placeholder="🍽️"
              className="emoji-input"
            />
            <div className="emoji-chips" role="group" aria-label="Quick pick emoji">
              {CATEGORY_EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-chips__btn ${emoji === e ? 'emoji-chips__btn--active' : ''}`}
                  onClick={() => setEmoji(e)}
                  disabled={isSubmitting}
                  title={`Use ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="form-group form-group--narrow">
          <label htmlFor="cat-accent">Accent</label>
          <input
            id="cat-accent"
            type="color"
            value={accent}
            onChange={(ev) => setAccent(ev.target.value)}
            disabled={isSubmitting}
            className="accent-input"
          />
        </div>
      </div>

      <div className="form-group admin-form__image">
        <label className="admin-form__image-label">Category image</label>
        <p className="form-hint admin-form__image-hint">
          Pick a relevant picture from the gallery, upload your own, or leave it
          for the default placeholder. The picture shows on the home hero and
          category tabs.
        </p>
        <ImagePicker
          idPrefix="cat"
          mode="category"
          relevanceHint={`${name} ${label}`}
          value={imagePicker}
          onChange={setImagePicker}
          disabled={isSubmitting}
          allowRemove={isEdit && Boolean(editing?.imageUrl)}
          removeChecked={removeImage}
          onRemoveChange={setRemoveImage}
          onFileSelected={setImageFile}
          onValidationError={(msg) => msg && setError(msg)}
          fallbackPreviewUrl={GENERIC_FOOD_IMAGE}
        />
      </div>

      <div className="admin-form__actions">
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
          <span>{isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save category'}</span>
        </button>
      </div>
    </form>
  )
}

// ====================================================================
// Item form
// ====================================================================
interface ItemFormProps {
  category: CategoryDoc
  editing?: FoodItemDoc | null
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
  const targetCategoryImage =
    allCategories.find((c) => c.name === (editing?.category ?? category.name))?.imageUrl ||
    category.imageUrl ||
    null
  const [imagePicker, setImagePicker] = useState<ImagePickerValue>(() =>
    imagePickerFromExisting(editing?.imageUrl, targetCategoryImage || GENERIC_FOOD_IMAGE)
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const itemFallbackPreview =
    allCategories.find((c) => c.name === categoryName)?.imageUrl || GENERIC_FOOD_IMAGE

  const resetCreate = () => {
    setCategoryName(category.name)
    setName('')
    setDescription('')
    setPrice('2')
    setImagePicker({ source: 'none', previewUrl: null, galleryId: null })
    setImageFile(null)
    setRemoveImage(false)
    setError(null)
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
      const imagePayload = buildImagePayload(imagePicker, imageFile, removeImage, isEdit)
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

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="error-message admin-form__error">{error}</p> : null}

      <div className="admin-form__row">
        <div className="form-group">
          <label htmlFor="item-name">Title *</label>
          <input
            id="item-name"
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            disabled={isSubmitting}
            required
            maxLength={120}
            placeholder="e.g. Chicken Biryani"
          />
        </div>
        <div className="form-group form-group--narrow">
          <label htmlFor="item-price">Price (₹) *</label>
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
      </div>

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
          <p className="form-hint">Move this item to a different category if needed.</p>
        </div>
      ) : null}

      <div className="form-group">
        <label htmlFor="item-desc">Description</label>
        <textarea
          id="item-desc"
          rows={3}
          value={description}
          onChange={(ev) => setDescription(ev.target.value)}
          disabled={isSubmitting}
          maxLength={500}
          placeholder="Short description shown on the menu card"
        />
      </div>

      <div className="form-group admin-form__image">
        <label className="admin-form__image-label">Item image</label>
        <p className="form-hint admin-form__image-hint">
          Pick a relevant picture from the gallery (matched against the item
          title) or upload your own. If you don't set one, the category image is
          used as a fallback.
        </p>
        <ImagePicker
          idPrefix="item"
          mode="item"
          relevanceHint={`${categoryName} ${name}`}
          value={imagePicker}
          onChange={setImagePicker}
          disabled={isSubmitting}
          allowRemove={isEdit && Boolean(editing?.imageUrl)}
          removeChecked={removeImage}
          onRemoveChange={setRemoveImage}
          onFileSelected={setImageFile}
          onValidationError={(msg) => msg && setError(msg)}
          fallbackPreviewUrl={itemFallbackPreview}
        />
      </div>

      <div className="admin-form__actions">
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
          <span>{isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save item'}</span>
        </button>
      </div>
    </form>
  )
}

// ====================================================================
// Admin page
// ====================================================================
type AdminTab = 'categories' | 'items'

export default function AdminPage() {
  const navigate = useNavigate()
  const { reloadMenu } = useFood()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<AdminTab>('categories')
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [items, setItems] = useState<FoodItemDoc[]>([])
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
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
    setShowItemForm(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryName])

  // -------- Category callbacks --------
  const handleCategorySaved = (saved: CategoryDoc, mode: 'create' | 'update') => {
    setCategories((cur) => {
      const next =
        mode === 'create' ? [...cur, saved] : cur.map((c) => (c.id === saved.id ? saved : c))
      return next.sort((a, b) => a.name.localeCompare(b.name))
    })
    if (mode === 'create') {
      setSelectedCategoryName(saved.name)
      setShowCategoryForm(false)
      showToast(`Category "${saved.name}" added`, 'success')
    } else {
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
      if (selectedCategoryName && saved.category !== selectedCategoryName) {
        return cur.filter((it) => it.id !== saved.id)
      }
      return cur.map((it) => (it.id === saved.id ? saved : it))
    })
    if (mode === 'update') {
      setEditingItemId(null)
      showToast(`Updated "${saved.name}"`, 'success')
    } else {
      setShowItemForm(false)
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

  const showCatEditor = showCategoryForm || Boolean(editingCategory)
  const showItemEditor = showItemForm || Boolean(editingItem)

  return (
    <main className="app-shell admin-shell">
      <AppHeaderApp />

      {/* Compact header — no big hero image */}
      <section className="admin-header">
        <div className="admin-header__content">
          <p className="admin-header__kicker">Administration</p>
          <h1 className="admin-header__title">Menu &amp; categories</h1>
          <p className="admin-header__subtitle">
            Add or edit categories and the items underneath them. Pick a picture
            from the gallery or upload your own.
          </p>
        </div>
        <div className="admin-header__stats">
          <div className="admin-stat">
            <span className="admin-stat__value">{categories.length}</span>
            <span className="admin-stat__label">Categories</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__value">{items.length}</span>
            <span className="admin-stat__label">
              Items in {selectedCategory ? selectedCategory.label || selectedCategory.name : '—'}
            </span>
          </div>
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

      {/* Top-level tabs: Categories | Items */}
      <section className="panel admin-tabs-panel">
        <div className="admin-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'categories'}
            className={`admin-tab ${activeTab === 'categories' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <span className="admin-tab__num">1</span>
            <span className="admin-tab__label">Categories</span>
            <span className="admin-tab__count">{categories.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'items'}
            className={`admin-tab ${activeTab === 'items' ? 'admin-tab--active' : ''}`}
            onClick={() => setActiveTab('items')}
            disabled={categories.length === 0}
            title={categories.length === 0 ? 'Create a category first' : ''}
          >
            <span className="admin-tab__num">2</span>
            <span className="admin-tab__label">Items</span>
            <span className="admin-tab__count">{sortedItems.length}</span>
          </button>
        </div>
      </section>

      {/* ======= Categories tab ======= */}
      {activeTab === 'categories' ? (
        <section className="panel admin-stack">
          <div className="admin-toolbar">
            <h2 className="admin-section-title">Categories</h2>
            <button
              type="button"
              className="proceed-payment-button btn-icon admin-toolbar__add"
              onClick={() => {
                setEditingCategoryId(null)
                setShowCategoryForm(true)
              }}
            >
              <PlusIcon />
              <span>Add category</span>
            </button>
          </div>

          {showCatEditor ? (
            <div className="auth-card admin-card admin-card--editor">
              <div className="admin-card__header">
                <h3 className="admin-card__title">
                  {editingCategory
                    ? `Edit category — ${editingCategory.name}`
                    : 'Add a new category'}
                </h3>
                <button
                  type="button"
                  className="back-button icon-only admin-card__close"
                  onClick={() => {
                    setEditingCategoryId(null)
                    setShowCategoryForm(false)
                  }}
                  aria-label="Close editor"
                  title="Close editor"
                >
                  <XIcon />
                </button>
              </div>
              <CategoryForm
                key={editingCategory?.id ?? 'new-category'}
                editing={editingCategory}
                onSaved={handleCategorySaved}
                onCancelEdit={() => {
                  setEditingCategoryId(null)
                  setShowCategoryForm(false)
                }}
              />
            </div>
          ) : null}

          <div className="auth-card admin-card">
            <div className="admin-list__header">
              <h3 className="profile-heading">Existing categories</h3>
              <span className="admin-list__count">{categories.length}</span>
            </div>

            {isLoadingCats ? (
              <p className="empty-state">Loading…</p>
            ) : categories.length === 0 ? (
              <div className="admin-empty">
                <p className="admin-empty__title">No categories yet</p>
                <p className="admin-empty__hint">
                  Use <strong>Add category</strong> above to create your first one — pick a
                  name, an emoji icon, and a picture for the home page hero.
                </p>
              </div>
            ) : (
              <ul className="admin-cards">
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className={`admin-card-tile ${
                      cat.id === editingCategoryId ? 'admin-card-tile--editing' : ''
                    }`}
                  >
                    <div
                      className="admin-card-tile__thumb"
                      style={{
                        backgroundImage: `url("${cat.imageUrl || GENERIC_FOOD_IMAGE}")`,
                      }}
                      aria-hidden="true"
                    />
                    <div className="admin-card-tile__body">
                      <h4 className="admin-card-tile__title">
                        <span className="admin-card-tile__emoji">{cat.emoji}</span>
                        {cat.label || cat.name}
                      </h4>
                      <p className="admin-card-tile__meta">
                        <code>{cat.name}</code>
                      </p>
                      <div className="admin-card-tile__actions">
                        <button
                          type="button"
                          className="back-button btn-icon admin-card-tile__btn"
                          onClick={() => {
                            setSelectedCategoryName(cat.name)
                            setActiveTab('items')
                          }}
                          title="Manage items in this category"
                        >
                          <span>Manage items →</span>
                        </button>
                        <button
                          type="button"
                          className="back-button icon-only admin-card-tile__edit"
                          onClick={() => {
                            setEditingCategoryId(cat.id)
                            setShowCategoryForm(false)
                          }}
                          aria-label={`Edit ${cat.label || cat.name}`}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="back-button icon-only admin-card-tile__delete"
                          onClick={() => handleDeleteCategory(cat)}
                          aria-label={`Delete ${cat.label || cat.name}`}
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      {/* ======= Items tab ======= */}
      {activeTab === 'items' ? (
        <section className="panel admin-stack">
          {categories.length === 0 ? (
            <p className="empty-state">Create a category first to add items.</p>
          ) : (
            <>
              <div className="admin-toolbar admin-toolbar--items">
                <div className="admin-category-pick">
                  <label htmlFor="admin-cat-pick">Category</label>
                  <select
                    id="admin-cat-pick"
                    value={selectedCategoryName ?? ''}
                    onChange={(ev) => setSelectedCategoryName(ev.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.emoji} {c.label || c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!showItemEditor && selectedCategory ? (
                  <button
                    type="button"
                    className="proceed-payment-button btn-icon admin-toolbar__add"
                    onClick={() => {
                      setEditingItemId(null)
                      setShowItemForm(true)
                    }}
                  >
                    <PlusIcon />
                    <span>Add item</span>
                  </button>
                ) : null}
              </div>

              {selectedCategory ? (
                <>
                  {showItemEditor ? (
                    <div className="auth-card admin-card admin-card--editor">
                      <div className="admin-card__header">
                        <h3 className="admin-card__title">
                          {editingItem
                            ? `Edit item — ${editingItem.name}`
                            : `Add an item to ${selectedCategory.label || selectedCategory.name}`}
                        </h3>
                        <button
                          type="button"
                          className="back-button icon-only admin-card__close"
                          onClick={() => {
                            setEditingItemId(null)
                            setShowItemForm(false)
                          }}
                          aria-label="Close editor"
                          title="Close editor"
                        >
                          <XIcon />
                        </button>
                      </div>
                      <ItemForm
                        key={editingItem?.id ?? `new-item-${selectedCategory.id}`}
                        category={selectedCategory}
                        editing={editingItem}
                        allCategories={categories}
                        onSaved={handleItemSaved}
                        onCancelEdit={() => {
                          setEditingItemId(null)
                          setShowItemForm(false)
                        }}
                      />
                    </div>
                  ) : null}

                  <div className="auth-card admin-card">
                    <div className="admin-list__header">
                      <h3 className="profile-heading">
                        {selectedCategory.label || selectedCategory.name} items
                      </h3>
                      <span className="admin-list__count">{sortedItems.length}</span>
                    </div>

                    {isLoadingItems ? (
                      <p className="empty-state">Loading…</p>
                    ) : sortedItems.length === 0 ? (
                      <div className="admin-empty">
                        <p className="admin-empty__title">No items in this category</p>
                        <p className="admin-empty__hint">
                          Add the first dish — set a title, price, and a picture.
                        </p>
                        <button
                          type="button"
                          className="proceed-payment-button btn-icon"
                          onClick={() => setShowItemForm(true)}
                        >
                          <PlusIcon />
                          <span>Add the first item</span>
                        </button>
                      </div>
                    ) : (
                      <ul className="admin-cards">
                        {sortedItems.map((item) => (
                          <li
                            key={item.id}
                            className={`admin-card-tile ${
                              item.id === editingItemId ? 'admin-card-tile--editing' : ''
                            }`}
                          >
                            <div
                              className="admin-card-tile__thumb"
                              style={{
                                backgroundImage: `url("${
                                  item.imageUrl ||
                                  selectedCategory.imageUrl ||
                                  GENERIC_FOOD_IMAGE
                                }")`,
                              }}
                              aria-hidden="true"
                            />
                            <div className="admin-card-tile__body">
                              <h4 className="admin-card-tile__title">{item.name}</h4>
                              <p className="admin-card-tile__meta">
                                ₹{item.price}
                                <span className="admin-card-tile__dot">·</span>
                                {item.imageUrl ? 'custom image' : 'default image'}
                              </p>
                              {item.description ? (
                                <p className="admin-card-tile__desc">{item.description}</p>
                              ) : null}
                              <div className="admin-card-tile__actions">
                                <button
                                  type="button"
                                  className="back-button icon-only admin-card-tile__edit"
                                  onClick={() => {
                                    setEditingItemId(item.id)
                                    setShowItemForm(false)
                                  }}
                                  aria-label={`Edit ${item.name}`}
                                  title="Edit"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  type="button"
                                  className="back-button icon-only admin-card-tile__delete"
                                  onClick={() => handleDeleteItem(item)}
                                  aria-label={`Delete ${item.name}`}
                                  title="Delete"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      <section className="panel admin-footer-actions">
        <button type="button" className="back-button btn-icon" onClick={() => navigate('/')}>
          <ChevronLeftIcon />
          <span>Exit Admin</span>
        </button>
      </section>
    </main>
  )
}

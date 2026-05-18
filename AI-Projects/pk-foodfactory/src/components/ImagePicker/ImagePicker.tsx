import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { CheckIcon, RotateLeftIcon } from '../Icons'
import {
  CATALOG_GROUPS,
  findCatalogEntryByUrl,
  getCatalogForContext,
  type ImageCatalogGroup,
} from '../../constants/imageCatalog'
import { GENERIC_FOOD_IMAGE } from '../../constants/categories'

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export type ImagePickerSource = 'none' | 'gallery' | 'upload' | 'existing'

export interface ImagePickerValue {
  source: ImagePickerSource
  previewUrl: string | null
  galleryId: string | null
}

export interface ImagePickerProps {
  idPrefix: string
  value: ImagePickerValue
  onChange: (next: ImagePickerValue) => void
  mode: 'category' | 'item'
  relevanceHint?: string
  disabled?: boolean
  allowRemove?: boolean
  removeChecked?: boolean
  onRemoveChange?: (checked: boolean) => void
  onFileSelected?: (file: File | null) => void
  onValidationError?: (message: string) => void
  fallbackPreviewUrl?: string
}

type TabId = 'gallery' | 'upload'

export function imagePickerFromExisting(
  imageUrl: string | null | undefined,
  _fallback: string
): ImagePickerValue {
  if (!imageUrl) {
    return { source: 'none', previewUrl: null, galleryId: null }
  }
  const catalogEntry = findCatalogEntryByUrl(imageUrl)
  if (catalogEntry) {
    return {
      source: 'gallery',
      previewUrl: catalogEntry.url,
      galleryId: catalogEntry.id,
    }
  }
  return { source: 'existing', previewUrl: imageUrl, galleryId: null }
}

export function buildImagePayload(
  picker: ImagePickerValue,
  imageFile: File | null,
  removeImage: boolean,
  isEdit: boolean
): { image?: File; imageUrl?: string | null } | Record<string, never> {
  if (picker.source === 'upload' && imageFile) {
    return { image: imageFile }
  }
  if (picker.source === 'gallery' && picker.previewUrl) {
    return { imageUrl: picker.previewUrl }
  }
  if (removeImage || picker.source === 'none') {
    return { imageUrl: null }
  }
  if (isEdit) {
    return {}
  }
  return { imageUrl: null }
}

/** <img> with graceful fallback to a safe placeholder if the URL fails to load. */
function SafeImage({
  src,
  alt,
  className,
  width,
  height,
  loading,
  fallback,
}: {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  fallback: string
}) {
  const [current, setCurrent] = useState(src)
  useEffect(() => setCurrent(src), [src])
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={() => {
        if (current !== fallback) setCurrent(fallback)
      }}
    />
  )
}

export function ImagePicker({
  idPrefix,
  value,
  onChange,
  mode,
  relevanceHint = '',
  disabled = false,
  allowRemove = false,
  removeChecked = false,
  onRemoveChange,
  onFileSelected,
  onValidationError,
  fallbackPreviewUrl = GENERIC_FOOD_IMAGE,
}: ImagePickerProps) {
  const [tab, setTab] = useState<TabId>('gallery')
  const [searchQuery, setSearchQuery] = useState('')
  const [groupFilter, setGroupFilter] = useState<ImageCatalogGroup | 'all'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const catalogEntries = useMemo(
    () =>
      getCatalogForContext({
        mode,
        searchText: relevanceHint,
        query: searchQuery,
        groupFilter,
      }),
    [mode, relevanceHint, searchQuery, groupFilter]
  )

  const previewSrc = removeChecked
    ? fallbackPreviewUrl
    : value.previewUrl || fallbackPreviewUrl

  const selectGallery = useCallback(
    (entry: { id: string; url: string }) => {
      if (disabled || removeChecked) return
      onFileSelected?.(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      onChange({
        source: 'gallery',
        previewUrl: entry.url,
        galleryId: entry.id,
      })
      onRemoveChange?.(false)
    },
    [disabled, removeChecked, onFileSelected, onChange, onRemoveChange]
  )

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      onValidationError?.('Image must be 2MB or smaller')
      e.target.value = ''
      return
    }
    onValidationError?.('')
    const objectUrl = URL.createObjectURL(file)
    onChange({
      source: 'upload',
      previewUrl: objectUrl,
      galleryId: null,
    })
    onFileSelected?.(file)
    onRemoveChange?.(false)
  }

  useEffect(() => {
    if (value.source !== 'upload' || !value.previewUrl?.startsWith('blob:')) return
    const url = value.previewUrl
    return () => URL.revokeObjectURL(url)
  }, [value.source, value.previewUrl])

  const clearSelection = () => {
    onChange({ source: 'none', previewUrl: null, galleryId: null })
    onFileSelected?.(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onRemoveChange?.(false)
  }

  const sourceBadge: { label: string; tone: 'gallery' | 'upload' | 'existing' | 'none' } =
    removeChecked
      ? { label: 'Will use default', tone: 'none' }
      : value.source === 'upload'
        ? { label: 'Custom upload', tone: 'upload' }
        : value.source === 'gallery'
          ? { label: 'From gallery', tone: 'gallery' }
          : value.source === 'existing'
            ? { label: 'Current image', tone: 'existing' }
            : { label: 'No image yet', tone: 'none' }

  return (
    <div className="image-picker">
      {/* ---- Preview card (always visible at top) ---- */}
      <div className="image-picker__preview-card" aria-live="polite">
        <SafeImage
          src={previewSrc}
          alt="Selected image preview"
          className="image-picker__preview-img"
          fallback={fallbackPreviewUrl}
        />
        <div className="image-picker__preview-meta">
          <span
            className={`image-picker__badge image-picker__badge--${sourceBadge.tone}`}
          >
            {sourceBadge.label}
          </span>
          {value.source !== 'none' && !removeChecked ? (
            <button
              type="button"
              className="image-picker__clear"
              onClick={clearSelection}
              disabled={disabled}
              title="Clear selection"
            >
              <RotateLeftIcon size={12} />
              <span>Clear</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* ---- Tabs ---- */}
      <div className="image-picker__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          id={`${idPrefix}-tab-gallery`}
          aria-selected={tab === 'gallery'}
          className={`image-picker__tab ${tab === 'gallery' ? 'image-picker__tab--active' : ''}`}
          onClick={() => setTab('gallery')}
          disabled={disabled}
        >
          <span className="image-picker__tab-num">1</span>
          <span>Pick from gallery</span>
        </button>
        <button
          type="button"
          role="tab"
          id={`${idPrefix}-tab-upload`}
          aria-selected={tab === 'upload'}
          className={`image-picker__tab ${tab === 'upload' ? 'image-picker__tab--active' : ''}`}
          onClick={() => setTab('upload')}
          disabled={disabled}
        >
          <span className="image-picker__tab-num">2</span>
          <span>Upload your own</span>
        </button>
      </div>

      {/* ---- Gallery panel ---- */}
      {tab === 'gallery' ? (
        <div
          className="image-picker__panel"
          role="tabpanel"
          aria-labelledby={`${idPrefix}-tab-gallery`}
        >
          <input
            type="search"
            className="image-picker__search"
            placeholder="Search images (e.g. biryani, pizza, drinks)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled || removeChecked}
            aria-label="Search gallery"
          />
          <div className="image-picker__group-chips">
            <button
              type="button"
              className={`image-picker__chip ${groupFilter === 'all' ? 'image-picker__chip--active' : ''}`}
              onClick={() => setGroupFilter('all')}
              disabled={disabled || removeChecked}
            >
              All
            </button>
            {CATALOG_GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`image-picker__chip ${groupFilter === g.id ? 'image-picker__chip--active' : ''}`}
                onClick={() => setGroupFilter(g.id)}
                disabled={disabled || removeChecked}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div className="image-picker__grid" role="listbox" aria-label="Image gallery">
            {catalogEntries.map((entry) => {
              const selected = value.galleryId === entry.id
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`image-picker__thumb ${selected ? 'image-picker__thumb--selected' : ''}`}
                  onClick={() => selectGallery(entry)}
                  disabled={disabled || removeChecked}
                  title={entry.label}
                >
                  <SafeImage
                    src={entry.url}
                    alt={entry.label}
                    loading="lazy"
                    fallback={fallbackPreviewUrl}
                  />
                  <span className="image-picker__thumb-label">{entry.label}</span>
                  {selected ? (
                    <span className="image-picker__thumb-check" aria-hidden="true">
                      <CheckIcon size={14} />
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          {catalogEntries.length === 0 ? (
            <p className="form-hint">
              No images match your search. Try another keyword or pick "All".
            </p>
          ) : null}
        </div>
      ) : (
        <div
          className="image-picker__panel"
          role="tabpanel"
          aria-labelledby={`${idPrefix}-tab-upload`}
        >
          <label htmlFor={`${idPrefix}-file`} className="image-picker__upload-label">
            Choose an image file
          </label>
          <input
            ref={fileInputRef}
            id={`${idPrefix}-file`}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={onFileChange}
            disabled={disabled || removeChecked}
          />
          <p className="form-hint">
            PNG, JPEG, WebP, or GIF — up to 2MB. Your upload overrides any gallery
            choice and is saved with the {mode}.
          </p>
        </div>
      )}

      {/* ---- Remove toggle (edit only) ---- */}
      {allowRemove ? (
        <label className="checkbox-inline image-picker__remove">
          <input
            type="checkbox"
            checked={removeChecked}
            onChange={(ev) => {
              const checked = ev.target.checked
              onRemoveChange?.(checked)
              if (checked) {
                onChange({ source: 'none', previewUrl: null, galleryId: null })
                onFileSelected?.(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }
            }}
            disabled={disabled}
          />
          Remove current image (use default placeholder)
        </label>
      ) : null}
    </div>
  )
}

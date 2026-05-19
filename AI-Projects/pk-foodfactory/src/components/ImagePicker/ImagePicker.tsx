import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { RotateLeftIcon } from '../Icons'

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024

export type ImagePickerSource = 'none' | 'upload' | 'existing'

export interface ImagePickerValue {
  source: ImagePickerSource
  previewUrl: string | null
}

export interface ImagePickerProps {
  idPrefix: string
  value: ImagePickerValue
  onChange: (next: ImagePickerValue) => void
  disabled?: boolean
  allowRemove?: boolean
  removeChecked?: boolean
  onRemoveChange?: (checked: boolean) => void
  onFileSelected?: (file: File | null) => void
  onValidationError?: (message: string) => void
}

export function imagePickerFromExisting(
  imageUrl: string | null | undefined
): ImagePickerValue {
  if (!imageUrl) {
    return { source: 'none', previewUrl: null }
  }
  return { source: 'existing', previewUrl: imageUrl }
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
  if (removeImage || picker.source === 'none') {
    return { imageUrl: null }
  }
  if (isEdit) {
    return {}
  }
  return { imageUrl: null }
}

export function ImagePicker({
  idPrefix,
  value,
  onChange,
  disabled = false,
  allowRemove = false,
  removeChecked = false,
  onRemoveChange,
  onFileSelected,
  onValidationError,
}: ImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewBroken, setPreviewBroken] = useState(false)

  const showPreview = !removeChecked && value.previewUrl && !previewBroken

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      onValidationError?.('Image must be 2MB or smaller')
      e.target.value = ''
      return
    }
    onValidationError?.('')
    setPreviewBroken(false)
    const objectUrl = URL.createObjectURL(file)
    onChange({
      source: 'upload',
      previewUrl: objectUrl,
    })
    onFileSelected?.(file)
    onRemoveChange?.(false)
  }

  useEffect(() => {
    if (value.source !== 'upload' || !value.previewUrl?.startsWith('blob:')) return
    const url = value.previewUrl
    return () => URL.revokeObjectURL(url)
  }, [value.source, value.previewUrl])

  useEffect(() => {
    setPreviewBroken(false)
  }, [value.previewUrl])

  const clearSelection = () => {
    onChange({ source: 'none', previewUrl: null })
    onFileSelected?.(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onRemoveChange?.(false)
    setPreviewBroken(false)
  }

  const sourceBadge: { label: string; tone: 'upload' | 'existing' | 'none' } =
    removeChecked
      ? { label: 'No image', tone: 'none' }
      : value.source === 'upload'
        ? { label: 'Uploaded', tone: 'upload' }
        : value.source === 'existing'
          ? { label: 'Current image', tone: 'existing' }
          : { label: 'No image yet', tone: 'none' }

  const entityLabel = idPrefix.startsWith('cat') ? 'category' : 'item'

  return (
    <div className="image-picker">
      <div className="image-picker__preview-card" aria-live="polite">
        {showPreview ? (
          <img
            src={value.previewUrl!}
            alt="Selected image preview"
            className="image-picker__preview-img"
            onError={() => setPreviewBroken(true)}
          />
        ) : (
          <div className="image-picker__preview-empty" aria-hidden="true">
            <span>No image selected</span>
          </div>
        )}
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

      <div className="image-picker__panel">
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
          PNG, JPEG, WebP, or GIF — up to 2MB. Upload is optional; leave empty if
          you do not want an image on this {entityLabel}.
        </p>
      </div>

      {allowRemove ? (
        <label className="checkbox-inline image-picker__remove">
          <input
            type="checkbox"
            checked={removeChecked}
            onChange={(ev) => {
              const checked = ev.target.checked
              onRemoveChange?.(checked)
              if (checked) {
                onChange({ source: 'none', previewUrl: null })
                onFileSelected?.(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }
            }}
            disabled={disabled}
          />
          Remove current image
        </label>
      ) : null}
    </div>
  )
}

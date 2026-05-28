import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AgentAvatar } from '../components/AgentAvatar'
import { AdminNav } from '../components/AdminNav'
import { AppHeaderApp } from '../components/AppHeader'
import {
  CheckIcon,
  ChevronLeftIcon,
  EditIcon,
  PauseIcon,
  PlayIcon,
  RotateLeftIcon,
  TrashIcon,
  XIcon,
} from '../components/Icons'
import { PhoneInput } from '../components/PhoneInput'
import {
  deliveryAgentsAPI,
  type DeliveryAgentDoc,
  type DeliveryAgentStatus,
  type DeliveryVehicleType,
} from '../services/api'
import { useToast } from '../state/ToastContext'
import { formatPhoneForApi, toLocalPhoneDigits } from '../utils/phoneCountry'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const VEHICLE_TYPES: DeliveryVehicleType[] = ['Bike', 'Scooter', 'Bicycle', 'Car', 'Other']
const STATUSES: DeliveryAgentStatus[] = ['active', 'inactive']

function axiosErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const msg = (err.response?.data as { error?: string })?.error
    if (msg) return msg
  }
  return fallback
}

// ====================================================================
// Agent form (create + edit)
// ====================================================================
interface AgentFormProps {
  editing?: DeliveryAgentDoc | null
  onSaved: (agent: DeliveryAgentDoc, mode: 'create' | 'update') => void
  onCancelEdit?: () => void
}

function AgentForm({ editing, onSaved, onCancelEdit }: AgentFormProps) {
  const isEdit = Boolean(editing)
  const [name, setName] = useState(editing?.name ?? '')
  const [phone, setPhone] = useState(() => toLocalPhoneDigits(editing?.phone))
  const [email, setEmail] = useState(editing?.email ?? '')
  const [vehicleType, setVehicleType] = useState<DeliveryVehicleType>(
    editing?.vehicleType ?? 'Bike'
  )
  const [vehicleNumber, setVehicleNumber] = useState(editing?.vehicleNumber ?? '')
  const [licenseNumber, setLicenseNumber] = useState(editing?.licenseNumber ?? '')
  const [address, setAddress] = useState(editing?.address ?? '')
  const [notes, setNotes] = useState(editing?.notes ?? '')
  const [status, setStatus] = useState<DeliveryAgentStatus>(editing?.status ?? 'active')
  const [passcode, setPasscode] = useState('')
  const [clearPasscode, setClearPasscode] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  const clearLocalPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const resetCreate = () => {
    setName('')
    setPhone('')
    setEmail('')
    setVehicleType('Bike')
    setVehicleNumber('')
    setLicenseNumber('')
    setAddress('')
    setNotes('')
    setStatus('active')
    setPasscode('')
    setClearPasscode(false)
    clearLocalPhoto()
    setRemovePhoto(false)
    setError(null)
  }

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setError(null)
    clearLocalPhoto()
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Photo must be 2MB or smaller')
      e.target.value = ''
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setRemovePhoto(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }
    const trimmedPhone = formatPhoneForApi(phone)
    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setError('Enter a valid 10-digit mobile number (+91)')
      return
    }

    const trimmedPasscode = passcode.trim()
    if (trimmedPasscode && !/^\d{4,8}$/.test(trimmedPasscode)) {
      setError('Passcode must be 4 to 8 digits')
      return
    }

    setIsSubmitting(true)
    try {
      const photoPayload = photoFile
        ? { photo: photoFile }
        : removePhoto
          ? { photoUrl: null as string | null }
          : isEdit
            ? {}
            : { photoUrl: null as string | null }

      const passcodePayload: { passcode?: string } = {}
      if (trimmedPasscode) passcodePayload.passcode = trimmedPasscode
      else if (clearPasscode) passcodePayload.passcode = ''

      const payload = {
        name: trimmedName,
        phone: trimmedPhone,
        email: email.trim(),
        vehicleType,
        vehicleNumber: vehicleNumber.trim(),
        licenseNumber: licenseNumber.trim(),
        address: address.trim(),
        notes: notes.trim(),
        status,
        ...passcodePayload,
        ...photoPayload,
      }
      const saved = isEdit
        ? await deliveryAgentsAPI.update(editing!.id, payload)
        : await deliveryAgentsAPI.create(payload)
      onSaved(saved, isEdit ? 'update' : 'create')
      if (!isEdit) resetCreate()
    } catch (err) {
      setError(
        axiosErrorMessage(err, isEdit ? 'Could not update delivery agent' : 'Could not onboard delivery agent')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewPhotoUrl = photoPreview
    ? photoPreview
    : removePhoto
      ? null
      : editing?.photoUrl ?? null

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error ? <p className="error-message">{error}</p> : null}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="da-name">Full name</label>
          <input
            id="da-name"
            type="text"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            disabled={isSubmitting}
            required
            maxLength={120}
          />
        </div>
        <PhoneInput
          id="da-phone"
          label="Phone"
          value={phone}
          onChange={setPhone}
          disabled={isSubmitting}
          placeholder="10-digit mobile"
        />
      </div>

      <div className="form-group">
        <label htmlFor="da-email">Email (optional)</label>
        <input
          id="da-email"
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          disabled={isSubmitting}
          maxLength={120}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="da-vehicle">Vehicle type</label>
          <select
            id="da-vehicle"
            value={vehicleType}
            onChange={(ev) => setVehicleType(ev.target.value as DeliveryVehicleType)}
            disabled={isSubmitting}
          >
            {VEHICLE_TYPES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="da-vnum">Vehicle number</label>
          <input
            id="da-vnum"
            type="text"
            value={vehicleNumber}
            onChange={(ev) => setVehicleNumber(ev.target.value)}
            disabled={isSubmitting}
            maxLength={30}
            placeholder="e.g. KA-01-AB-1234"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="da-license">License number (optional)</label>
          <input
            id="da-license"
            type="text"
            value={licenseNumber}
            onChange={(ev) => setLicenseNumber(ev.target.value)}
            disabled={isSubmitting}
            maxLength={40}
          />
        </div>
        <div className="form-group">
          <label htmlFor="da-status">Status</label>
          <select
            id="da-status"
            value={status}
            onChange={(ev) => setStatus(ev.target.value as DeliveryAgentStatus)}
            disabled={isSubmitting}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'active' ? 'Active' : 'Inactive'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="da-address">Address (optional)</label>
        <textarea
          id="da-address"
          rows={2}
          value={address}
          onChange={(ev) => setAddress(ev.target.value)}
          disabled={isSubmitting}
          maxLength={500}
        />
      </div>

      <div className="form-group">
        <label htmlFor="da-notes">Internal notes (optional)</label>
        <textarea
          id="da-notes"
          rows={2}
          value={notes}
          onChange={(ev) => setNotes(ev.target.value)}
          disabled={isSubmitting}
          maxLength={500}
          placeholder="Shift timings, preferred zone, etc."
        />
      </div>

      <div className="form-group">
        <label htmlFor="da-passcode">
          Login passcode (4–8 digits) {isEdit && editing?.hasPasscode ? '— already set' : ''}
        </label>
        <input
          id="da-passcode"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={passcode}
          onChange={(ev) => {
            setPasscode(ev.target.value.replace(/\D/g, '').slice(0, 8))
            if (ev.target.value) setClearPasscode(false)
          }}
          disabled={isSubmitting || clearPasscode}
          placeholder={isEdit && editing?.hasPasscode ? 'Enter new PIN to replace' : 'e.g. 1234'}
          maxLength={8}
        />
        <p className="form-hint">
          The agent will use their phone + this PIN to sign in at <code>/delivery/login</code>.
          {!isEdit ? ' Leave blank to onboard without sign-in access for now.' : ''}
        </p>
        {isEdit && editing?.hasPasscode ? (
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={clearPasscode}
              onChange={(ev) => {
                setClearPasscode(ev.target.checked)
                if (ev.target.checked) setPasscode('')
              }}
              disabled={isSubmitting}
            />
            Clear passcode (agent will no longer be able to sign in)
          </label>
        ) : null}
      </div>

      <div className="form-group">
        <label htmlFor="da-photo">Profile photo (optional, ≤ 2MB)</label>
        <input
          id="da-photo"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          onChange={onPhotoChange}
          disabled={isSubmitting}
        />
        {isEdit && editing?.photoUrl ? (
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={removePhoto}
              onChange={(ev) => {
                setRemovePhoto(ev.target.checked)
                if (ev.target.checked) clearLocalPhoto()
              }}
              disabled={isSubmitting}
            />
            Remove current photo
          </label>
        ) : null}
        <div className="admin-preview admin-preview--avatar">
          <AgentAvatar
            photoUrl={previewPhotoUrl}
            name={name.trim() || 'Agent'}
            size="sm"
          />
          <p className="form-hint">
            {photoPreview
              ? 'New photo — saving will replace the current one.'
              : isEdit
                ? removePhoto
                  ? 'Photo will be cleared on save.'
                  : editing?.photoUrl
                    ? 'Current photo. Pick a file to replace, or check the box above to clear it.'
                    : 'No photo set. Pick a file to add one.'
                : 'No photo selected — a generic placeholder will be used.'}
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
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Onboard agent'}
          </span>
        </button>
      </div>
    </form>
  )
}

// ====================================================================
// Page
// ====================================================================
export default function DeliveryOnboardingPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [agents, setAgents] = useState<DeliveryAgentDoc[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<DeliveryAgentStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const editing = useMemo(
    () => agents.find((a) => a.id === editingId) ?? null,
    [agents, editingId]
  )

  const loadAgents = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await deliveryAgentsAPI.list(
        filterStatus === 'all' ? undefined : filterStatus
      )
      setAgents(data)
    } catch (err) {
      console.error(err)
      setLoadError(axiosErrorMessage(err, 'Could not load delivery agents'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadAgents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus])

  const handleSaved = (saved: DeliveryAgentDoc, mode: 'create' | 'update') => {
    setAgents((cur) => {
      if (mode === 'create') return [saved, ...cur]
      return cur.map((a) => (a.id === saved.id ? saved : a))
    })
    if (mode === 'update') {
      setEditingId(null)
      showToast(`Updated ${saved.name}`, 'success')
    } else {
      showToast(`Onboarded ${saved.name}`, 'success')
    }
  }

  const handleDelete = async (agent: DeliveryAgentDoc) => {
    if (!window.confirm(`Remove "${agent.name}"? This cannot be undone.`)) return
    try {
      await deliveryAgentsAPI.remove(agent.id)
      setAgents((cur) => cur.filter((a) => a.id !== agent.id))
      if (editingId === agent.id) setEditingId(null)
      showToast(`Deleted ${agent.name}`, 'success')
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not delete delivery agent'), 'error')
    }
  }

  const handleToggleStatus = async (agent: DeliveryAgentDoc) => {
    const nextStatus: DeliveryAgentStatus = agent.status === 'active' ? 'inactive' : 'active'
    try {
      const updated = await deliveryAgentsAPI.update(agent.id, { status: nextStatus })
      setAgents((cur) => cur.map((a) => (a.id === agent.id ? updated : a)))
      showToast(
        `${updated.name} is now ${updated.status === 'active' ? 'active' : 'inactive'}`,
        'success'
      )
    } catch (err) {
      showToast(axiosErrorMessage(err, 'Could not update status'), 'error')
    }
  }

  return (
    <main className="app-shell">
      <AppHeaderApp />

      <section className="category-hero category-hero--compact">
        <div className="category-hero__content">
          <p className="category-hero__kicker">Administration</p>
          <h2 className="category-hero__title">🛵 Delivery onboarding</h2>
          <p className="category-hero__subtitle">
            Onboard a new delivery rider, edit their details, or temporarily mark them inactive.
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

      <section className="admin-grid">
        <div className="admin-grid__form">
          <div className="auth-card admin-card">
            <h2 className="profile-heading">
              {editing ? `Edit: ${editing.name}` : 'Onboard a delivery agent'}
            </h2>
            <AgentForm
              key={editing?.id ?? 'new-agent'}
              editing={editing}
              onSaved={handleSaved}
              onCancelEdit={() => setEditingId(null)}
            />
          </div>
        </div>

        <div className="admin-grid__list">
          <div className="auth-card admin-card">
            <div className="admin-list__header">
              <h2 className="profile-heading">Delivery agents</h2>
              <span className="admin-list__count">{agents.length}</span>
            </div>

            <div className="admin-filter-row">
              <label htmlFor="da-filter">Show</label>
              <select
                id="da-filter"
                value={filterStatus}
                onChange={(ev) =>
                  setFilterStatus(ev.target.value as DeliveryAgentStatus | 'all')
                }
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {isLoading ? (
              <p className="empty-state">Loading…</p>
            ) : agents.length === 0 ? (
              <p className="empty-state">
                No delivery agents{filterStatus === 'all' ? ' yet' : ` (${filterStatus})`}. Onboard one using the form on the left.
              </p>
            ) : (
              <ul className="admin-item-list">
                {agents.map((agent) => (
                  <li
                    key={agent.id}
                    className={`admin-item ${
                      agent.id === editingId ? 'admin-item--editing' : ''
                    }`}
                  >
                    <AgentAvatar
                      photoUrl={agent.photoUrl}
                      name={agent.name}
                      size="md"
                    />
                    <div className="admin-item__body">
                      <h3>
                        {agent.name}{' '}
                        <span
                          className={`status-pill status-pill--${agent.status}`}
                          aria-label={`Status: ${agent.status}`}
                        >
                          {agent.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </h3>
                      <p className="admin-item__meta">
                        {agent.phone}
                        {agent.email ? ` • ${agent.email}` : ''}
                      </p>
                      <p className="admin-item__meta">
                        {agent.vehicleType}
                        {agent.vehicleNumber ? ` • ${agent.vehicleNumber}` : ''}
                      </p>
                      <p className="admin-item__meta">
                        {agent.hasPasscode ? (
                          <span className="status-pill status-pill--active">PIN set</span>
                        ) : (
                          <span className="status-pill status-pill--inactive">No PIN</span>
                        )}
                      </p>
                      {agent.notes ? (
                        <p className="admin-item__desc">{agent.notes}</p>
                      ) : null}
                    </div>
                    <div className="admin-item__actions admin-item__actions--stack">
                      <button
                        type="button"
                        className="back-button admin-item__edit icon-only"
                        onClick={() => setEditingId(agent.id)}
                        aria-label={`Edit ${agent.name}`}
                        title="Edit agent"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        className="back-button icon-only"
                        onClick={() => handleToggleStatus(agent)}
                        aria-label={
                          agent.status === 'active'
                            ? `Deactivate ${agent.name}`
                            : `Activate ${agent.name}`
                        }
                        title={agent.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {agent.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                      </button>
                      <button
                        type="button"
                        className="back-button admin-item__delete icon-only"
                        onClick={() => handleDelete(agent)}
                        aria-label={`Delete ${agent.name}`}
                        title="Delete agent"
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

      <section className="panel admin-footer-actions">
        <button
          type="button"
          className="back-button btn-icon"
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon />
          <span>Exit Admin</span>
        </button>
      </section>
    </main>
  )
}

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderApp } from '../components/AppHeader'
import { CheckIcon, ChevronLeftIcon } from '../components/Icons'
import { useAuth } from '../state/AuthContext'
import { validateProfileForm } from '../utils/userValidators'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPhone(user.phone)
      setAddress(user.address)
    }
  }, [user])

  const errors = useMemo(
    () =>
      validateProfileForm({
        name,
        phone,
        address,
      }),
    [name, phone, address]
  )

  const canSubmit = Object.keys(errors).length === 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setSubmitError('')
    setSuccessMessage('')
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      })
      setSuccessMessage('Profile saved.')
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        setSubmitError(msg ?? 'Could not update profile')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const showErr = (key: keyof typeof errors) => (touched || isSubmitting) && errors[key]

  if (!user) return null

  return (
    <main className="app-shell">
      <AppHeaderApp />

      <div className="auth-card profile-card">
        <h2 className="profile-heading">Your profile</h2>
        <p className="form-hint">Email cannot be changed.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {submitError ? <p className="error-message">{submitError}</p> : null}
          {successMessage ? <p className="success-banner">{successMessage}</p> : null}

          <div className="form-group">
            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" type="email" value={user.email} disabled readOnly />
          </div>

          <div className="form-group">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isSubmitting}
            />
            {showErr('name') ? <p className="field-error">{errors.name}</p> : null}
          </div>

          <div className="form-group">
            <label htmlFor="profile-phone">Phone</label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isSubmitting}
            />
            {showErr('phone') ? <p className="field-error">{errors.phone}</p> : null}
          </div>

          <div className="form-group">
            <label htmlFor="profile-address">Address</label>
            <textarea
              id="profile-address"
              autoComplete="street-address"
              rows={4}
              value={address}
              onChange={(ev) => setAddress(ev.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isSubmitting}
            />
            {showErr('address') ? <p className="field-error">{errors.address}</p> : null}
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="back-button btn-icon"
              onClick={() => navigate('/')}
              disabled={isSubmitting}
            >
              <ChevronLeftIcon />
              <span>Back to menu</span>
            </button>
            <button
              type="submit"
              className="proceed-payment-button auth-submit profile-save btn-icon"
              disabled={isSubmitting || !canSubmit}
            >
              <CheckIcon />
              <span>{isSubmitting ? 'Saving…' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

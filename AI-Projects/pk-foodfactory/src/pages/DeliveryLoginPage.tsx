import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { useDeliveryAuth } from '../state/DeliveryAuthContext'

export default function DeliveryLoginPage() {
  const navigate = useNavigate()
  const { login } = useDeliveryAuth()
  const [phone, setPhone] = useState('')
  const [passcode, setPasscode] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    const trimmedPhone = phone.trim()
    const trimmedPasscode = passcode.trim()
    if (!trimmedPhone || !trimmedPasscode) {
      setSubmitError('Phone and passcode are required')
      return
    }

    setIsSubmitting(true)
    try {
      await login(trimmedPhone, trimmedPasscode)
      navigate('/delivery', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        setSubmitError(msg ?? 'Could not sign you in')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <AppHeaderAuth title="Delivery agent sign in" />
      <div className="auth-card">
        <p className="auth-card__lede">
          For onboarded delivery riders. Use the phone number you were registered with and the
          passcode given by the administrator.
        </p>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {submitError ? <p className="error-message">{submitError}</p> : null}

          <div className="form-group">
            <label htmlFor="delivery-phone">Phone</label>
            <input
              id="delivery-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              disabled={isSubmitting}
              placeholder="10–15 digits"
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery-passcode">Passcode</label>
            <input
              id="delivery-passcode"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={passcode}
              onChange={(ev) => setPasscode(ev.target.value)}
              disabled={isSubmitting}
              placeholder="4–8 digit PIN"
              maxLength={8}
            />
          </div>

          <button
            type="submit"
            className="proceed-payment-button auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Not a rider? <Link to="/login">Customer sign in</Link>
        </p>
      </div>
    </main>
  )
}

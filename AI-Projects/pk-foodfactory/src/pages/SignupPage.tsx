import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { useAuth } from '../state/AuthContext'
import { validateSignupForm } from '../utils/userValidators'

export default function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const errors = useMemo(
    () =>
      validateSignupForm({
        name,
        email,
        password,
        phone,
        address,
      }),
    [name, email, password, phone, address]
  )

  const canSubmit = Object.keys(errors).length === 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setSubmitError('')
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        address: address.trim(),
      })
      navigate('/', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        setSubmitError(msg ?? 'Could not create account')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const showErr = (key: keyof typeof errors) => (touched || isSubmitting) && errors[key]

  return (
    <main className="auth-shell auth-shell--wide">
      <AppHeaderAuth title="Create account" />
      <div className="auth-card auth-card--wide">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {submitError ? <p className="error-message">{submitError}</p> : null}

          <div className="form-group">
            <label htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
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
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isSubmitting}
            />
            {showErr('email') ? <p className="field-error">{errors.email}</p> : null}
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isSubmitting}
            />
            {showErr('password') ? <p className="field-error">{errors.password}</p> : null}
          </div>

          <div className="form-group">
            <label htmlFor="signup-phone">Phone</label>
            <input
              id="signup-phone"
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
            <label htmlFor="signup-address">Address</label>
            <textarea
              id="signup-address"
              autoComplete="street-address"
              rows={4}
              value={address}
              onChange={(ev) => setAddress(ev.target.value)}
              onBlur={() => setTouched(true)}
              disabled={isSubmitting}
            />
            {showErr('address') ? <p className="field-error">{errors.address}</p> : null}
          </div>

          <button
            type="submit"
            className="proceed-payment-button auth-submit"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  )
}

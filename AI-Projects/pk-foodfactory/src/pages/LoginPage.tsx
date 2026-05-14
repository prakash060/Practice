import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import { validateEmail } from '../utils/userValidators'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestedFrom =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    const eEmail = validateEmail(email)
    const nextFields: typeof fieldErrors = {}
    if (eEmail) nextFields.email = eEmail
    if (!password) nextFields.password = 'Password is required'
    setFieldErrors(nextFields)
    if (Object.keys(nextFields).length > 0) return

    setIsSubmitting(true)
    try {
      const user = await login(email.trim(), password)
      // Honor the deep-link the user was originally trying to reach; otherwise
      // send admins to the admin console and everyone else to the home page.
      const target = requestedFrom && requestedFrom !== '/' ? requestedFrom : defaultLandingPath(user)
      navigate(target, { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        setSubmitError(msg ?? 'Invalid email or password')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell">
      <AppHeaderAuth title="Sign in" />
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {submitError ? <p className="error-message">{submitError}</p> : null}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value)
                if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }))
              }}
              disabled={isSubmitting}
            />
            {fieldErrors.email ? <p className="field-error">{fieldErrors.email}</p> : null}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(ev) => {
                setPassword(ev.target.value)
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }))
              }}
              disabled={isSubmitting}
            />
            {fieldErrors.password ? <p className="field-error">{fieldErrors.password}</p> : null}
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
          No account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </main>
  )
}

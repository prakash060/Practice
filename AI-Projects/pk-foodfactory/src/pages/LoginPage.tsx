import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import { validateLoginForm } from '../utils/userValidators'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [secret, setSecret] = useState('')
  const [loginMode, setLoginMode] = useState<'password' | 'pin'>('password')
  const [submitError, setSubmitError] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestedFrom =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? null

  const fieldErrors = useMemo(
    () => validateLoginForm(identifier, secret),
    [identifier, secret]
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setTouched(true)
    if (Object.keys(fieldErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const user = await login(identifier.trim(), secret)
      const target =
        requestedFrom && requestedFrom !== '/' ? requestedFrom : defaultLandingPath(user)
      navigate(target, { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data as { error?: string })?.error
        setSubmitError(msg ?? 'Invalid email/phone or credentials')
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
            <label htmlFor="login-identifier">Email or mobile</label>
            <input
              id="login-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(ev) => {
                setIdentifier(ev.target.value)
              }}
              disabled={isSubmitting}
            />
            {touched && fieldErrors.identifier ? (
              <p className="field-error">{fieldErrors.identifier}</p>
            ) : null}
          </div>

          <fieldset className="auth-type-picker auth-type-picker--inline">
            <legend className="visually-hidden">Credential type</legend>
            <label>
              <input
                type="radio"
                name="loginMode"
                checked={loginMode === 'password'}
                onChange={() => {
                  setLoginMode('password')
                  setSecret('')
                }}
              />
              Password
            </label>
            <label>
              <input
                type="radio"
                name="loginMode"
                checked={loginMode === 'pin'}
                onChange={() => {
                  setLoginMode('pin')
                  setSecret('')
                }}
              />
              PIN
            </label>
          </fieldset>

          <div className="form-group">
            <label htmlFor="login-secret">
              {loginMode === 'pin' ? 'PIN' : 'Password'}
            </label>
            <input
              id="login-secret"
              type="password"
              inputMode={loginMode === 'pin' ? 'numeric' : undefined}
              autoComplete={loginMode === 'pin' ? 'off' : 'current-password'}
              maxLength={loginMode === 'pin' ? 6 : undefined}
              value={secret}
              onChange={(ev) => {
                const v =
                  loginMode === 'pin'
                    ? ev.target.value.replace(/\D/g, '').slice(0, 6)
                    : ev.target.value
                setSecret(v)
              }}
              disabled={isSubmitting}
            />
            {touched && fieldErrors.secret ? (
              <p className="field-error">{fieldErrors.secret}</p>
            ) : null}
          </div>

          <p className="auth-footer auth-footer--inline">
            <Link to="/forgot-credentials">Forgot password or PIN?</Link>
          </p>

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
        <p className="auth-footer auth-footer--muted">
          Delivery rider? <Link to="/delivery/login">Rider sign in</Link>
        </p>
      </div>
    </main>
  )
}

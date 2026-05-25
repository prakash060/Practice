import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { OtpInput } from '../components/OtpInput'
import { authAPI, type DevOtpHint } from '../services/api'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import { validateIdentifier, validateLoginForm, validateOtp } from '../utils/userValidators'

type LoginMethod = 'otp' | 'password' | 'pin'
type OtpStep = 'identifier' | 'verify'

function axiosError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { error?: string })?.error ?? fallback
  }
  return fallback
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, applyAuthSession } = useAuth()

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp')
  const [otpStep, setOtpStep] = useState<OtpStep>('identifier')

  const [identifier, setIdentifier] = useState('')
  const [secret, setSecret] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [channel, setChannel] = useState<'email' | 'phone'>('email')
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState<DevOtpHint | null>(null)

  const [submitError, setSubmitError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestedFrom =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? null

  const identifierError = useMemo(() => validateIdentifier(identifier), [identifier])
  const credentialErrors = useMemo(
    () => validateLoginForm(identifier, secret),
    [identifier, secret]
  )

  const switchMethod = (method: LoginMethod) => {
    setLoginMethod(method)
    setSubmitError('')
    setInfoMessage('')
    setOtpStep('identifier')
    setSecret('')
    setOtp('')
  }

  const finishLogin = (user: Parameters<typeof applyAuthSession>[0], token: string) => {
    applyAuthSession(user, token)
    const target =
      requestedFrom && requestedFrom !== '/' ? requestedFrom : defaultLandingPath(user)
    navigate(target, { replace: true })
  }

  const handleCredentialSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setTouched(true)
    if (Object.keys(credentialErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const user = await login(
        identifier.trim(),
        secret,
        loginMethod === 'pin' ? 'pin' : 'password'
      )
      const target =
        requestedFrom && requestedFrom !== '/' ? requestedFrom : defaultLandingPath(user)
      navigate(target, { replace: true })
    } catch (err) {
      setSubmitError(axiosError(err, 'Invalid email/phone or credentials'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpStart = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setInfoMessage('')
    setTouched(true)
    if (identifierError) return

    setIsSubmitting(true)
    try {
      const res = await authAPI.loginStart(identifier.trim())
      setInfoMessage(res.message)
      if (res.sessionToken && res.channel) {
        setSessionToken(res.sessionToken)
        setChannel(res.channel)
        setDevOtp(res.devOtp ?? null)
        setOtp('')
        setOtpStep('verify')
      }
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not send verification code'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!sessionToken) return
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const res = await authAPI.loginSendOtp(sessionToken)
      setDevOtp(res.devOtp ?? null)
      setOtp('')
      setInfoMessage(res.message)
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not resend code'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    const otpErr = validateOtp(otp)
    if (otpErr) {
      setSubmitError(otpErr)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authAPI.loginVerifyOtp(sessionToken, otp.trim())
      finishLogin(res.user, res.token)
    } catch (err) {
      setSubmitError(axiosError(err, 'Verification failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const channelLabel = channel === 'email' ? 'email' : 'mobile number'

  return (
    <main className="auth-shell auth-shell--wide">
      <AppHeaderAuth title="Sign in" />
      <div className="auth-card auth-card--wide">
        <fieldset className="auth-type-picker auth-type-picker--inline auth-method-tabs">
          <legend className="visually-hidden">Sign-in method</legend>
          <label>
            <input
              type="radio"
              name="loginMethod"
              checked={loginMethod === 'otp'}
              onChange={() => switchMethod('otp')}
            />
            OTP
          </label>
          <label>
            <input
              type="radio"
              name="loginMethod"
              checked={loginMethod === 'password'}
              onChange={() => switchMethod('password')}
            />
            Password
          </label>
          <label>
            <input
              type="radio"
              name="loginMethod"
              checked={loginMethod === 'pin'}
              onChange={() => switchMethod('pin')}
            />
            PIN
          </label>
        </fieldset>
        <p className="item-description auth-method-hint">
          Use any sign-in method configured on your account. OTP always works; password and PIN work
          when set.
        </p>

        {infoMessage ? <p className="auth-info">{infoMessage}</p> : null}
        {submitError ? <p className="error-message">{submitError}</p> : null}

        {loginMethod === 'otp' && otpStep === 'identifier' ? (
          <form className="auth-form" onSubmit={handleOtpStart} noValidate>
            <p className="item-description">
              Enter your email or mobile. We will send a one-time verification code.
            </p>
            <div className="form-group">
              <label htmlFor="login-identifier">Email or mobile</label>
              <input
                id="login-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(ev) => setIdentifier(ev.target.value)}
                disabled={isSubmitting}
              />
              {touched && identifierError ? (
                <p className="field-error">{identifierError}</p>
              ) : null}
            </div>
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending code…' : 'Send verification code'}
            </button>
          </form>
        ) : null}

        {loginMethod === 'otp' && otpStep === 'verify' ? (
          <form className="auth-form" onSubmit={handleOtpSubmit} noValidate>
            {devOtp?.code ? (
              <div className="dev-otp-banner" role="status">
                <p>
                  <strong>Local development — verification code</strong>
                </p>
                <p>
                  Use <strong>{devOtp.code}</strong> ({devOtp.channel === 'email' ? 'email' : 'SMS'}{' '}
                  channel).
                </p>
              </div>
            ) : null}
            <p className="item-description">
              Enter the 6-digit code sent to your <strong>{channelLabel}</strong>.
            </p>
            <OtpInput
              id="login-otp"
              label={`${channel === 'email' ? 'Email' : 'SMS'} verification code`}
              value={otp}
              onChange={setOtp}
              disabled={isSubmitting}
              hint={channel === 'phone' ? 'Check your text messages' : 'Check your inbox'}
            />
            <div className="auth-form__row">
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setOtpStep('identifier')
                  setSubmitError('')
                }}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying…' : 'Verify and sign in'}
              </button>
            </div>
            <button
              type="button"
              className="back-button auth-link-btn"
              onClick={() => void handleResendOtp()}
              disabled={isSubmitting}
            >
              Resend code
            </button>
          </form>
        ) : null}

        {loginMethod === 'password' || loginMethod === 'pin' ? (
          <form className="auth-form" onSubmit={handleCredentialSubmit} noValidate>
            <p className="item-description">
              {loginMethod === 'pin'
                ? 'Sign in with the PIN set on your account. OTP sign-in is always available.'
                : 'Sign in with your account password. OTP sign-in is always available.'}
            </p>
            <div className="form-group">
              <label htmlFor="login-identifier-cred">Email or mobile</label>
              <input
                id="login-identifier-cred"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(ev) => setIdentifier(ev.target.value)}
                disabled={isSubmitting}
              />
              {touched && credentialErrors.identifier ? (
                <p className="field-error">{credentialErrors.identifier}</p>
              ) : null}
            </div>
            <div className="form-group">
              <label htmlFor="login-secret">
                {loginMethod === 'pin' ? 'PIN' : 'Password'}
              </label>
              <input
                id="login-secret"
                type="password"
                inputMode={loginMethod === 'pin' ? 'numeric' : undefined}
                autoComplete={loginMethod === 'pin' ? 'off' : 'current-password'}
                maxLength={loginMethod === 'pin' ? 6 : undefined}
                value={secret}
                onChange={(ev) => {
                  const v =
                    loginMethod === 'pin'
                      ? ev.target.value.replace(/\D/g, '').slice(0, 6)
                      : ev.target.value
                  setSecret(v)
                }}
                disabled={isSubmitting}
              />
              {touched && credentialErrors.secret ? (
                <p className="field-error">{credentialErrors.secret}</p>
              ) : null}
            </div>
            <p className="auth-footer auth-footer--inline">
              <Link to="/forgot-credentials">Forgot password or PIN?</Link>
            </p>
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : null}

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

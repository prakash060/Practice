import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { OtpInput } from '../components/OtpInput'
import { authAPI, type DevOtpHint } from '../services/api'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import { validateIdentifier, validateOtp } from '../utils/userValidators'

type Step = 'identifier' | 'otp'

function axiosError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { error?: string })?.error ?? fallback
  }
  return fallback
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { applyAuthSession } = useAuth()

  const [step, setStep] = useState<Step>('identifier')
  const [identifier, setIdentifier] = useState('')
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

  const handleIdentifierSubmit = async (e: FormEvent) => {
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
        setStep('otp')
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
      applyAuthSession(res.user, res.token)
      const target =
        requestedFrom && requestedFrom !== '/' ? requestedFrom : defaultLandingPath(res.user)
      navigate(target, { replace: true })
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
        <div className="auth-steps" aria-label="Sign in progress">
          <span className={step === 'identifier' ? 'auth-steps__item--active' : ''}>
            1. Email or mobile
          </span>
          <span className={step === 'otp' ? 'auth-steps__item--active' : ''}>2. Verify</span>
        </div>

        {infoMessage ? <p className="auth-info">{infoMessage}</p> : null}
        {submitError ? <p className="error-message">{submitError}</p> : null}

        {step === 'identifier' ? (
          <form className="auth-form" onSubmit={handleIdentifierSubmit} noValidate>
            <p className="item-description">
              Enter your email or mobile number. We will send a one-time verification code.
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

        {step === 'otp' ? (
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
                  setStep('identifier')
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

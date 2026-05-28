import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { IdentifierInput } from '../components/IdentifierInput'
import { PhoneInput } from '../components/PhoneInput'
import { OtpInput } from '../components/OtpInput'
import { SecretField } from '../components/SecretField'
import { authAPI, type DevOtpHint } from '../services/api'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import { formatPhoneForApi, normalizeIdentifierForApi } from '../utils/phoneCountry'
import { validateLoginForm, validateOtp, validatePhone } from '../utils/userValidators'

type LoginMethod = 'otp' | 'password'
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

  const [phone, setPhone] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [secret, setSecret] = useState('')
  const [sessionToken, setSessionToken] = useState('')
  const [channel, setChannel] = useState<'email' | 'phone'>('phone')
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState<DevOtpHint | null>(null)

  const [submitError, setSubmitError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const requestedFrom =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? null

  const phoneError = useMemo(() => validatePhone(phone), [phone])
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
    setTouched(false)
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
      const user = await login(normalizeIdentifierForApi(identifier), secret, 'password')
      const target =
        requestedFrom && requestedFrom !== '/' ? requestedFrom : defaultLandingPath(user)
      navigate(target, { replace: true })
    } catch (err) {
      setSubmitError(axiosError(err, 'Invalid email/mobile or password'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpStart = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setInfoMessage('')
    setTouched(true)
    if (phoneError) return

    setIsSubmitting(true)
    try {
      const res = await authAPI.loginStart(formatPhoneForApi(phone), 'phone')
      setInfoMessage(res.message)
      if (res.sessionToken) {
        setSessionToken(res.sessionToken)
        setChannel(res.channel ?? 'phone')
        setDevOtp(res.devOtp ?? null)
        setOtp('')
        setOtpStep('verify')
        setSubmitError('')
      } else {
        setSubmitError(
          'No account found for this mobile number. Check the number or create an account.'
        )
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
            Mobile number
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
        </fieldset>
        <p className="item-description auth-method-hint">
          Sign in with a one-time code sent to your mobile number, or with your account password.
        </p>

        {infoMessage ? <p className="auth-info">{infoMessage}</p> : null}
        {submitError ? <p className="error-message">{submitError}</p> : null}

        {loginMethod === 'otp' && otpStep === 'identifier' ? (
          <form className="auth-form" onSubmit={handleOtpStart} noValidate>
            <p className="item-description">
              Enter your registered mobile number. We will send a one-time code by SMS.
            </p>
            <PhoneInput
              id="login-phone"
              label="Mobile number"
              value={phone}
              onChange={setPhone}
              disabled={isSubmitting}
              hint="India (+91) — 10-digit mobile without leading zero"
              error={touched ? phoneError ?? undefined : undefined}
            />
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

        {loginMethod === 'password' ? (
          <form className="auth-form" onSubmit={handleCredentialSubmit} noValidate>
            <p className="item-description">Sign in with your email or mobile and password.</p>
            <IdentifierInput
              id="login-identifier-cred"
              label="Email or mobile"
              value={identifier}
              onChange={setIdentifier}
              disabled={isSubmitting}
              hint="Mobile numbers use +91 by default"
              error={touched ? credentialErrors.identifier : undefined}
            />
            <SecretField
              id="login-secret"
              label="Password"
              value={secret}
              onChange={setSecret}
              variant="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              error={touched ? credentialErrors.secret : undefined}
            />
            <p className="auth-footer auth-footer--inline">
              <Link to="/forgot-credentials">Forgot password?</Link>
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

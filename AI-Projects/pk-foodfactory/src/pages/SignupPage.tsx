import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { OtpInput } from '../components/OtpInput'
import { authAPI, type AuthType, type DevOtpHint } from '../services/api'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import {
  validateOptionalSignupCredentials,
  validateOtp,
  validateSignupProfileForm,
} from '../utils/userValidators'

type Step = 'profile' | 'otp' | 'credential'

function axiosError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { error?: string })?.error ?? fallback
  }
  return fallback
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { applyAuthSession } = useAuth()

  const [step, setStep] = useState<Step>('profile')
  const [sessionToken, setSessionToken] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')

  const [enablePassword, setEnablePassword] = useState(false)
  const [enablePin, setEnablePin] = useState(false)
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')

  const [devOtp, setDevOtp] = useState<DevOtpHint | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profileErrors = useMemo(
    () => validateSignupProfileForm({ name, email, phone, address }),
    [name, email, phone, address]
  )

  const credentialErrors = useMemo(
    () => validateOptionalSignupCredentials(enablePassword, password, enablePin, pin),
    [enablePassword, password, enablePin, pin]
  )

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setSubmitError('')
    if (Object.keys(profileErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const res = await authAPI.signupStart({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      })
      setSessionToken(res.sessionToken)
      setDevOtp(res.devOtp ?? null)
      setEmailOtp('')
      setPhoneOtp('')
      setInfoMessage(res.message)
      setStep('otp')
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not start signup'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!sessionToken) return
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const res = await authAPI.signupSendOtp(sessionToken)
      setDevOtp(res.devOtp ?? null)
      setEmailOtp('')
      setPhoneOtp('')
      setInfoMessage(res.message)
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not resend codes'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    const errors: Record<string, string> = {}
    const eEmail = validateOtp(emailOtp)
    const ePhone = validateOtp(phoneOtp)
    if (eEmail) errors.emailOtp = eEmail
    if (ePhone) errors.phoneOtp = ePhone
    if (Object.keys(errors).length > 0) {
      setSubmitError(errors.emailOtp || errors.phoneOtp || 'Invalid codes')
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.signupVerifyOtp(sessionToken, emailOtp.trim(), phoneOtp.trim())
      setStep('credential')
      setInfoMessage(
        'Verification successful. OTP sign-in is always enabled. Optionally add a password and/or PIN.'
      )
    } catch (err) {
      setSubmitError(axiosError(err, 'Verification failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCredentialSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    setSubmitError('')
    if (Object.keys(credentialErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const res = await authAPI.signupComplete({
        sessionToken,
        password: enablePassword ? password : undefined,
        pin: enablePin ? pin : undefined,
      })
      applyAuthSession(res.user, res.token)
      navigate(defaultLandingPath(res.user), { replace: true })
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not create account'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-shell auth-shell--wide">
      <AppHeaderAuth title="Create account" />
      <div className="auth-card auth-card--wide">
        <div className="auth-steps" aria-label="Signup progress">
          <span className={step === 'profile' ? 'auth-steps__item--active' : ''}>1. Profile</span>
          <span className={step === 'otp' ? 'auth-steps__item--active' : ''}>2. Verify</span>
          <span className={step === 'credential' ? 'auth-steps__item--active' : ''}>3. Login setup</span>
        </div>

        {infoMessage ? <p className="auth-info">{infoMessage}</p> : null}
        {submitError ? <p className="error-message">{submitError}</p> : null}

        {step === 'profile' ? (
          <form className="auth-form" onSubmit={handleProfileSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                disabled={isSubmitting}
              />
              {touched && profileErrors.name ? (
                <p className="field-error">{profileErrors.name}</p>
              ) : null}
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={isSubmitting}
              />
              {touched && profileErrors.email ? (
                <p className="field-error">{profileErrors.email}</p>
              ) : null}
            </div>
            <div className="form-group">
              <label htmlFor="signup-phone">Mobile number</label>
              <input
                id="signup-phone"
                type="tel"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                disabled={isSubmitting}
              />
              {touched && profileErrors.phone ? (
                <p className="field-error">{profileErrors.phone}</p>
              ) : null}
            </div>
            <div className="form-group">
              <label htmlFor="signup-address">Delivery address</label>
              <textarea
                id="signup-address"
                rows={3}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
                disabled={isSubmitting}
              />
              {touched && profileErrors.address ? (
                <p className="field-error">{profileErrors.address}</p>
              ) : null}
            </div>
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending codes…' : 'Continue'}
            </button>
          </form>
        ) : null}

        {step === 'otp' ? (
          <form className="auth-form" onSubmit={handleOtpSubmit} noValidate>
            {devOtp ? (
              <div className="dev-otp-banner" role="status">
                <p>
                  <strong>Local development — verification codes</strong>
                </p>
                {devOtp.email === devOtp.phone ? (
                  <p>
                    Use <strong>{devOtp.email}</strong> in both fields below.
                  </p>
                ) : (
                  <p>
                    Email: <strong>{devOtp.email}</strong> · SMS: <strong>{devOtp.phone}</strong>
                  </p>
                )}
              </div>
            ) : null}
            <OtpInput
              id="signup-email-otp"
              label="Email verification code"
              value={emailOtp}
              onChange={setEmailOtp}
              disabled={isSubmitting}
            />
            <OtpInput
              id="signup-phone-otp"
              label="SMS verification code"
              value={phoneOtp}
              onChange={setPhoneOtp}
              disabled={isSubmitting}
            />
            <div className="auth-form__row">
              <button
                type="button"
                className="back-button"
                onClick={() => setStep('profile')}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying…' : 'Verify'}
              </button>
            </div>
            <button
              type="button"
              className="back-button auth-link-btn"
              onClick={() => void handleResendOtp()}
              disabled={isSubmitting}
            >
              Resend codes
            </button>
          </form>
        ) : null}

        {step === 'credential' ? (
          <form className="auth-form" onSubmit={handleCredentialSubmit} noValidate>
            <p className="item-description">
              <strong>OTP sign-in</strong> is always available using your email or mobile. You can also
              add optional sign-in methods below — use any of them whenever you log in.
            </p>
            <fieldset className="auth-type-picker">
              <legend>Optional sign-in methods</legend>
              <label>
                <input
                  type="checkbox"
                  checked={enablePassword}
                  onChange={(ev) => {
                    setEnablePassword(ev.target.checked)
                    if (!ev.target.checked) setPassword('')
                  }}
                  disabled={isSubmitting}
                />
                Set a password (8+ characters)
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={enablePin}
                  onChange={(ev) => {
                    setEnablePin(ev.target.checked)
                    if (!ev.target.checked) setPin('')
                  }}
                  disabled={isSubmitting}
                />
                Set a PIN (4–6 digits)
              </label>
            </fieldset>

            {enablePassword ? (
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  disabled={isSubmitting}
                />
                {touched && credentialErrors.password ? (
                  <p className="field-error">{credentialErrors.password}</p>
                ) : null}
              </div>
            ) : null}

            {enablePin ? (
              <div className="form-group">
                <label htmlFor="signup-pin">PIN</label>
                <input
                  id="signup-pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  value={pin}
                  onChange={(ev) => setPin(ev.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isSubmitting}
                />
                {touched && credentialErrors.pin ? (
                  <p className="field-error">{credentialErrors.pin}</p>
                ) : null}
              </div>
            ) : null}

            <div className="auth-form__row">
              <button
                type="button"
                className="back-button"
                onClick={() => setStep('otp')}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>
        ) : null}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  )
}

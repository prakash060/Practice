import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { PhoneInput } from '../components/PhoneInput'
import { OtpInput } from '../components/OtpInput'
import { SecretField } from '../components/SecretField'
import { authAPI, type DevOtpHint } from '../services/api'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import { formatPhoneForApi } from '../utils/phoneCountry'
import {
  validatePassword,
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

  const [password, setPassword] = useState('')

  const [devOtp, setDevOtp] = useState<DevOtpHint | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profileErrors = useMemo(
    () => validateSignupProfileForm({ name, email, phone, address }),
    [name, email, phone, address]
  )

  const passwordError = useMemo(() => validatePassword(password), [password])

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
        phone: formatPhoneForApi(phone),
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
      setInfoMessage('Verification successful. Set a password to finish creating your account.')
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
    if (passwordError) return

    setIsSubmitting(true)
    try {
      const res = await authAPI.signupComplete({
        sessionToken,
        password,
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
          <span className={step === 'credential' ? 'auth-steps__item--active' : ''}>3. Set password</span>
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
            <PhoneInput
              id="signup-phone"
              label="Mobile number"
              value={phone}
              onChange={setPhone}
              disabled={isSubmitting}
              hint="India (+91) — 10-digit mobile without leading zero"
              error={touched ? profileErrors.phone : undefined}
            />
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
              After signup you can log in with your <strong>mobile number</strong> (one-time code) or
              with this <strong>password</strong>.
            </p>

            <SecretField
              id="signup-password"
              label="Password"
              value={password}
              onChange={setPassword}
              variant="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              error={touched ? passwordError ?? undefined : undefined}
            />

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

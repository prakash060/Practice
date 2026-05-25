import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { OtpInput } from '../components/OtpInput'
import { authAPI, type DevOtpHint } from '../services/api'
import { defaultLandingPath, useAuth } from '../state/AuthContext'
import { validateOtp, validateSignupProfileForm } from '../utils/userValidators'

type Step = 'profile' | 'otp'

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

  const [devOtp, setDevOtp] = useState<DevOtpHint | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const profileErrors = useMemo(
    () => validateSignupProfileForm({ name, email, phone, address }),
    [name, email, phone, address]
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
      const res = await authAPI.signupComplete({ sessionToken })
      applyAuthSession(res.user, res.token)
      navigate(defaultLandingPath(res.user), { replace: true })
    } catch (err) {
      setSubmitError(axiosError(err, 'Verification failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const showProfileErr = (key: keyof typeof profileErrors) =>
    (touched || isSubmitting) && profileErrors[key]

  return (
    <main className="auth-shell auth-shell--wide">
      <AppHeaderAuth title="Create account" />
      <div className="auth-card auth-card--wide">
        <div className="auth-steps" aria-label="Signup progress">
          <span className={step === 'profile' ? 'auth-steps__item--active' : ''}>1. Profile</span>
          <span className={step === 'otp' ? 'auth-steps__item--active' : ''}>2. Verify</span>
        </div>

        {infoMessage ? <p className="auth-info">{infoMessage}</p> : null}
        {submitError ? <p className="error-message">{submitError}</p> : null}

        {step === 'profile' ? (
          <form className="auth-form" onSubmit={handleProfileSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="signup-name">Name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                disabled={isSubmitting}
              />
              {showProfileErr('name') ? <p className="field-error">{profileErrors.name}</p> : null}
            </div>
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                disabled={isSubmitting}
              />
              {showProfileErr('email') ? <p className="field-error">{profileErrors.email}</p> : null}
            </div>
            <div className="form-group">
              <label htmlFor="signup-phone">Mobile number</label>
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                disabled={isSubmitting}
              />
              {showProfileErr('phone') ? <p className="field-error">{profileErrors.phone}</p> : null}
            </div>
            <div className="form-group">
              <label htmlFor="signup-address">Address</label>
              <textarea
                id="signup-address"
                autoComplete="street-address"
                rows={4}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
                disabled={isSubmitting}
              />
              {showProfileErr('address') ? (
                <p className="field-error">{profileErrors.address}</p>
              ) : null}
            </div>
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending codes…' : 'Send verification codes'}
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
                    Use <strong>{devOtp.email}</strong> in both fields below (email/SMS are not
                    configured on the server).
                  </p>
                ) : (
                  <p>
                    Email: <strong>{devOtp.email}</strong> · SMS: <strong>{devOtp.phone}</strong>
                  </p>
                )}
              </div>
            ) : null}
            <p className="item-description">
              Enter the 6-digit codes sent to <strong>{email}</strong> and <strong>{phone}</strong>.
            </p>
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
              hint="Check your text messages"
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
                {isSubmitting ? 'Creating account…' : 'Verify and create account'}
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

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  )
}

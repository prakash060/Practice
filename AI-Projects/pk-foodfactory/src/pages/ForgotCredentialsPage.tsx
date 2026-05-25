import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { OtpInput } from '../components/OtpInput'
import { authAPI, type AuthType, type DevOtpHint } from '../services/api'
import {
  validateCredentialForm,
  validateEmail,
  validateOtp,
  validatePhone,
} from '../utils/userValidators'

type Step = 'identify' | 'otp' | 'credential'

function axiosError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { error?: string })?.error ?? fallback
  }
  return fallback
}

export default function ForgotCredentialsPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('identify')
  const [sessionToken, setSessionToken] = useState('')

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')

  const [authType, setAuthType] = useState<AuthType>('password')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')

  const [devOtp, setDevOtp] = useState<DevOtpHint | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const identifyErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    const eEmail = validateEmail(email)
    const ePhone = validatePhone(phone)
    if (eEmail) errors.email = eEmail
    if (ePhone) errors.phone = ePhone
    return errors
  }, [email, phone])

  const credentialErrors = useMemo(
    () => validateCredentialForm(authType, password, pin),
    [authType, password, pin]
  )

  const handleIdentifySubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSuccessMessage('')
    if (Object.keys(identifyErrors).length > 0) {
      setSubmitError(identifyErrors.email || identifyErrors.phone || 'Invalid details')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authAPI.resetCredentialsStart({
        email: email.trim(),
        phone: phone.trim(),
      })
      setInfoMessage(res.message)
      if (res.sessionToken) {
        setSessionToken(res.sessionToken)
        setDevOtp(res.devOtp ?? null)
        setEmailOtp('')
        setPhoneOtp('')
        setStep('otp')
      } else {
        setStep('identify')
      }
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not start reset'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    if (!sessionToken) return
    setIsSubmitting(true)
    try {
      const res = await authAPI.resetSendOtp(sessionToken)
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
    const eEmail = validateOtp(emailOtp)
    const ePhone = validateOtp(phoneOtp)
    if (eEmail || ePhone) {
      setSubmitError(eEmail || ePhone || 'Invalid codes')
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.resetVerifyOtp(sessionToken, emailOtp.trim(), phoneOtp.trim())
      setStep('credential')
      setInfoMessage('Verified. Set your new password or PIN.')
    } catch (err) {
      setSubmitError(axiosError(err, 'Verification failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCredentialSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (Object.keys(credentialErrors).length > 0) {
      setSubmitError(credentialErrors.password || credentialErrors.pin || 'Invalid credential')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await authAPI.resetComplete({
        sessionToken,
        authType,
        password: authType === 'password' ? password : undefined,
        pin: authType === 'pin' ? pin : undefined,
      })
      setSuccessMessage(res.message)
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not reset credentials'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <main className="auth-shell">
        <AppHeaderAuth title="Reset login" />
        <div className="auth-card">
          <p className="auth-info">{successMessage}</p>
          <p className="auth-footer">
            <Link to="/login">Go to sign in</Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-shell auth-shell--wide">
      <AppHeaderAuth title="Reset password or PIN" />
      <div className="auth-card auth-card--wide">
        <p className="item-description">
          We will send verification codes to the email and mobile on your account.
        </p>

        {infoMessage ? <p className="auth-info">{infoMessage}</p> : null}
        {submitError ? <p className="error-message">{submitError}</p> : null}

        {step === 'identify' ? (
          <form className="auth-form" onSubmit={handleIdentifySubmit} noValidate>
            <div className="form-group">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reset-phone">Mobile number</label>
              <input
                id="reset-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send verification codes'}
            </button>
          </form>
        ) : null}

        {step === 'otp' && sessionToken ? (
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
              id="reset-email-otp"
              label="Email verification code"
              value={emailOtp}
              onChange={setEmailOtp}
              disabled={isSubmitting}
            />
            <OtpInput
              id="reset-phone-otp"
              label="SMS verification code"
              value={phoneOtp}
              onChange={setPhoneOtp}
              disabled={isSubmitting}
            />
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying…' : 'Verify codes'}
            </button>
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
            <fieldset className="auth-type-picker">
              <legend>New sign-in method</legend>
              <label>
                <input
                  type="radio"
                  name="resetAuthType"
                  checked={authType === 'password'}
                  onChange={() => setAuthType('password')}
                />
                Password
              </label>
              <label>
                <input
                  type="radio"
                  name="resetAuthType"
                  checked={authType === 'pin'}
                  onChange={() => setAuthType('pin')}
                />
                PIN
              </label>
            </fieldset>
            {authType === 'password' ? (
              <div className="form-group">
                <label htmlFor="reset-password">New password</label>
                <input
                  id="reset-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="reset-pin">New PIN</label>
                <input
                  id="reset-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isSubmitting}
                />
              </div>
            )}
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Update credentials'}
            </button>
          </form>
        ) : null}

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </main>
  )
}

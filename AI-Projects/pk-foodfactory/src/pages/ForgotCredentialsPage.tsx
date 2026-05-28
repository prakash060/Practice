import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AppHeaderAuth } from '../components/AppHeader'
import { PhoneInput } from '../components/PhoneInput'
import { OtpInput } from '../components/OtpInput'
import { SecretField } from '../components/SecretField'
import { authAPI, type AuthType, type DevOtpHint } from '../services/api'
import { formatPhoneForApi } from '../utils/phoneCountry'
import {
  validateCredentialForm,
  validateEmail,
  validateOtp,
  validatePhone,
} from '../utils/userValidators'

type Step = 'identify' | 'verify' | 'credential'

function axiosError(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return (err.response?.data as { error?: string })?.error ?? fallback
  }
  return fallback
}

function methodLabel(method: AuthType): string {
  if (method === 'password') return 'Password'
  if (method === 'pin') return 'PIN'
  return 'OTP'
}

export default function ForgotCredentialsPage() {
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('identify')
  const [sessionToken, setSessionToken] = useState('')

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [availableMethods, setAvailableMethods] = useState<AuthType[]>(['otp'])
  const [verifyMethod, setVerifyMethod] = useState<AuthType>('otp')
  const [lastLoginMethod, setLastLoginMethod] = useState<AuthType | null>(null)

  const [verifySecret, setVerifySecret] = useState('')
  const [otpChannel, setOtpChannel] = useState<'email' | 'phone'>('email')
  const [otpSent, setOtpSent] = useState(false)
  const [verifyOtp, setVerifyOtp] = useState('')
  const [devOtp, setDevOtp] = useState<DevOtpHint | null>(null)

  const [authType, setAuthType] = useState<AuthType>('password')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')

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
        phone: formatPhoneForApi(phone),
      })
      setInfoMessage(res.message)
      if (res.sessionToken) {
        setSessionToken(res.sessionToken)
        const methods: AuthType[] =
          res.availableMethods?.filter(
            (m): m is AuthType => m === 'otp' || m === 'password' || m === 'pin'
          ) ?? ['otp']
        const resolvedMethods = methods.length > 0 ? methods : (['otp'] as AuthType[])
        setAvailableMethods(resolvedMethods)
        const suggested: AuthType =
          res.suggestedMethod &&
          (res.suggestedMethod === 'otp' ||
            res.suggestedMethod === 'password' ||
            res.suggestedMethod === 'pin') &&
          resolvedMethods.includes(res.suggestedMethod)
            ? res.suggestedMethod
            : resolvedMethods[0]
        setVerifyMethod(suggested)
        setLastLoginMethod(res.lastLoginMethod ?? null)
        setVerifySecret('')
        setVerifyOtp('')
        setOtpSent(false)
        setDevOtp(null)
        setStep('verify')
      }
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not start reset'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendVerifyOtp = async () => {
    if (!sessionToken) return
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const res = await authAPI.resetSendOtp(sessionToken, otpChannel)
      setDevOtp(res.devOtp ?? null)
      setVerifyOtp('')
      setOtpSent(true)
      setInfoMessage(res.message)
    } catch (err) {
      setSubmitError(axiosError(err, 'Could not send code'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifySubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (verifyMethod === 'otp') {
      if (!otpSent) {
        setSubmitError('Send a verification code first')
        return
      }
      const otpErr = validateOtp(verifyOtp)
      if (otpErr) {
        setSubmitError(otpErr)
        return
      }
    } else if (!verifySecret) {
      setSubmitError(`${methodLabel(verifyMethod)} is required`)
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.resetVerify({
        sessionToken,
        verifyMethod,
        secret: verifyMethod !== 'otp' ? verifySecret : undefined,
        otp: verifyMethod === 'otp' ? verifyOtp.trim() : undefined,
      })
      setStep('credential')
      setInfoMessage('Verified. Add or update a password or PIN (existing methods stay active).')
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
          Verify your identity using any sign-in method on your account. Your last used method is
          suggested first.
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
            <PhoneInput
              id="reset-phone"
              label="Mobile number"
              value={phone}
              onChange={setPhone}
              disabled={isSubmitting}
              hint="Must match the mobile on your account (+91)"
            />
            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Continuing…' : 'Continue'}
            </button>
          </form>
        ) : null}

        {step === 'verify' && sessionToken ? (
          <form className="auth-form" onSubmit={handleVerifySubmit} noValidate>
            {lastLoginMethod ? (
              <p className="item-description">
                Last sign-in method: <strong>{methodLabel(lastLoginMethod)}</strong>
              </p>
            ) : null}

            <fieldset className="auth-type-picker auth-type-picker--inline auth-method-tabs">
              <legend className="visually-hidden">Verify with</legend>
              {availableMethods.map((method) => (
                <label key={method}>
                  <input
                    type="radio"
                    name="verifyMethod"
                    checked={verifyMethod === method}
                    onChange={() => {
                      setVerifyMethod(method)
                      setVerifySecret('')
                      setVerifyOtp('')
                      setOtpSent(false)
                      setSubmitError('')
                    }}
                    disabled={isSubmitting}
                  />
                  {methodLabel(method)}
                </label>
              ))}
            </fieldset>

            {verifyMethod === 'otp' ? (
              <>
                <fieldset className="auth-type-picker auth-type-picker--inline">
                  <legend className="visually-hidden">OTP channel</legend>
                  <label>
                    <input
                      type="radio"
                      name="otpChannel"
                      checked={otpChannel === 'email'}
                      onChange={() => {
                        setOtpChannel('email')
                        setOtpSent(false)
                        setVerifyOtp('')
                      }}
                      disabled={isSubmitting}
                    />
                    Email
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="otpChannel"
                      checked={otpChannel === 'phone'}
                      onChange={() => {
                        setOtpChannel('phone')
                        setOtpSent(false)
                        setVerifyOtp('')
                      }}
                      disabled={isSubmitting}
                    />
                    SMS
                  </label>
                </fieldset>
                <button
                  type="button"
                  className="back-button auth-link-btn"
                  onClick={() => void handleSendVerifyOtp()}
                  disabled={isSubmitting}
                >
                  {otpSent ? 'Resend code' : 'Send verification code'}
                </button>
                {devOtp?.code ? (
                  <div className="dev-otp-banner" role="status">
                    <p>
                      <strong>Local development — verification code</strong>
                    </p>
                    <p>
                      Use <strong>{devOtp.code}</strong>
                    </p>
                  </div>
                ) : null}
                {otpSent ? (
                  <OtpInput
                    id="reset-verify-otp"
                    label={`${otpChannel === 'email' ? 'Email' : 'SMS'} verification code`}
                    value={verifyOtp}
                    onChange={setVerifyOtp}
                    disabled={isSubmitting}
                  />
                ) : null}
              </>
            ) : (
              <SecretField
                id="reset-verify-secret"
                label={methodLabel(verifyMethod)}
                value={verifySecret}
                onChange={setVerifySecret}
                variant={verifyMethod === 'pin' ? 'pin' : 'password'}
                disabled={isSubmitting}
              />
            )}

            <button type="submit" className="proceed-payment-button auth-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying…' : 'Verify identity'}
            </button>
          </form>
        ) : null}

        {step === 'credential' ? (
          <form className="auth-form" onSubmit={handleCredentialSubmit} noValidate>
            <fieldset className="auth-type-picker">
              <legend>Add or update</legend>
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
              <SecretField
                id="reset-password"
                label="New password"
                value={password}
                onChange={setPassword}
                variant="password"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            ) : (
              <SecretField
                id="reset-pin"
                label="New PIN"
                value={pin}
                onChange={setPin}
                variant="pin"
                autoComplete="new-password"
                disabled={isSubmitting}
              />
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

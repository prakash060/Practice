import { useState, type InputHTMLAttributes } from 'react'

type SecretVariant = 'password' | 'pin' | 'otp' | 'passcode'

interface SecretFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  variant?: SecretVariant
  disabled?: boolean
  error?: string
  hint?: string
  placeholder?: string
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete']
  maxLength?: number
}

export function SecretField({
  id,
  label,
  value,
  onChange,
  variant = 'password',
  disabled,
  error,
  hint,
  placeholder,
  autoComplete,
  maxLength,
}: SecretFieldProps) {
  const [visible, setVisible] = useState(false)
  const isNumeric = variant === 'pin' || variant === 'otp' || variant === 'passcode'
  const resolvedMaxLength = maxLength ?? (variant === 'pin' ? 6 : variant === 'otp' ? 6 : variant === 'passcode' ? 8 : undefined)

  const defaultAutoComplete =
    variant === 'password'
      ? 'current-password'
      : variant === 'pin'
        ? 'off'
        : variant === 'passcode'
          ? 'one-time-code'
          : 'one-time-code'

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="secret-input">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          inputMode={isNumeric ? 'numeric' : undefined}
          autoComplete={autoComplete ?? defaultAutoComplete}
          maxLength={resolvedMaxLength}
          placeholder={placeholder}
          value={value}
          onChange={(ev) => {
            const raw = ev.target.value
            if (isNumeric) {
              onChange(raw.replace(/\D/g, '').slice(0, resolvedMaxLength ?? raw.length))
            } else {
              onChange(raw)
            }
          }}
          disabled={disabled}
          className={error ? 'input--error' : undefined}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          className="secret-input__toggle"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide value' : 'Show value'}
          aria-pressed={visible}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint ? <p className="item-description">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}

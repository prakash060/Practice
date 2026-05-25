import { useState } from 'react'

interface OtpInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: string
  hint?: string
}

export function OtpInput({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
  hint,
}: OtpInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="secret-input">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6-digit code"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          disabled={disabled}
          className={error ? 'input--error' : undefined}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          className="secret-input__toggle"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? 'Hide code' : 'Show code'}
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

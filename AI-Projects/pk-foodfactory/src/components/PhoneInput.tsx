import {
  DEFAULT_COUNTRY_CODE,
  sanitizeLocalPhoneInput,
} from '../utils/phoneCountry'

interface PhoneInputProps {
  id: string
  label: string
  value: string
  onChange: (localDigits: string) => void
  countryCode?: string
  disabled?: boolean
  error?: string
  hint?: string
  placeholder?: string
}

export function PhoneInput({
  id,
  label,
  value,
  onChange,
  countryCode = DEFAULT_COUNTRY_CODE,
  disabled,
  error,
  hint,
  placeholder = '10-digit mobile number',
}: PhoneInputProps) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className={`phone-input${error ? ' phone-input--error' : ''}`}>
        <span className="phone-input__prefix" aria-hidden="true">
          {countryCode}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={value}
          onChange={(ev) => onChange(sanitizeLocalPhoneInput(ev.target.value))}
          disabled={disabled}
          className={error ? 'input--error' : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="item-description">
          {hint}
        </p>
      ) : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}

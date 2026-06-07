import {
  DEFAULT_COUNTRY_CODE,
  sanitizeIdentifierInput,
  shouldShowPhoneCountryPrefix,
} from '../utils/phoneCountry'

interface IdentifierInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  countryCode?: string
  disabled?: boolean
  error?: string
  hint?: string
  placeholder?: string
}

export function IdentifierInput({
  id,
  label,
  value,
  onChange,
  countryCode = DEFAULT_COUNTRY_CODE,
  disabled,
  error,
  hint,
  placeholder = 'Email or 10-digit mobile',
}: IdentifierInputProps) {
  const showPrefix = shouldShowPhoneCountryPrefix(value)

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div
        className={`phone-input identifier-input${error ? ' phone-input--error' : ''}${!showPrefix ? ' identifier-input--full' : ''}`}
      >
        {showPrefix ? (
          <span className="phone-input__prefix" aria-hidden="true">
            {countryCode}
          </span>
        ) : null}
        <input
          id={id}
          type="text"
          inputMode={showPrefix ? 'tel' : 'email'}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          placeholder={placeholder}
          value={value}
          onChange={(ev) => onChange(sanitizeIdentifierInput(ev.target.value))}
          disabled={disabled}
          className={error ? 'input--error' : undefined}
          aria-invalid={Boolean(error)}
        />
      </div>
      {hint ? <p className="item-description">{hint}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  )
}

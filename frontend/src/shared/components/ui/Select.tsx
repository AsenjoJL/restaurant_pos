import type { SelectHTMLAttributes } from 'react'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  helperText?: string
  error?: string
  options: SelectOption[]
}

function Select({
  label,
  helperText,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name
  return (
    <label className="input-field">
      {label ? <span className="input-label">{label}</span> : null}
      <select
        id={selectId}
        className={`select ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="input-error-text">{error}</span> : null}
      {helperText && !error ? <span className="input-helper">{helperText}</span> : null}
    </label>
  )
}

export default Select

import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helperText?: string
  error?: string
}

function Input({ label, helperText, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? props.name
  return (
    <label className="input-field">
      {label ? <span className="input-label">{label}</span> : null}
      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error ? <span className="input-error-text">{error}</span> : null}
      {helperText && !error ? <span className="input-helper">{helperText}</span> : null}
    </label>
  )
}

export default Input

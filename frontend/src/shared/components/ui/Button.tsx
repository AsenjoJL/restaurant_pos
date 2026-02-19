import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'lg'
type ButtonIconPosition = 'left' | 'right'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  icon?: string
  iconPosition?: ButtonIconPosition
}

const getVariantClass = (variant: ButtonVariant) => {
  switch (variant) {
    case 'secondary':
      return 'btn-secondary'
    case 'outline':
      return 'btn-outline'
    case 'ghost':
      return 'btn-ghost'
    case 'danger':
      return 'btn-danger'
    case 'primary':
    default:
      return 'btn-primary'
  }
}

const getSizeClass = (size: ButtonSize) => (size === 'lg' ? 'btn-lg' : 'btn-md')

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const iconMarkup = icon ? (
    <span className="material-symbols-rounded btn-icon" aria-hidden="true">
      {icon}
    </span>
  ) : null
  return (
    <button
      type={type}
      className={`btn ${getVariantClass(variant)} ${getSizeClass(size)} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <span className="spinner" aria-hidden="true" /> : null}
      {iconMarkup && iconPosition === 'left' ? iconMarkup : null}
      <span className="btn-label">{children}</span>
      {iconMarkup && iconPosition === 'right' ? iconMarkup : null}
    </button>
  )
}

export default Button

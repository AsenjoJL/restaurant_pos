import type { ReactNode } from 'react'
import type { OrderStatus } from '../../types/order'

type BadgeProps = {
  variant: OrderStatus
  children: ReactNode
  icon?: string
}

const statusIcons: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'payments',
  HOLD: 'pause_circle',
  PAID: 'verified',
  SENT_TO_KITCHEN: 'send',
  PREPARING: 'restaurant',
  READY_FOR_PICKUP: 'check_circle',
  COMPLETED: 'done_all',
  CANCELLED: 'cancel',
}

function Badge({ variant, children, icon }: BadgeProps) {
  const className = `badge badge-${variant.toLowerCase().replace(/_/g, '-')}`
  const iconName = icon ?? statusIcons[variant] ?? 'info'
  return (
    <span className={className}>
      <span className="material-symbols-rounded badge-icon" aria-hidden="true">
        {iconName}
      </span>
      <span>{children}</span>
    </span>
  )
}

export default Badge

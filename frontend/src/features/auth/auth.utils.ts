import type { Role } from './auth.types'

export function formatPosTime(date = new Date()): string {
  const hours24 = date.getHours()
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours12}:${minutes} ${period}`
}

export function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'kitchen':
      return '/kitchen'
    case 'cashier':
    default:
      return '/pos'
  }
}

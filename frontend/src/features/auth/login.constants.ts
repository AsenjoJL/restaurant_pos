import type { Role } from './auth.types'

type RoleCard = {
  id: Role
  name: string
  description: string
  iconSrc: string
}

export const ROLE_CARD_BY_ID: Record<Role, RoleCard> = {
  cashier: {
    id: 'cashier',
    name: 'Cashier',
    description: 'Take payments and issue receipts',
    iconSrc: '/cashier.png',
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Manage orders and ticket queue',
    iconSrc: '/kitchen.png',
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Menu, staff, and system settings',
    iconSrc: '/admin.png',
  },
}

export const ROLE_CARDS: RoleCard[] = [
  ROLE_CARD_BY_ID.cashier,
  ROLE_CARD_BY_ID.kitchen,
  ROLE_CARD_BY_ID.admin,
]

export const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', '⌫'] as const

export type NumpadKey = (typeof NUMPAD_KEYS)[number]

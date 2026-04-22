import type { Role } from '../../features/auth/auth.types'

export type MockUser = {
  id: string
  name: string
  role: Role
  username: string
  pin: string
}

export const users: MockUser[] = [
  { id: 'u-1', name: 'Lester Admin', role: 'admin', username: 'admin', pin: '1111' },
  { id: 'u-2', name: 'John Cashier', role: 'cashier', username: 'cashier', pin: '2222' },
  { id: 'u-3', name: 'Asenjo Kitchen', role: 'kitchen', username: 'kitchen', pin: '3333' },
]


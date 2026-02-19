export type Role = 'admin' | 'cashier' | 'kitchen'

export type User = {
  id: string
  name: string
  role: Role
}

export type AuthSession = {
  token: string
  user: User
}

import { users } from '../../../mock/data'
import type { AuthSession } from '../auth.types'

type LoginPayload = {
  username: string
  password: string
}

export const authService = {
  login: async ({ username, password }: LoginPayload): Promise<AuthSession> => {
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedPassword = password.trim()
    const match = users.find(
      (user) =>
        user.username.toLowerCase() === normalizedUsername && user.pin === normalizedPassword,
    )

    if (!match) {
      throw new Error('Invalid credentials')
    }

    return {
      token: 'mock-session-token',
      user: {
        id: match.id,
        name: match.name,
        role: match.role,
      },
    }
  },
}

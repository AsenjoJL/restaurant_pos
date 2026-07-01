import { apiFetch, ensureSanctumSession } from '../../../shared/api/http'
import type { AuthSession } from '../auth.types'

type LoginPayload = {
  username: string
  password: string
}

export const authService = {
  login: async ({ username, password }: LoginPayload): Promise<AuthSession> => {
    await ensureSanctumSession()

    const response = await apiFetch<{
      token: string
      user: {
        id: string
        name: string
        role: string
      }
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })

    return {
      token: response.token,
      user: {
        id: response.user.id,
        name: response.user.name,
        role: response.user.role as AuthSession['user']['role'],
      },
    }
  },
  getCurrentSession: async (): Promise<AuthSession> => {
    const response = await apiFetch<{
      user: {
        id: string
        name: string
        role: string
      }
    }>('/api/v1/auth/me')

    return {
      token: 'sanctum-session',
      user: {
        id: response.user.id,
        name: response.user.name,
        role: response.user.role as AuthSession['user']['role'],
      },
    }
  },
}

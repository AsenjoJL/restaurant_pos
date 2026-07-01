import { env } from '../../app/config/env'

type ApiOptions = RequestInit & {
  expectNoContent?: boolean
}

type LaravelErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

const buildUrl = (path: string) =>
  `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`

export const resolveApiAssetUrl = (path: string | null | undefined) => {
  const value = path?.trim()
  if (!value) {
    return null
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('blob:') || value.startsWith('data:')) {
    return value
  }

  return buildUrl(value)
}

const readCookie = (name: string) => {
  const pattern = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))

  if (!pattern) {
    return null
  }

  return decodeURIComponent(pattern.slice(name.length + 1))
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const xsrfToken = readCookie('XSRF-TOKEN')
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const response = await fetch(buildUrl(path), {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const payload = (await response.json()) as LaravelErrorPayload
      if (payload?.message) {
        message = payload.message
      }

      const firstValidationError = payload?.errors
        ? Object.values(payload.errors).flat().find((value) => value.trim().length > 0)
        : null

      if (firstValidationError) {
        message = firstValidationError
      }
    } catch {
      // Keep the default error message when the server does not return JSON.
    }

    throw new Error(message)
  }

  if (options.expectNoContent || response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const ensureSanctumSession = async () => {
  await fetch(buildUrl('/sanctum/csrf-cookie'), {
    credentials: 'include',
  })
}

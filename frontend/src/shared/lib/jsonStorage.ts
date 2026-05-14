export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const parseJson = <T = unknown>(value: string | null): T | null => {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export const readLocalStorageJson = <T = unknown>(key: string): T | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(key)
    return parseJson<T>(raw)
  } catch {
    return null
  }
}

export const writeLocalStorageJson = (key: string, value: unknown) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Local storage can be blocked or full; callers keep in-memory state.
  }
}

export const removeLocalStorageItem = (key: string) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage errors; the UI state has already changed.
  }
}

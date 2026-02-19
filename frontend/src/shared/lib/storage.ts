type StorageKey = 'pos_demo_flag'

export const storage = {
  get: (key: StorageKey): string | null => {
    if (typeof window === 'undefined') {
      return null
    }
    return sessionStorage.getItem(key)
  },
  set: (key: StorageKey, value: string) => {
    if (typeof window === 'undefined') {
      return
    }
    sessionStorage.setItem(key, value)
  },
  remove: (key: StorageKey) => {
    if (typeof window === 'undefined') {
      return
    }
    sessionStorage.removeItem(key)
  },
}

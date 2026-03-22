type NativeKioskPrintOptions = {
  silent?: boolean
}

const getNativeKioskApi = () => {
  if (typeof window === 'undefined') {
    return undefined
  }
  return window.nativeKiosk
}

export const isNativeKioskApp = () => Boolean(getNativeKioskApi()?.isNativeApp)

export const triggerPrint = async (options?: NativeKioskPrintOptions) => {
  const nativeKiosk = getNativeKioskApi()
  if (nativeKiosk?.print) {
    try {
      const success = await nativeKiosk.print({
        silent: options?.silent ?? true,
      })
      if (success) {
        return true
      }
    } catch {
      // Fallback below.
    }
  }

  if (typeof window !== 'undefined') {
    const originalTitle = document.title
    const restoreTitle = () => {
      document.title = originalTitle
      window.removeEventListener('afterprint', restoreTitle)
    }

    document.title = ''
    window.addEventListener('afterprint', restoreTitle)
    window.print()
    window.setTimeout(restoreTitle, 1000)
    return true
  }
  return false
}

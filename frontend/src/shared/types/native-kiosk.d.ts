export {}

declare global {
  interface Window {
    nativeKiosk?: {
      isNativeApp: boolean
      print: (options?: { silent?: boolean }) => Promise<boolean>
    }
  }
}


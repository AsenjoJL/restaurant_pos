import { useContext } from 'react'
import { KioskContext } from './kiosk.state'

export function useKiosk() {
  const context = useContext(KioskContext)
  if (!context) {
    throw new Error('useKiosk must be used within KioskProvider')
  }
  return context
}

export default useKiosk


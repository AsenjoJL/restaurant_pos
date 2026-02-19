import type { ReactNode } from 'react'
import ToastStack from '../../shared/components/ui/ToastStack'

type ToastProviderProps = {
  children: ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastStack />
    </>
  )
}

export default ToastProvider

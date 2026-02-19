import type { ReactNode } from 'react'

type AuthProviderProps = {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>
}

export default AuthProvider

import { useEffect, type ReactNode } from 'react'
import { useAppDispatch } from '../store/hooks'
import { restoreSession } from '../../features/auth/auth.store'

type AuthProviderProps = {
  children: ReactNode
}

function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(restoreSession())
  }, [dispatch])

  return <>{children}</>
}

export default AuthProvider

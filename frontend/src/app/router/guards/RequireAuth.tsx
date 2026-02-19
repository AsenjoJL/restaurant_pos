import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectAuthStatus, selectAuthUser } from '../../../features/auth/auth.selectors'
import AccessDeniedPage from '../../../features/auth/pages/AccessDeniedPage'
import type { Role } from '../../../features/auth/auth.types'

type RequireAuthProps = {
  allowedRoles?: Role[]
  children: ReactNode
}

function RequireAuth({ allowedRoles, children }: RequireAuthProps) {
  const status = useAppSelector(selectAuthStatus)
  const user = useAppSelector(selectAuthUser)

  if (status === 'loading') {
    return (
      <div className="page-center">
        <div className="panel empty-state">
          <h3>Signing you in...</h3>
          <p className="muted">Please wait...</p>
        </div>
      </div>
    )
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDeniedPage />
  }

  return <>{children}</>
}

export default RequireAuth

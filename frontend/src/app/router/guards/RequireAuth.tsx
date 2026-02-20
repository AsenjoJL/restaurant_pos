import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { selectAuthStatus, selectAuthUser } from '../../../features/auth/auth.selectors'
import type { Role } from '../../../features/auth/auth.types'

type RequireAuthProps = {
  allowedRoles?: Role[]
  children: ReactNode
}

const getDefaultRoute = (role: Role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'kitchen':
      return '/kitchen'
    case 'cashier':
    default:
      return '/pos'
  }
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
    return <Navigate to={getDefaultRoute(user.role)} replace />
  }

  return <>{children}</>
}

export default RequireAuth

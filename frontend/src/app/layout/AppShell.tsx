import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectAuthUser } from '../../features/auth/auth.selectors'
import { logout } from '../../features/auth/auth.store'
import type { Role } from '../../features/auth/auth.types'
import Button from '../../shared/components/ui/Button'
import { buildAuditUser, logAuditEvent } from '../../shared/lib/audit'

type AppShellProps = {
  children: ReactNode
}

const APP_NAV_ITEMS: Array<{
  allowedRoles: readonly Role[]
  icon: string
  label: string
  to: string
}> = [
  { label: 'POS', to: '/pos', icon: '/pos.png', allowedRoles: ['admin', 'cashier'] },
  { label: 'Cashier', to: '/orders', icon: '/cashier.png', allowedRoles: ['admin', 'cashier'] },
  { label: 'Kitchen', to: '/kitchen', icon: '/kitchen.png', allowedRoles: ['admin', 'kitchen'] },
  { label: 'Admin', to: '/admin/dashboard', icon: '/admin.png', allowedRoles: ['admin'] },
]

function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const user = useAppSelector(selectAuthUser)
  const role = user?.role
  const visibleNavItems = role
    ? APP_NAV_ITEMS.filter((item) => item.allowedRoles.includes(role))
    : []
  const headerRef = useRef<HTMLElement | null>(null)
  const userInitials = user?.name
    ? user.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : '??'

  const handleLogout = () => {
    logAuditEvent(dispatch, {
      scope: 'AUTH',
      action: 'LOGOUT',
      message: 'User signed out.',
      user: buildAuditUser(user),
    })
    dispatch(logout())
  }

  useEffect(() => {
    const el = headerRef.current
    if (!el) {
      return
    }

    const update = () => {
      const next = Math.round(el.getBoundingClientRect().height)
      // Used by sticky sidebars (Admin) and other layouts that need to offset below the top header.
      document.documentElement.style.setProperty('--app-header-height', `${next}px`)
    }

    update()

    const ro = 'ResizeObserver' in window ? new ResizeObserver(update) : null
    ro?.observe(el)
    window.addEventListener('resize', update)

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const shellClassName = `app-shell${location.pathname.startsWith('/admin') ? ' app-shell--admin' : ''}`

  return (
    <div className={shellClassName}>
      <header ref={headerRef} className="app-header">
        <div className="app-header-left">
          <div className="brand">
            <span className="brand-mark">
              <img src="/Resto.jpg" alt="Asenter Restaurant logo" />
            </span>
            <div>
              <h1>Restaurant POS</h1>
              <p className="muted">Operations dashboard</p>
            </div>
          </div>
        </div>
        <div className="app-header-right">
          <nav className="app-nav">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-active-dot" aria-hidden="true" />
                <img className="nav-icon nav-icon-img" src={item.icon} alt="" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="user-chip">
            <span className="user-avatar" aria-hidden="true">
              {userInitials}
            </span>
            <div>
              <span className="user-name">{user?.name ?? 'Unknown User'}</span>
              <span className="user-role">{user?.role ?? 'unknown'}</span>
            </div>
            <Button variant="ghost" className="header-signout-btn" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

export default AppShell

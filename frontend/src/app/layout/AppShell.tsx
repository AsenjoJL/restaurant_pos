import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectAuthUser } from '../../features/auth/auth.selectors'
import { logout } from '../../features/auth/auth.store'
import Button from '../../shared/components/ui/Button'
import { buildAuditUser, logAuditEvent } from '../../shared/lib/audit'

type AppShellProps = {
  children: ReactNode
}

const navIconMap = {
  pos: '/pos.png',
  cashier: '/cashier.png',
  kitchen: '/kitchen.png',
  admin: '/admin.png',
} as const

function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const role = user?.role
  const isAdmin = role === 'admin'
  const isCashier = role === 'cashier'
  const isKitchen = role === 'kitchen'
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

  return (
    <div className="app-shell">
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
            {(isAdmin || isCashier) && (
              <NavLink
                to="/pos"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-active-dot" aria-hidden="true" />
                <img className="nav-icon nav-icon-img" src={navIconMap.pos} alt="" aria-hidden="true" />
                <span>POS</span>
              </NavLink>
            )}
            {(isAdmin || isCashier) && (
              <NavLink
                to="/orders"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-active-dot" aria-hidden="true" />
                <img
                  className="nav-icon nav-icon-img"
                  src={navIconMap.cashier}
                  alt=""
                  aria-hidden="true"
                />
                <span>Cashier</span>
              </NavLink>
            )}
            {(isAdmin || isKitchen) && (
              <NavLink
                to="/kitchen"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-active-dot" aria-hidden="true" />
                <img
                  className="nav-icon nav-icon-img"
                  src={navIconMap.kitchen}
                  alt=""
                  aria-hidden="true"
                />
                <span>Kitchen</span>
              </NavLink>
            )}
            {isAdmin ? (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-active-dot" aria-hidden="true" />
                <img
                  className="nav-icon nav-icon-img"
                  src={navIconMap.admin}
                  alt=""
                  aria-hidden="true"
                />
                <span>Admin</span>
              </NavLink>
            ) : null}
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

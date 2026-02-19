import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectAuthUser } from '../../features/auth/auth.selectors'
import { logout } from '../../features/auth/auth.store'
import Button from '../../shared/components/ui/Button'

type AppShellProps = {
  children: ReactNode
}

function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const isAdmin = user?.role === 'admin'

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">POS</span>
          <div>
            <h1>Restaurant POS</h1>
            <p className="muted">Operations dashboard</p>
          </div>
        </div>
        <nav className="app-nav">
          <NavLink to="/pos" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="material-symbols-rounded nav-icon" aria-hidden="true">
              point_of_sale
            </span>
            <span>POS</span>
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-rounded nav-icon" aria-hidden="true">
              payments
            </span>
            <span>Cashier</span>
          </NavLink>
          <NavLink
            to="/kitchen"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-rounded nav-icon" aria-hidden="true">
              local_dining
            </span>
            <span>Kitchen</span>
          </NavLink>
          {isAdmin ? (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="material-symbols-rounded nav-icon" aria-hidden="true">
                admin_panel_settings
              </span>
              <span>Admin</span>
            </NavLink>
          ) : null}
        </nav>
        <div className="user-chip">
          <div>
            <span className="user-name">{user?.name ?? 'Unknown User'}</span>
            <span className="user-role">{user?.role ?? 'unknown'}</span>
          </div>
          <Button variant="ghost" onClick={() => dispatch(logout())}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}

export default AppShell

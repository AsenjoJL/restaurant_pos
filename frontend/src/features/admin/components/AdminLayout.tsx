import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ADMIN_NAV_ITEMS } from '../admin.constants'

function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className={`admin-shell${isSidebarOpen ? ' is-sidebar-open' : ''}`}>
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <nav className="admin-nav" id="admin-sidebar-nav">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <img className="admin-nav-icon-img" src={item.icon} alt="" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main" role="main">
        <div className="admin-header">
          <div className="admin-header-title">
            <button
              type="button"
              className="admin-sidebar-toggle"
              aria-label={isSidebarOpen ? 'Close admin navigation' : 'Open admin navigation'}
              aria-expanded={isSidebarOpen}
              aria-controls="admin-sidebar-nav"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                menu
              </span>
            </button>
            <div>
              <h2>Admin Console</h2>
              <p className="muted">Manage menu data, staff, and store settings.</p>
            </div>
          </div>
        </div>
        <Outlet />
      </div>

      <button
        type="button"
        className="admin-sidebar-overlay"
        aria-label="Close admin navigation overlay"
        onClick={closeSidebar}
      />
    </div>
  )
}

export default AdminLayout

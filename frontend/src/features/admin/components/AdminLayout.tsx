import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Products', path: '/admin/products', icon: 'inventory_2' },
  { label: 'Categories', path: '/admin/categories', icon: 'category' },
  { label: 'Inventory', path: '/admin/inventory', icon: 'inventory' },
  { label: 'Recipes', path: '/admin/recipes', icon: 'menu_book' },
  { label: 'Users', path: '/admin/users', icon: 'groups' },
  { label: 'Settings', path: '/admin/settings', icon: 'settings' },
]

function AdminLayout() {
  return (
    <div className="admin-shell">
      <div className="admin-header">
        <div>
          <h2>Admin Console</h2>
          <p className="muted">Manage menu data, staff, and store settings.</p>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <span className="material-symbols-rounded nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}

export default AdminLayout

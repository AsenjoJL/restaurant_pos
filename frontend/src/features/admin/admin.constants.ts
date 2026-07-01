export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: '/dashboard.png' },
  { label: 'Catalog', path: '/admin/catalog', icon: '/catalogue.png' },
  { label: 'Sales', path: '/admin/sales-center', icon: '/saless.webp' },
  { label: 'Inventory', path: '/admin/inventory', icon: '/inventory.png' },
  { label: 'Administration', path: '/admin/administration', icon: '/administrations.png' },
] as const

export const ADMIN_DASHBOARD_TREND_RANGES = ['7D', '30D', '12M'] as const

import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './guards/RequireAuth'
import AppShell from '../layout/AppShell'
import type { Role } from '../../features/auth/auth.types'

const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'))
const PosPage = lazy(() => import('../../features/pos/pages/PosPage'))
const OrdersPage = lazy(() => import('../../features/orders/pages/OrdersPage'))
const KitchenDisplayPage = lazy(() => import('../../features/kitchen/pages/KitchenDisplayPage'))
const KitchenQueueBoardPage = lazy(() => import('../../features/kitchen/pages/KitchenQueueBoardPage'))
const AdminLayout = lazy(() => import('../../features/admin/components/AdminLayout'))
const AdminDashboardPage = lazy(() => import('../../features/admin/pages/AdminDashboardPage'))
const AdminCatalogPage = lazy(() => import('../../features/admin/pages/AdminCatalogPage'))
const AdminSalesPage = lazy(() => import('../../features/sales/pages/AdminSalesPage'))
const AdminSalesCenterPage = lazy(() => import('../../features/admin/pages/AdminSalesCenterPage'))
const AdminProductsPage = lazy(() => import('../../features/admin/pages/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('../../features/admin/pages/AdminCategoriesPage'))
const AdminCashAdjustmentsPage = lazy(
  () => import('../../features/admin/pages/AdminCashAdjustmentsPage'),
)
const AdminReplacementsPage = lazy(() => import('../../features/admin/pages/AdminReplacementsPage'))
const AdminAuditLogsPage = lazy(() => import('../../features/admin/pages/AdminAuditLogsPage'))
const AdminUsersPage = lazy(() => import('../../features/admin/pages/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('../../features/admin/pages/AdminSettingsPage'))
const AdminAdministrationPage = lazy(
  () => import('../../features/admin/pages/AdminAdministrationPage'),
)
const AdminInventoryPage = lazy(() => import('../../features/inventory/pages/AdminInventoryPage'))
const AdminRecipesPage = lazy(() => import('../../features/inventory/pages/AdminRecipesPage'))
const OrderAndInventoryDashboard = lazy(
  () => import('../../features/inventory/pages/OrderAndInventoryDashboard'),
)
const KioskShell = lazy(() => import('../../features/kiosk/components/KioskShell'))
const KioskWelcomePage = lazy(() => import('../../features/kiosk/pages/KioskWelcomePage'))
const KioskMenuPage = lazy(() => import('../../features/kiosk/pages/KioskMenuPage'))
const KioskSuccessPage = lazy(() => import('../../features/kiosk/pages/KioskSuccessPage'))
const KioskPrintSlipPage = lazy(() => import('../../features/kiosk/pages/KioskPrintSlipPage'))

type ProtectedShellRoute = {
  allowedRoles: readonly Role[]
  element: ReactNode
  path: string
}

type AdminChildRoute = {
  element: ReactNode
  path: string
}

const STAFF_ROUTES = [
  {
    path: '/pos',
    allowedRoles: ['admin', 'cashier'],
    element: <PosPage />,
  },
  {
    path: '/orders',
    allowedRoles: ['admin', 'cashier'],
    element: <OrdersPage />,
  },
  {
    path: '/kitchen',
    allowedRoles: ['admin', 'kitchen'],
    element: <KitchenDisplayPage />,
  },
] satisfies ProtectedShellRoute[]

const ADMIN_ROLES = ['admin'] as const

const ADMIN_CHILD_ROUTES = [
  { path: 'dashboard', element: <AdminDashboardPage /> },
  { path: 'catalog', element: <AdminCatalogPage /> },
  { path: 'orders-dashboard', element: <OrderAndInventoryDashboard /> },
  { path: 'sales-center', element: <AdminSalesCenterPage /> },
  { path: 'sales', element: <AdminSalesPage /> },
  { path: 'products', element: <AdminProductsPage /> },
  { path: 'categories', element: <AdminCategoriesPage /> },
  { path: 'replacements', element: <AdminReplacementsPage /> },
  { path: 'cash-adjustments', element: <AdminCashAdjustmentsPage /> },
  { path: 'audit-logs', element: <AdminAuditLogsPage /> },
  { path: 'inventory', element: <AdminInventoryPage /> },
  { path: 'recipes', element: <AdminRecipesPage /> },
  { path: 'users', element: <AdminUsersPage /> },
  { path: 'settings', element: <AdminSettingsPage /> },
  { path: 'administration', element: <AdminAdministrationPage /> },
] satisfies AdminChildRoute[]

function RouteLoadingFallback() {
  return (
    <div className="page-center">
      <div className="panel empty-state">
        <h3>Loading page...</h3>
        <p className="muted">Preparing the next screen.</p>
      </div>
    </div>
  )
}

function ProtectedShell({
  allowedRoles,
  children,
}: {
  allowedRoles: readonly Role[]
  children: ReactNode
}) {
  return (
    <RequireAuth allowedRoles={allowedRoles}>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  )
}

function AppRouter() {
  const useHashRouter =
    import.meta.env.VITE_ROUTER_MODE === 'hash' ||
    (typeof window !== 'undefined' && window.location.protocol === 'file:')
  const Router = useHashRouter ? HashRouter : BrowserRouter

  return (
    <Router>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/kiosk" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/KDS" element={<KitchenQueueBoardPage />} />
          <Route path="/kds-board" element={<Navigate to="/KDS" replace />} />
          <Route path="/kiosk" element={<KioskShell />}>
            <Route index element={<KioskWelcomePage />} />
            <Route path="order-type" element={<Navigate to="/kiosk" replace />} />
            <Route path="menu" element={<KioskMenuPage />} />
            <Route path="cart" element={<Navigate to="/kiosk/menu" replace />} />
            <Route path="confirm" element={<Navigate to="/kiosk/menu" replace />} />
            <Route path="success/:orderNo" element={<KioskSuccessPage />} />
            <Route path="print/:orderNo" element={<KioskPrintSlipPage />} />
          </Route>

          {STAFF_ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedShell allowedRoles={route.allowedRoles}>
                  {route.element}
                </ProtectedShell>
              }
            />
          ))}

          <Route
            path="/admin"
            element={
              <ProtectedShell allowedRoles={ADMIN_ROLES}>
                <AdminLayout />
              </ProtectedShell>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            {ADMIN_CHILD_ROUTES.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Route>

          <Route path="*" element={<Navigate to="/kiosk" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRouter

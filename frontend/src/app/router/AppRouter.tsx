import { Suspense, lazy } from 'react'
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './guards/RequireAuth'
import AppShell from '../layout/AppShell'

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
          <Route
            path="/pos"
            element={
              <RequireAuth allowedRoles={['admin', 'cashier']}>
                <AppShell>
                  <PosPage />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth allowedRoles={['admin', 'cashier']}>
                <AppShell>
                  <OrdersPage />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/kitchen"
            element={
              <RequireAuth allowedRoles={['admin', 'kitchen']}>
                <AppShell>
                  <KitchenDisplayPage />
                </AppShell>
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
              element={
                <RequireAuth allowedRoles={['admin']}>
                  <AppShell>
                    <AdminLayout />
                  </AppShell>
                </RequireAuth>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="catalog" element={<AdminCatalogPage />} />
            <Route path="orders-dashboard" element={<OrderAndInventoryDashboard />} />
            <Route path="sales-center" element={<AdminSalesCenterPage />} />
            <Route path="sales" element={<AdminSalesPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="replacements" element={<AdminReplacementsPage />} />
            <Route path="cash-adjustments" element={<AdminCashAdjustmentsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="recipes" element={<AdminRecipesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="administration" element={<AdminAdministrationPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/kiosk" replace />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRouter

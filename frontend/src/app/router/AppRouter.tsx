import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './guards/RequireAuth'
import AppShell from '../layout/AppShell'
import LoginPage from '../../features/auth/pages/LoginPage'
import PosPage from '../../features/pos/pages/PosPage'
import OrdersPage from '../../features/orders/pages/OrdersPage'
import KitchenDisplayPage from '../../features/kitchen/pages/KitchenDisplayPage'
import AdminLayout from '../../features/admin/components/AdminLayout'
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage'
import AdminProductsPage from '../../features/admin/pages/AdminProductsPage'
import AdminCategoriesPage from '../../features/admin/pages/AdminCategoriesPage'
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage'
import AdminSettingsPage from '../../features/admin/pages/AdminSettingsPage'
import KioskShell from '../../features/kiosk/components/KioskShell'
import KioskWelcomePage from '../../features/kiosk/pages/KioskWelcomePage'
import KioskOrderTypePage from '../../features/kiosk/pages/KioskOrderTypePage'
import KioskMenuPage from '../../features/kiosk/pages/KioskMenuPage'
import KioskCartPage from '../../features/kiosk/pages/KioskCartPage'
import KioskConfirmPage from '../../features/kiosk/pages/KioskConfirmPage'
import KioskSuccessPage from '../../features/kiosk/pages/KioskSuccessPage'
import KioskPrintSlipPage from '../../features/kiosk/pages/KioskPrintSlipPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/kiosk" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/kiosk" element={<KioskShell />}>
          <Route index element={<KioskWelcomePage />} />
          <Route path="order-type" element={<KioskOrderTypePage />} />
          <Route path="menu" element={<KioskMenuPage />} />
          <Route path="cart" element={<KioskCartPage />} />
          <Route path="confirm" element={<KioskConfirmPage />} />
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
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/kiosk" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

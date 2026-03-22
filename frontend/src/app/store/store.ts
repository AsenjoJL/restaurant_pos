import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../features/auth/auth.store'
import posReducer from '../../features/pos/pos.store'
import uiReducer from '../../shared/store/ui.store'
import ordersReducer from '../../features/orders/orders.store'
import adminReducer from '../../features/admin/admin.store'
import inventoryReducer from '../../features/inventory/inventory.store'
import cashReducer from '../../features/cash/cash.store'
import salesReducer from '../../features/sales/sales.store'
import auditReducer from '../../shared/store/audit.store'
import { setupStoreCrossTabSync, setupStorePersistence } from './store.sync'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pos: posReducer,
    orders: ordersReducer,
    ui: uiReducer,
    admin: adminReducer,
    inventory: inventoryReducer,
    cashAdjustments: cashReducer,
    sales: salesReducer,
    audit: auditReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

if (typeof window !== 'undefined') {
  setupStorePersistence(store)
  setupStoreCrossTabSync(store)
}

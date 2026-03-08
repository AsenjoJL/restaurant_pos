import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../features/auth/auth.store'
import posReducer from '../../features/pos/pos.store'
import uiReducer from '../../shared/store/ui.store'
import ordersReducer, { ORDERS_STORAGE_KEY, setOrders } from '../../features/orders/orders.store'
import adminReducer from '../../features/admin/admin.store'
import inventoryReducer, {
  INVENTORY_STORAGE_KEY,
  setInventoryState,
} from '../../features/inventory/inventory.store'
import cashReducer, {
  CASH_STORAGE_KEY,
  hydrateCashState,
} from '../../features/cash/cash.store'
import salesReducer, {
  SALES_STORAGE_KEY,
  setSalesRecords,
} from '../../features/sales/sales.store'
import auditReducer, {
  AUDIT_STORAGE_KEY,
  setAuditEntries,
} from '../../shared/store/audit.store'

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
  store.subscribe(() => {
    try {
      const state = store.getState()
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(state.orders.list))
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state.inventory))
      localStorage.setItem(CASH_STORAGE_KEY, JSON.stringify(state.cashAdjustments))
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(state.sales.records))
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(state.audit))
    } catch {
      // ignore storage errors
    }
  })

  window.addEventListener('storage', (event) => {
    if (event.key === ORDERS_STORAGE_KEY) {
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : []
        if (Array.isArray(parsed)) {
          store.dispatch(setOrders(parsed))
        }
      } catch {
        // ignore parse errors
      }
    }

    if (event.key === CASH_STORAGE_KEY) {
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : null
        if (parsed) {
          store.dispatch(hydrateCashState(parsed))
        }
      } catch {
        // ignore parse errors
      }
    }

    if (event.key === INVENTORY_STORAGE_KEY) {
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : null
        if (parsed?.ingredients && parsed?.recipes) {
          store.dispatch(setInventoryState(parsed))
        }
      } catch {
        // ignore parse errors
      }
    }

    if (event.key === AUDIT_STORAGE_KEY) {
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : null
        if (parsed?.entries && Array.isArray(parsed.entries)) {
          store.dispatch(setAuditEntries(parsed.entries))
        }
      } catch {
        // ignore parse errors
      }
    }

    if (event.key === SALES_STORAGE_KEY) {
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : null
        if (Array.isArray(parsed)) {
          store.dispatch(setSalesRecords(parsed))
        }
      } catch {
        // ignore parse errors
      }
    }
  })
}

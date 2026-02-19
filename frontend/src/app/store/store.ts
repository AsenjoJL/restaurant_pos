import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../features/auth/auth.store'
import posReducer from '../../features/pos/pos.store'
import uiReducer from '../../shared/store/ui.store'
import ordersReducer, { ORDERS_STORAGE_KEY, setOrders } from '../../features/orders/orders.store'
import adminReducer from '../../features/admin/admin.store'
import inventoryReducer from '../../features/inventory/inventory.store'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pos: posReducer,
    orders: ordersReducer,
    ui: uiReducer,
    admin: adminReducer,
    inventory: inventoryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    try {
      const state = store.getState()
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(state.orders.list))
    } catch {
      // ignore storage errors
    }
  })

  window.addEventListener('storage', (event) => {
    if (event.key !== ORDERS_STORAGE_KEY) {
      return
    }
    try {
      const parsed = event.newValue ? JSON.parse(event.newValue) : []
      if (Array.isArray(parsed)) {
        store.dispatch(setOrders(parsed))
      }
    } catch {
      // ignore parse errors
    }
  })
}

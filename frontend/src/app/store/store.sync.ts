import {
  ADMIN_STORAGE_KEY,
  setAdminState,
} from '../../features/admin/admin.store'
import {
  CASH_STORAGE_KEY,
  hydrateCashState,
} from '../../features/cash/cash.store'
import {
  INVENTORY_STORAGE_KEY,
  setInventoryState,
} from '../../features/inventory/inventory.store'
import {
  ORDERS_STORAGE_KEY,
  setOrders,
} from '../../features/orders/orders.store'
import {
  SALES_STORAGE_KEY,
  setSalesRecords,
} from '../../features/sales/sales.store'
import {
  AUDIT_STORAGE_KEY,
  setAuditEntries,
} from '../../shared/store/audit.store'

type OrdersPayload = Parameters<typeof setOrders>[0]
type CashPayload = Parameters<typeof hydrateCashState>[0]
type InventoryPayload = Parameters<typeof setInventoryState>[0]
type AuditPayload = Parameters<typeof setAuditEntries>[0]
type SalesPayload = Parameters<typeof setSalesRecords>[0]
type AdminPayload = Parameters<typeof setAdminState>[0]

type StoreStateShape = {
  orders: { list: unknown[] }
  inventory: unknown
  cashAdjustments: unknown
  sales: { records: unknown[] }
  audit: unknown
  admin: unknown
}

type AppStoreLike = {
  getState: () => StoreStateShape
  dispatch: (action: unknown) => unknown
  subscribe: (listener: () => void) => () => void
}

const safeParse = (value: string | null) => {
  if (!value) {
    return null
  }
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const setupStorePersistence = (store: AppStoreLike) =>
  store.subscribe(() => {
    try {
      const state = store.getState()
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(state.orders.list))
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state.inventory))
      localStorage.setItem(CASH_STORAGE_KEY, JSON.stringify(state.cashAdjustments))
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(state.sales.records))
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(state.audit))
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(state.admin))
    } catch {
      // ignore storage errors
    }
  })

export const setupStoreCrossTabSync = (store: AppStoreLike) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === ORDERS_STORAGE_KEY) {
      const parsed = safeParse(event.newValue)
      if (Array.isArray(parsed)) {
        store.dispatch(setOrders(parsed as OrdersPayload))
      }
      return
    }

    if (event.key === CASH_STORAGE_KEY) {
      const parsed = safeParse(event.newValue)
      if (isRecord(parsed)) {
        store.dispatch(hydrateCashState(parsed as CashPayload))
      }
      return
    }

    if (event.key === INVENTORY_STORAGE_KEY) {
      const parsed = safeParse(event.newValue)
      if (
        isRecord(parsed) &&
        'ingredients' in parsed &&
        'recipes' in parsed &&
        'adjustments' in parsed
      ) {
        store.dispatch(setInventoryState(parsed as InventoryPayload))
      }
      return
    }

    if (event.key === AUDIT_STORAGE_KEY) {
      const parsed = safeParse(event.newValue)
      if (isRecord(parsed) && Array.isArray(parsed.entries)) {
        store.dispatch(setAuditEntries(parsed.entries as AuditPayload))
      }
      return
    }

    if (event.key === SALES_STORAGE_KEY) {
      const parsed = safeParse(event.newValue)
      if (Array.isArray(parsed)) {
        store.dispatch(setSalesRecords(parsed as SalesPayload))
      }
      return
    }

    if (event.key === ADMIN_STORAGE_KEY) {
      const parsed = safeParse(event.newValue)
      if (
        isRecord(parsed) &&
        'categories' in parsed &&
        'products' in parsed &&
        'users' in parsed &&
        'settings' in parsed
      ) {
        store.dispatch(setAdminState(parsed as AdminPayload))
      }
    }
  }

  window.addEventListener('storage', handleStorage)
  return () => window.removeEventListener('storage', handleStorage)
}

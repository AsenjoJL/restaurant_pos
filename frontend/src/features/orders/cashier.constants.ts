import type { CashierTab } from './cashier.logic'

export const CASHIER_TAB_ORDER: CashierTab[] = ['unpaid', 'paid', 'ready', 'completed']

export const CASHIER_TAB_COPY: Record<
  CashierTab,
  {
    emptyTitle: string
    filterLabel: string
  }
> = {
  unpaid: {
    emptyTitle: 'Pending Payment',
    filterLabel: 'Pending Payment',
  },
  paid: {
    emptyTitle: 'Paid Orders',
    filterLabel: 'Paid Orders',
  },
  ready: {
    emptyTitle: 'Ready for Pickup',
    filterLabel: 'Ready for Pickup',
  },
  completed: {
    emptyTitle: 'Completed Orders',
    filterLabel: 'Completed Orders',
  },
}

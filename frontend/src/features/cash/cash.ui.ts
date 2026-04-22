import { formatCurrency } from '../../shared/lib/format'
import { isPaymentCaptured } from '../../shared/lib/orders'
import type { Order } from '../../shared/types/order'
import type {
  CashAdjustmentType,
  CashDrawerEntryType,
  CashDrawerShift,
} from '../../shared/types/cash'

export const CASH_ADJUSTMENT_TYPE_OPTIONS: Array<{ value: CashAdjustmentType; label: string }> = [
  { value: 'SHORTAGE', label: 'Shortage' },
  { value: 'OVERAGE', label: 'Overage' },
]

export const CASH_DRAWER_ENTRY_TYPE_OPTIONS: Array<{ value: CashDrawerEntryType; label: string }> = [
  { value: 'IN', label: 'Cash In' },
  { value: 'OUT', label: 'Cash Out' },
]

export const buildCashAdjustmentOrderOptions = (orders: Order[]) => [
  { value: '', label: 'No related order' },
  ...orders.map((order) => ({
    value: order.id,
    label: `${order.order_no} · ${formatCurrency(order.total)}`,
  })),
]

export const parseCashAmount = (value: string) => {
  const amount = Number(value)
  return Number.isNaN(amount) ? null : amount
}

export const getActiveCashDrawerShift = (
  shifts: CashDrawerShift[],
  activeShiftId: string | null,
) => shifts.find((shift) => shift.id === activeShiftId) ?? null

export const buildCashDrawerTotals = ({
  activeShift,
  orders,
}: {
  activeShift: CashDrawerShift | null
  orders: Order[]
}) => {
  if (!activeShift) {
    return {
      cashInTotal: 0,
      cashOutTotal: 0,
      cashSalesTotal: 0,
      expectedCash: 0,
    }
  }

  const cashInTotal = activeShift.entries
    .filter((entry) => entry.type === 'IN')
    .reduce((sum, entry) => sum + entry.amount, 0)
  const cashOutTotal = activeShift.entries
    .filter((entry) => entry.type === 'OUT')
    .reduce((sum, entry) => sum + entry.amount, 0)

  const shiftStart = new Date(activeShift.openedAt).getTime()
  const shiftEnd = activeShift.closedAt
    ? new Date(activeShift.closedAt).getTime()
    : Number.POSITIVE_INFINITY

  const cashSalesTotal = orders.reduce((sum, order) => {
    if (order.payment_method !== 'CASH' || !isPaymentCaptured(order)) {
      return sum
    }
    const paymentEntry = order.audit_log.find((entry) => entry.action === 'PAYMENT')
    if (!paymentEntry) {
      return sum
    }
    const paidAt = new Date(paymentEntry.at).getTime()
    if (paidAt < shiftStart || paidAt > shiftEnd) {
      return sum
    }
    const paidAmount = order.payment_amount ?? order.total
    const change = order.payment_change ?? 0
    return sum + Math.max(0, paidAmount - change)
  }, 0)

  return {
    cashInTotal,
    cashOutTotal,
    cashSalesTotal,
    expectedCash: activeShift.openingFloat + cashInTotal - cashOutTotal + cashSalesTotal,
  }
}

import { useCallback, useDeferredValue, useMemo } from 'react'
import type { Order } from '../../shared/types/order'
import type { SalesRecord } from '../../shared/types/sales'
import type { PaymentMethod } from '../../shared/types/order'

export type SalesUiStatus = 'PAID' | 'PENDING' | 'VOIDED' | 'CANCELLED'

type SalesModelFilters = {
  query: string
  methodFilter: string
  statusFilter: string
  startDate: string
  endDate: string
}

const toLocalDayStart = (value: string) => {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const toLocalDayEnd = (value: string) => {
  const date = new Date(`${value}T23:59:59`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function useAdminSalesModel({
  records,
  orders,
  filters,
}: {
  records: SalesRecord[]
  orders: Order[]
  filters: SalesModelFilters
}) {
  const deferredQuery = useDeferredValue(filters.query)

  const orderById = useMemo(() => {
    const map = new Map<string, Order>()
    orders.forEach((order) => map.set(order.id, order))
    return map
  }, [orders])

  const getUiStatus = useCallback(
    (orderId: string): SalesUiStatus => {
      const order = orderById.get(orderId)
      if (!order) {
        return 'PAID'
      }
      if (order.status === 'CANCELLED') {
        return 'CANCELLED'
      }
      if (order.status === 'PENDING_PAYMENT' || order.status === 'HOLD') {
        return 'PENDING'
      }
      if (order.audit_log.some((entry) => entry.action === 'VOID')) {
        return 'VOIDED'
      }
      return 'PAID'
    },
    [orderById],
  )

  const filtered = useMemo(() => {
    const trimmed = deferredQuery.trim().toLowerCase()
    const start = filters.startDate ? toLocalDayStart(filters.startDate) : null
    const end = filters.endDate ? toLocalDayEnd(filters.endDate) : null

    return records.filter((record) => {
      const uiStatus = getUiStatus(record.orderId)
      if (uiStatus === 'VOIDED') {
        return false
      }
      if (filters.methodFilter !== 'ALL' && record.paymentMethod !== filters.methodFilter) {
        return false
      }
      if (filters.statusFilter !== 'ALL' && uiStatus !== filters.statusFilter) {
        return false
      }
      if (start || end) {
        const paidAt = new Date(record.paidAt)
        if (start && paidAt < start) {
          return false
        }
        if (end && paidAt > end) {
          return false
        }
      }
      if (!trimmed) {
        return true
      }
      return (
        record.orderNo.toLowerCase().includes(trimmed) ||
        record.processedBy?.name.toLowerCase().includes(trimmed)
      )
    })
  }, [
    deferredQuery,
    filters.endDate,
    filters.methodFilter,
    filters.startDate,
    filters.statusFilter,
    getUiStatus,
    records,
  ])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()),
    [filtered],
  )

  const metrics = useMemo(() => {
    const totalsByMethod: Record<PaymentMethod, number> = {
      CASH: 0,
      CARD: 0,
      GCASH: 0,
      OTHER: 0,
    }
    let total = 0
    let cogs = 0

    filtered.forEach((record) => {
      total += record.total
      totalsByMethod[record.paymentMethod] += record.total
      cogs += record.cogs ?? 0
    })

    const totalOrders = filtered.length
    const avgTicket = totalOrders > 0 ? total / totalOrders : 0
    const profit = total - cogs

    return {
      totalSales: total,
      totalOrders,
      profit,
      avgTicket,
      totalsByMethod,
    }
  }, [filtered])

  return {
    orderById,
    getUiStatus,
    filtered,
    sorted,
    metrics,
  }
}

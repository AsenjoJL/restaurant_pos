import type { Order, ReplacementItem, ReplacementTicket } from '../../shared/types/order'
import type { KitchenStation } from '../pos/pos.types'
import { resolveKitchenStation } from './kitchen.utils'

export const SLA_MINUTES = 15
export const SLA_MS = SLA_MINUTES * 60 * 1000

export const stationOrder: KitchenStation[] = [
  'GRILL',
  'FRY',
  'PANTRY',
  'PIZZA',
  'BAR',
  'DESSERT',
  'ASSEMBLY',
  'UNASSIGNED',
]

export const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export const resolveTimestamp = (value?: string | null, fallback?: string | null) =>
  value ? new Date(value).getTime() : fallback ? new Date(fallback).getTime() : null

export const createEmptyStationCounts = () => {
  const counts = new Map<KitchenStation, number>()
  stationOrder.forEach((station) => counts.set(station, 0))
  return counts
}

export const buildOrderStationCounts = (items: Order['items']) => {
  const counts = createEmptyStationCounts()
  const addStationCount = (productId: string, qty: number) => {
    const station = resolveKitchenStation(productId)
    counts.set(station, (counts.get(station) ?? 0) + qty)
  }

  items.forEach((item) => {
    if (item.bundle_items?.length) {
      const multiplier = Math.max(1, item.quantity)
      item.bundle_items.forEach((bundleItem) => {
        addStationCount(bundleItem.id, bundleItem.quantity * multiplier)
      })
      return
    }
    addStationCount(item.id, item.quantity)
  })

  return counts
}

export const buildReplacementStationCounts = (items: ReplacementItem[]) => {
  const counts = createEmptyStationCounts()
  items.forEach((item) => {
    const station = resolveKitchenStation(item.productId)
    counts.set(station, (counts.get(station) ?? 0) + item.qty)
  })
  return counts
}

export const buildOrderStationCountMap = (orders: Order[]) => {
  const map = new Map<string, Map<KitchenStation, number>>()
  orders.forEach((order) => {
    map.set(order.id, buildOrderStationCounts(order.items))
  })
  return map
}

export const buildReplacementStationCountMap = (tickets: ReplacementTicket[]) => {
  const map = new Map<string, Map<KitchenStation, number>>()
  tickets.forEach((ticket) => {
    map.set(ticket.id, buildReplacementStationCounts(ticket.items))
  })
  return map
}

export const buildStationSummary = (
  orderStationCounts: Map<string, Map<KitchenStation, number>>,
  replacementStationCounts: Map<string, Map<KitchenStation, number>>,
) => {
  const totals = createEmptyStationCounts()
  const addTotals = (counts: Map<KitchenStation, number>) => {
    stationOrder.forEach((station) => {
      totals.set(station, (totals.get(station) ?? 0) + (counts.get(station) ?? 0))
    })
  }
  orderStationCounts.forEach((counts) => addTotals(counts))
  replacementStationCounts.forEach((counts) => addTotals(counts))
  return totals
}

export const getKitchenMetrics = (allOrders: Order[], kitchenOrders: Order[]) => {
  const now = Date.now()
  const inProgress = kitchenOrders.filter(
    (order) => order.status === 'SENT_TO_KITCHEN' || order.status === 'PREPARING',
  )
  const overdue = inProgress.filter((order) => {
    const base = resolveTimestamp(
      order.status === 'PREPARING' ? order.kitchen_started_at : order.kitchen_sent_at,
      order.placed_at,
    )
    if (!base) {
      return false
    }
    return now - base > SLA_MS
  })

  const completed = allOrders.filter((order) => order.kitchen_started_at && order.kitchen_ready_at)
  const prepDurations = completed
    .map((order) => {
      const start = resolveTimestamp(order.kitchen_started_at, order.kitchen_sent_at)
      const ready = resolveTimestamp(order.kitchen_ready_at, null)
      return start && ready ? ready - start : null
    })
    .filter((value): value is number => value !== null && value >= 0)

  const avgPrepMs =
    prepDurations.length > 0
      ? prepDurations.reduce((sum, value) => sum + value, 0) / prepDurations.length
      : 0

  const oneHourAgo = now - 60 * 60 * 1000
  const completedLastHour = completed.filter((order) => {
    const ready = resolveTimestamp(order.kitchen_ready_at, null)
    return ready ? ready >= oneHourAgo : false
  }).length

  return {
    inProgress: inProgress.length,
    overdue: overdue.length,
    avgPrepMs,
    completedLastHour,
  }
}

export const getOrderElapsed = (order: Order) => {
  const now = Date.now()
  const base = resolveTimestamp(
    order.status === 'PREPARING' ? order.kitchen_started_at : order.kitchen_sent_at,
    order.placed_at,
  )
  const elapsedMs = base ? now - base : 0
  const isOverSla = elapsedMs > SLA_MS
  const elapsedLabel =
    order.status === 'PREPARING'
      ? 'Prep'
      : order.status === 'SENT_TO_KITCHEN'
        ? 'Wait'
        : 'Elapsed'

  return {
    elapsedMs,
    isOverSla,
    elapsedLabel,
  }
}

export const getReplacementElapsed = (ticket: ReplacementTicket) => {
  const now = Date.now()
  const base = resolveTimestamp(
    ticket.status === 'PREPARING' ? ticket.startedAt : ticket.sentAt,
    ticket.createdAt,
  )
  const elapsedMs = base ? now - base : 0
  const isOverSla = elapsedMs > SLA_MS
  const elapsedLabel =
    ticket.status === 'PREPARING'
      ? 'Prep'
      : ticket.status === 'SENT_TO_KITCHEN'
        ? 'Wait'
        : 'Elapsed'

  return {
    elapsedMs,
    isOverSla,
    elapsedLabel,
  }
}

export const countReplacementItems = (items: ReplacementItem[]) =>
  items.reduce((sum, item) => sum + item.qty, 0)

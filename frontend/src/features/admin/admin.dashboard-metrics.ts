import { isPaymentCaptured } from '../../shared/lib/orders'
import type { AdminProduct, AdminUser } from './admin.types'
import type { Order } from '../../shared/types/order'
import type { SalesRecord } from '../../shared/types/sales'
import type { Ingredient, Recipe } from '../inventory/inventory.types'
import { calculateOrderCost } from '../inventory/inventory.logic'

export type TrendRange = '7D' | '30D' | '12M'

type TrendRow = {
  key: string
  label: string
  dayLabel: string
  total: number
  txns: number
  x: number
  y: number
  ratio: number
  status: 'No Sales' | 'Low' | 'Mid' | 'High' | 'Peak'
  statusTone: 'none' | 'low' | 'mid' | 'high' | 'peak'
}

type TrendPoint = { x: number; y: number }

type DashboardStats = {
  activeProducts: number
  staff: number
  activeUsers: number
}

type DashboardAnalytics = {
  todaySales: number
  totalOrders: number
  netSales: number
  avgTicket: number
  profit: number
  lowStock: number
  outOfStock: number
}

type DashboardTrend = {
  rows: TrendRow[]
  linePath: string
  areaPath: string
  chartMax: number
  chartHeight: number
  chartPadding: {
    left: number
    right: number
    top: number
    bottom: number
  }
  windowTotal: number
  dailyAverageActive: number
  peak: { label: string; total: number } | null
  changePct: number | null
  rangeLabel: string
  startLabel: string
  endLabel: string
}

const toSmoothPath = (points: TrendPoint[]): string => {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index === 0 ? index : index - 1]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[index + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return path
}

export const computeDashboardStats = ({
  products,
  users,
}: {
  products: AdminProduct[]
  users: AdminUser[]
}): DashboardStats => {
  const activeProducts = products.filter((product) => product.isActive).length
  const activeUsers = users.filter((user) => user.isActive).length
  return {
    activeProducts,
    staff: users.length,
    activeUsers,
  }
}

export const computeDashboardAnalytics = ({
  orders,
  recipes,
  ingredients,
  now = new Date(),
}: {
  orders: Order[]
  recipes: Recipe[]
  ingredients: Ingredient[]
  now?: Date
}): DashboardAnalytics => {
  const isToday = (value: string) => {
    const at = new Date(value)
    return (
      at.getFullYear() === now.getFullYear() &&
      at.getMonth() === now.getMonth() &&
      at.getDate() === now.getDate()
    )
  }

  const paidOrders = orders.filter((order) => isPaymentCaptured(order))
  const todaySales = paidOrders
    .filter((order) => isToday(order.placed_at))
    .reduce((sum, order) => sum + order.total, 0)
  const netSales = paidOrders.reduce((sum, order) => sum + order.total, 0)
  const cogs = paidOrders.reduce(
    (sum, order) => sum + calculateOrderCost(order, recipes, ingredients),
    0,
  )
  const avgTicket = paidOrders.length > 0 ? netSales / paidOrders.length : 0
  const profit = netSales - cogs
  const lowStock = ingredients.filter((item) => item.onHand <= item.reorderLevel).length
  const outOfStock = ingredients.filter((item) => item.onHand <= 0).length

  return {
    todaySales,
    totalOrders: orders.length,
    netSales,
    avgTicket,
    profit,
    lowStock,
    outOfStock,
  }
}

const getTrendRangeLabel = (trendRange: TrendRange) => {
  if (trendRange === '12M') {
    return 'Last 12 months'
  }
  if (trendRange === '30D') {
    return 'Last 30 days'
  }
  return 'Last 7 days'
}

export const computeDashboardTrend = ({
  orders,
  salesRecords,
  trendRange,
  now = new Date(),
}: {
  orders: Order[]
  salesRecords: SalesRecord[]
  trendRange: TrendRange
  now?: Date
}): DashboardTrend => {
  const isMonthly = trendRange === '12M'
  const bucketCount = trendRange === '7D' ? 7 : trendRange === '30D' ? 30 : 12
  const orderById = new Map(orders.map((order) => [order.id, order]))

  const validRecords = salesRecords.filter((record) => {
    const order = orderById.get(record.orderId)
    if (!order) return true
    if (
      order.status === 'CANCELLED' ||
      order.status === 'PENDING_PAYMENT' ||
      order.status === 'HOLD'
    ) {
      return false
    }
    if (order.audit_log.some((entry) => entry.action === 'VOID')) return false
    return true
  })

  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    if (isMonthly) {
      const month = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1 - index), 1)
      return {
        key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
        label: month.toLocaleDateString(undefined, { month: 'short' }),
        dayLabel: month.toLocaleDateString(undefined, { year: 'numeric' }),
        total: 0,
        txns: 0,
      }
    }

    const day = new Date(now)
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - (bucketCount - 1 - index))
    return {
      key: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(
        day.getDate(),
      ).padStart(2, '0')}`,
      label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      dayLabel: day.toLocaleDateString(undefined, { weekday: 'long' }),
      total: 0,
      txns: 0,
    }
  })

  const bucketIndexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]))

  validRecords.forEach((record) => {
    const paidAt = new Date(record.paidAt)
    if (Number.isNaN(paidAt.getTime())) return
    const key = isMonthly
      ? `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}`
      : `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}-${String(
          paidAt.getDate(),
        ).padStart(2, '0')}`
    const idx = bucketIndexByKey.get(key)
    if (idx === undefined) return
    buckets[idx].total += record.total
    buckets[idx].txns += 1
  })

  const totals = buckets.map((bucket) => bucket.total)
  const max = Math.max(...totals, 0)
  const chartMax = max > 0 ? max * 1.1 : 1

  const chartWidth = 760
  const chartHeight = 280
  const chartPadding = { left: 56, right: 24, top: 20, bottom: 34 }
  const plotW = chartWidth - chartPadding.left - chartPadding.right
  const plotH = chartHeight - chartPadding.top - chartPadding.bottom
  const baseY = chartHeight - chartPadding.bottom

  const points = buckets.map((bucket, index) => ({
    x: chartPadding.left + (buckets.length <= 1 ? 0 : (index / (buckets.length - 1)) * plotW),
    y: baseY - (bucket.total / chartMax) * plotH,
  }))

  const linePath = toSmoothPath(points)
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`
      : ''

  const windowTotal = totals.reduce((sum, value) => sum + value, 0)
  const activeDays = buckets.filter((bucket) => bucket.total > 0).length
  const dailyAverageActive = activeDays > 0 ? windowTotal / activeDays : 0

  const peak = buckets.reduce<{ label: string; total: number } | null>((current, bucket) => {
    if (!current || bucket.total > current.total) {
      return { label: bucket.label, total: bucket.total }
    }
    return current
  }, null)

  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (bucketCount - 1))
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - (end.getTime() - start.getTime()))
  const previousTotal = validRecords.reduce((sum, record) => {
    const paidAt = new Date(record.paidAt)
    if (Number.isNaN(paidAt.getTime())) return sum
    return paidAt >= prevStart && paidAt <= prevEnd ? sum + record.total : sum
  }, 0)
  const changePct = previousTotal > 0 ? ((windowTotal - previousTotal) / previousTotal) * 100 : null

  const rows: TrendRow[] = buckets.map((bucket, index) => {
    const ratio = max > 0 ? bucket.total / max : 0
    let status: TrendRow['status'] = 'No Sales'
    let statusTone: TrendRow['statusTone'] = 'none'
    if (bucket.total > 0) {
      if (ratio >= 0.9) {
        status = 'Peak'
        statusTone = 'peak'
      } else if (ratio >= 0.55) {
        status = 'High'
        statusTone = 'high'
      } else if (ratio >= 0.25) {
        status = 'Mid'
        statusTone = 'mid'
      } else {
        status = 'Low'
        statusTone = 'low'
      }
    }

    return {
      ...bucket,
      x: points[index]?.x ?? 0,
      y: points[index]?.y ?? baseY,
      ratio,
      status,
      statusTone,
    }
  })

  return {
    rows,
    linePath,
    areaPath,
    chartMax,
    chartHeight,
    chartPadding,
    windowTotal,
    dailyAverageActive,
    peak,
    changePct,
    rangeLabel: getTrendRangeLabel(trendRange),
    startLabel: rows[0]?.label ?? '',
    endLabel: rows[rows.length - 1]?.label ?? '',
  }
}

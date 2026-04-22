import { useMemo, useState } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import { selectInventoryIngredients, selectInventoryRecipes } from '../../inventory/inventory.selectors'
import { selectOrders } from '../../orders/orders.selectors'
import { selectSalesRecords } from '../../sales/sales.selectors'
import { selectAdminProducts, selectAdminUsers } from '../admin.selectors'
import {
  computeDashboardAnalytics,
  computeDashboardStats,
  computeDashboardTrend,
  type TrendRange,
} from '../admin.dashboard-metrics'

function useAdminDashboardPageController() {
  const products = useAppSelector(selectAdminProducts)
  const users = useAppSelector(selectAdminUsers)
  const orders = useAppSelector(selectOrders)
  const salesRecords = useAppSelector(selectSalesRecords)
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)
  const [trendRange, setTrendRange] = useState<TrendRange>('7D')

  const stats = useMemo(() => computeDashboardStats({ products, users }), [products, users])
  const analytics = useMemo(
    () => computeDashboardAnalytics({ orders, recipes, ingredients }),
    [ingredients, orders, recipes],
  )
  const trend = useMemo(
    () => computeDashboardTrend({ orders, salesRecords, trendRange }),
    [orders, salesRecords, trendRange],
  )
  const peakKey = trend.peak ? `${trend.peak.label}-${trend.peak.total}` : ''

  return {
    analytics,
    peakKey,
    stats,
    trend,
    trendRange,
    setTrendRange,
  }
}

export default useAdminDashboardPageController

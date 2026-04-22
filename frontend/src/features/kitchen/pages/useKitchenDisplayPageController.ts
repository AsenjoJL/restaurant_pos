import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { useAdminOverride } from '../../../shared/hooks/useAdminOverride'
import { isKitchenStatus } from '../../../shared/lib/orders'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectOrders, selectReplacementTickets } from '../../orders/orders.selectors'
import {
  markReady,
  markReplacementReady,
  startPreparing,
  startReplacementTicket,
  syncKitchenOrderStatus,
  syncKitchenReplacementStatus,
} from '../../orders/orders.store'
import type { KitchenStation } from '../../pos/pos.types'
import { KITCHEN_ALL_STATIONS, type KitchenStationFilter } from '../kitchen.constants'
import {
  buildOrderStationCountMap,
  buildReplacementStationCountMap,
  buildStationSummary,
  createEmptyStationCounts,
  getKitchenMetrics,
} from '../kitchen.logic'

function useKitchenDisplayPageController() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const replacementTickets = useAppSelector(selectReplacementTickets)
  const user = useAppSelector(selectAuthUser)
  const role = user?.role
  const isAdmin = role === 'admin'
  const { active: adminOverride, remainingMs: overrideRemainingMs, toggle: toggleAdminOverride } =
    useAdminOverride('kitchen', isAdmin)
  const canOperateKitchen = role === 'kitchen' || (isAdmin && adminOverride)
  const [activeStation, setActiveStation] = useState<KitchenStationFilter>(KITCHEN_ALL_STATIONS)

  const kitchenOrders = useMemo(
    () => orders.filter((order) => isKitchenStatus(order.status)),
    [orders],
  )

  const metrics = useMemo(() => getKitchenMetrics(orders, kitchenOrders), [kitchenOrders, orders])
  const orderStationCountMap = useMemo(() => buildOrderStationCountMap(kitchenOrders), [kitchenOrders])
  const replacementStationCountMap = useMemo(
    () => buildReplacementStationCountMap(replacementTickets),
    [replacementTickets],
  )
  const stationSummary = useMemo(
    () => buildStationSummary(orderStationCountMap, replacementStationCountMap),
    [orderStationCountMap, replacementStationCountMap],
  )
  const emptyStationCounts = useMemo(() => createEmptyStationCounts(), [])

  const filteredOrders = useMemo(() => {
    if (activeStation === KITCHEN_ALL_STATIONS) {
      return kitchenOrders
    }
    return kitchenOrders.filter((order) => (orderStationCountMap.get(order.id)?.get(activeStation as KitchenStation) ?? 0) > 0)
  }, [activeStation, kitchenOrders, orderStationCountMap])

  const filteredTickets = useMemo(() => {
    if (activeStation === KITCHEN_ALL_STATIONS) {
      return replacementTickets
    }
    return replacementTickets.filter(
      (ticket) => (replacementStationCountMap.get(ticket.id)?.get(activeStation as KitchenStation) ?? 0) > 0,
    )
  }, [activeStation, replacementStationCountMap, replacementTickets])

  return {
    activeStation,
    adminOverride,
    canOperateKitchen,
    emptyStationCounts,
    filteredOrders,
    filteredTickets,
    handleReadyOrder: (id: string) => {
      dispatch(markReady({ id }))
      void dispatch(syncKitchenOrderStatus({ id, status: 'READY_FOR_PICKUP' }))
    },
    handleReadyReplacement: (id: string) => {
      dispatch(markReplacementReady({ id }))
      void dispatch(syncKitchenReplacementStatus({ id, status: 'READY_FOR_PICKUP' }))
    },
    handleStartOrder: (id: string) => {
      dispatch(startPreparing({ id }))
      void dispatch(syncKitchenOrderStatus({ id, status: 'PREPARING' }))
    },
    handleStartReplacement: (id: string) => {
      dispatch(startReplacementTicket({ id }))
      void dispatch(syncKitchenReplacementStatus({ id, status: 'PREPARING' }))
    },
    isAdmin,
    metrics,
    orderStationCountMap,
    overrideRemainingMs,
    replacementStationCountMap,
    setActiveStation,
    stationSummary,
    toggleAdminOverride,
  }
}

export default useKitchenDisplayPageController

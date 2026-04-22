import { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from '../../../app/store/hooks'
import { selectOrders } from '../../orders/orders.selectors'

function useKitchenQueueBoardController() {
  const orders = useAppSelector(selectOrders)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const preparingOrders = useMemo(
    () =>
      orders.filter(
        (order) => order.status === 'SENT_TO_KITCHEN' || order.status === 'PREPARING',
      ),
    [orders],
  )

  const readyOrders = useMemo(
    () => orders.filter((order) => order.status === 'READY_FOR_PICKUP'),
    [orders],
  )

  return {
    now,
    preparingOrders,
    readyOrders,
  }
}

export default useKitchenQueueBoardController

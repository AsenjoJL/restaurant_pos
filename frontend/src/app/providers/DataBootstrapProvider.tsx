import { useEffect, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { hydrateOrdersFromRepository } from '../../features/orders/orders.store'
import { hydrateInventoryFromRepository } from '../../features/inventory/inventory.store'
import { hydrateSalesFromRepository } from '../../features/sales/sales.store'
import { hydrateAdminFromRepository } from '../../features/admin/admin.store'

type DataBootstrapProviderProps = {
  children: ReactNode
}

function DataBootstrapProvider({ children }: DataBootstrapProviderProps) {
  const dispatch = useAppDispatch()
  const ordersCount = useAppSelector((state) => state.orders.list.length)
  const inventoryCount = useAppSelector((state) => state.inventory.ingredients.length)
  const salesCount = useAppSelector((state) => state.sales.records.length)
  const adminProductCount = useAppSelector((state) => state.admin.products.length)

  useEffect(() => {
    void (async () => {
      const tasks: Array<Promise<unknown>> = []

      if (ordersCount === 0) {
        tasks.push(dispatch(hydrateOrdersFromRepository()).unwrap())
      }
      if (inventoryCount === 0) {
        tasks.push(dispatch(hydrateInventoryFromRepository()).unwrap())
      }
      if (salesCount === 0) {
        tasks.push(dispatch(hydrateSalesFromRepository()).unwrap())
      }
      if (adminProductCount === 0) {
        tasks.push(dispatch(hydrateAdminFromRepository()).unwrap())
      }

      if (tasks.length === 0) {
        return
      }

      await Promise.allSettled(tasks)
    })()
  }, [adminProductCount, dispatch, inventoryCount, ordersCount, salesCount])

  return <>{children}</>
}

export default DataBootstrapProvider

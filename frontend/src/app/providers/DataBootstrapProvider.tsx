import { useEffect, type ReactNode } from 'react'
import { useAppDispatch } from '../store/hooks'
import { DATA_MODE } from '../config/data-mode'
import { hydrateOrdersFromRepository } from '../../features/orders/orders.store'
import { hydrateInventoryFromRepository } from '../../features/inventory/inventory.store'
import { hydrateSalesFromRepository } from '../../features/sales/sales.store'
import { hydrateAdminFromRepository } from '../../features/admin/admin.store'

type DataBootstrapProviderProps = {
  children: ReactNode
}

function DataBootstrapProvider({ children }: DataBootstrapProviderProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (DATA_MODE !== 'api') {
      return
    }
    void dispatch(hydrateOrdersFromRepository())
    void dispatch(hydrateInventoryFromRepository())
    void dispatch(hydrateSalesFromRepository())
    void dispatch(hydrateAdminFromRepository())
  }, [dispatch])

  return <>{children}</>
}

export default DataBootstrapProvider

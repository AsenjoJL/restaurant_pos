import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/store/hooks'
import { selectOrders } from '../../orders/orders.selectors'
import { useOrderDeductionsDashboardModel } from './useOrderDeductionsDashboardModel'
import { selectInventoryIngredients, selectInventoryRecipes } from '../inventory.selectors'

function useOrderAndInventoryDashboardController() {
  const navigate = useNavigate()
  const ingredients = useAppSelector(selectInventoryIngredients)
  const recipes = useAppSelector(selectInventoryRecipes)
  const orders = useAppSelector(selectOrders)
  const model = useOrderDeductionsDashboardModel({
    orders,
    recipes,
    ingredients,
  })

  return {
    ...model,
    handleBackToSales: () => navigate('/admin/sales-center'),
  }
}

export default useOrderAndInventoryDashboardController

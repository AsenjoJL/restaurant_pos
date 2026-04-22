import { useNavigate } from 'react-router-dom'
import type { AdminProduct } from '../admin.types'
import { useAdminProductsPageModel } from './useAdminProductsPageModel'

function useAdminProductsPageController() {
  const navigate = useNavigate()
  const model = useAdminProductsPageModel()

  return {
    ...model,
    handleBackToCatalog: () => navigate('/admin/catalog'),
    handleSaveAction: () => {
      void model.handleSave()
    },
    handleToggleActiveAction: (product: AdminProduct) => {
      void model.handleToggleActive(product)
    },
  }
}

export default useAdminProductsPageController

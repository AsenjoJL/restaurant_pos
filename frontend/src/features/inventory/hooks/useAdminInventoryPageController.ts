import { useNavigate } from 'react-router-dom'
import { useAdminInventoryPageModel } from './useAdminInventoryPageModel'

function useAdminInventoryPageController() {
  const navigate = useNavigate()
  const model = useAdminInventoryPageModel()

  return {
    ...model,
    handleBackToDashboard: () => navigate('/admin/dashboard'),
  }
}

export default useAdminInventoryPageController

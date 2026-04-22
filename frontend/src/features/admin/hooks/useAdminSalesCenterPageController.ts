import { useNavigate } from 'react-router-dom'
import { SALES_CENTER_LINKS } from '../admin.sales-center'

function useAdminSalesCenterPageController() {
  const navigate = useNavigate()

  return {
    links: SALES_CENTER_LINKS,
    handleBackToDashboard: () => navigate('/admin/dashboard'),
  }
}

export default useAdminSalesCenterPageController

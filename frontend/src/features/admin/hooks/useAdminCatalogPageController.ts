import { useNavigate } from 'react-router-dom'
import { ADMIN_CATALOG_LINKS } from '../admin.catalog-links'

function useAdminCatalogPageController() {
  const navigate = useNavigate()

  return {
    links: ADMIN_CATALOG_LINKS,
    handleBackToDashboard: () => navigate('/admin/dashboard'),
  }
}

export default useAdminCatalogPageController

import { useNavigate } from 'react-router-dom'
import { ADMINISTRATION_LINKS } from '../admin.administration'

function useAdminAdministrationPageController() {
  const navigate = useNavigate()

  return {
    links: ADMINISTRATION_LINKS,
    handleBackToDashboard: () => navigate('/admin/dashboard'),
  }
}

export default useAdminAdministrationPageController

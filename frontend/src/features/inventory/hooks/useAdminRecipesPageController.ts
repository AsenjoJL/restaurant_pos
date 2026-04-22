import { useNavigate } from 'react-router-dom'
import { useAdminRecipesPageModel } from './useAdminRecipesPageModel'

function useAdminRecipesPageController() {
  const navigate = useNavigate()
  const model = useAdminRecipesPageModel()

  return {
    ...model,
    handleBackToCatalog: () => navigate('/admin/catalog'),
    handleSaveAction: () => {
      void model.handleSave()
    },
    handleClearRecipeAction: () => {
      void model.handleClearRecipe()
    },
    handleCreateIngredientAction: () => {
      void model.handleCreateIngredient()
    },
  }
}

export default useAdminRecipesPageController

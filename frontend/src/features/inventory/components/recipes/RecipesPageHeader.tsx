import Button from '../../../../shared/components/ui/Button'

type RecipesPageHeaderProps = {
  isSaving: boolean
  onBackToCatalog: () => void
  onOpenIngredientModal: () => void
  onClearRecipe: () => void
  onSave: () => void
}

function RecipesPageHeader({
  isSaving,
  onBackToCatalog,
  onOpenIngredientModal,
  onClearRecipe,
  onSave,
}: RecipesPageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2>Recipes</h2>
        <p className="muted">Map ingredients to menu products for inventory deduction.</p>
      </div>
      <div className="admin-row-actions recipe-header-actions">
        <Button variant="outline" onClick={onBackToCatalog}>
          Back to Catalog
        </Button>
        <Button
          variant="outline"
          className="recipe-action-btn recipe-action-add"
          onClick={onOpenIngredientModal}
        >
          New Inventory Ingredient
        </Button>
        <Button
          variant="outline"
          className="recipe-action-btn recipe-action-clear"
          onClick={onClearRecipe}
        >
          Clear Recipe
        </Button>
        <Button
          variant="primary"
          className="recipe-action-btn recipe-action-save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Recipe'}
        </Button>
      </div>
    </div>
  )
}

export default RecipesPageHeader

import AdminStatCard from '../../admin/components/AdminStatCard'
import RecipeBuilderCard from '../components/recipes/RecipeBuilderCard'
import RecipeIngredientModal from '../components/recipes/RecipeIngredientModal'
import RecipesPageHeader from '../components/recipes/RecipesPageHeader'
import useAdminRecipesPageController from '../hooks/useAdminRecipesPageController'

function AdminRecipesPage() {
  const {
    stats,
    productOptions,
    ingredientOptions,
    ingredientCategoryOptions,
    getUnitOptionsForLine,
    selectedProductId,
    selectedProduct,
    currentRecipe,
    lines,
    formError,
    isSaving,
    handleProductChange,
    handleLineChange,
    handleAddLine,
    handleRemoveLine,
    recipeMarginPct,
    formattedRecipeCost,
    formattedMenuPrice,
    formattedMargin,
    isIngredientModalOpen,
    ingredientForm,
    ingredientErrors,
    setIngredientForm,
    handleBackToCatalog,
    openIngredientModal,
    closeIngredientModal,
    handleSaveAction,
    handleClearRecipeAction,
    handleCreateIngredientAction,
  } = useAdminRecipesPageController()

  return (
    <div className="page admin-page admin-recipes-page">
      <RecipesPageHeader
        isSaving={isSaving}
        onBackToCatalog={handleBackToCatalog}
        onOpenIngredientModal={openIngredientModal}
        onClearRecipe={handleClearRecipeAction}
        onSave={handleSaveAction}
      />

      <div className="admin-metrics">
        <AdminStatCard label="Products" value={String(stats.products)} icon="/menu.png" />
        <AdminStatCard label="Recipes" value={String(stats.recipes)} icon="/items.png" />
      </div>

      <RecipeBuilderCard
        currentRecipeUpdatedAt={currentRecipe?.updatedAt}
        formError={formError}
        formattedMargin={formattedMargin}
        formattedMenuPrice={formattedMenuPrice}
        formattedRecipeCost={formattedRecipeCost}
        getUnitOptionsForLine={getUnitOptionsForLine}
        ingredientOptions={ingredientOptions}
        lines={lines}
        productOptions={productOptions}
        recipeMarginPct={recipeMarginPct}
        selectedProductId={selectedProductId}
        selectedProductName={selectedProduct?.name}
        onAddLine={handleAddLine}
        onLineChange={handleLineChange}
        onProductChange={handleProductChange}
        onRemoveLine={handleRemoveLine}
      />

      <RecipeIngredientModal
        ingredientCategoryOptions={ingredientCategoryOptions}
        ingredientErrors={ingredientErrors}
        ingredientForm={ingredientForm}
        isOpen={isIngredientModalOpen}
        setIngredientForm={setIngredientForm}
        onClose={closeIngredientModal}
        onCreateIngredient={handleCreateIngredientAction}
      />
    </div>
  )
}

export default AdminRecipesPage

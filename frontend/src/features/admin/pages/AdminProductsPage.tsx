import AdminProductsFilters from '../components/products/AdminProductsFilters'
import AdminProductsMetrics from '../components/products/AdminProductsMetrics'
import AdminProductsPageHeader from '../components/products/AdminProductsPageHeader'
import ProductCatalogTable from '../components/products/ProductCatalogTable'
import ProductEditorModal from '../components/products/ProductEditorModal'
import useAdminProductsPageController from '../hooks/useAdminProductsPageController'

function AdminProductsPage() {
  const {
    categories,
    ingredients,
    stats,
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    classFilter,
    setClassFilter,
    categoryOptions,
    classOptions,
    filteredProducts,
    isModalOpen,
    editing,
    form,
    setForm,
    errors,
    formError,
    isSaving,
    ingredientSelectOptions,
    pendingImagePreview,
    markupPercentage,
    profitMarginPercent,
    profitPerItem,
    openAddModal,
    openEditModal,
    closeModal,
    handleBackToCatalog,
    handleClear,
    handleSaveAction,
    handleToggleActiveAction,
    handleImageFileChange,
    handleIngredientSelect,
    handleAdditionalIngredientSelect,
    handleAddIngredientLink,
    handleRemoveIngredientLink,
    handleRecipeIngredientChange,
    handleRecipeQtyChange,
    clearPendingImage,
    loadDemoProduct,
  } = useAdminProductsPageController()

  return (
    <div className="page admin-page admin-products-page">
      <AdminProductsPageHeader
        onAddProduct={openAddModal}
        onBackToCatalog={handleBackToCatalog}
      />

      <AdminProductsMetrics stats={stats} />

      <AdminProductsFilters
        categoryFilter={categoryFilter}
        categoryOptions={categoryOptions}
        classFilter={classFilter}
        classOptions={classOptions}
        onCategoryFilterChange={setCategoryFilter}
        onClassFilterChange={setClassFilter}
        onQueryChange={setQuery}
        query={query}
      />

      <ProductCatalogTable
        categories={categories}
        products={filteredProducts}
        onEdit={openEditModal}
        onToggleActive={handleToggleActiveAction}
      />

      <ProductEditorModal
        categories={categories}
        editing={editing}
        errors={errors}
        form={form}
        formError={formError}
        ingredientSelectOptions={ingredientSelectOptions}
        ingredients={ingredients}
        isOpen={isModalOpen}
        isSaving={isSaving}
        markupPercentage={markupPercentage}
        pendingImagePreview={pendingImagePreview}
        profitMarginPercent={profitMarginPercent}
        profitPerItem={profitPerItem}
        setForm={setForm}
        onAddIngredientLink={handleAddIngredientLink}
        onClear={handleClear}
        onClearPendingImage={clearPendingImage}
        onClose={closeModal}
        onImageFileChange={handleImageFileChange}
        onIngredientSelect={handleIngredientSelect}
        onAdditionalIngredientSelect={handleAdditionalIngredientSelect}
        onLoadDemoProduct={loadDemoProduct}
        onRecipeIngredientChange={handleRecipeIngredientChange}
        onRecipeQtyChange={handleRecipeQtyChange}
        onRemoveIngredientLink={handleRemoveIngredientLink}
        onSave={handleSaveAction}
      />
    </div>
  )
}

export default AdminProductsPage

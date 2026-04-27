import AdminStatCard from '../../admin/components/AdminStatCard'
import AdjustmentModal from '../components/AdjustmentModal'
import IngredientModal from '../components/IngredientModal'
import InventoryAlertsCenter from '../components/InventoryAlertsCenter'
import InventoryFiltersBar from '../components/InventoryFiltersBar'
import InventoryPageHeader from '../components/InventoryPageHeader'
import InventoryTable from '../components/InventoryTable'
import useAdminInventoryPageController from '../hooks/useAdminInventoryPageController'

function AdminInventoryPage() {
  const {
    ingredients,
    adjustments,
    stats,
    alerts,
    filteredIngredients,
    query,
    categoryFilter,
    ingredientTypeFilter,
    statusFilter,
    categoryOptions,
    ingredientTypeOptions,
    statusOptions,
    isIngredientModalOpen,
    editing,
    form,
    errors,
    formError,
    isSaving,
    derivedUnitCost,
    ingredientCategoryOptions,
    setForm,
    setIsUnitCostManual,
    openEditModal,
    closeIngredientModal,
    handleSaveIngredient,
    isAdjustModalOpen,
    adjustForm,
    adjustErrors,
    ingredientOptions,
    setAdjustForm,
    openAdjustModal,
    closeAdjustModal,
    handleAdjustStock,
    isImporting,
    fileInputRef,
    exportFormat,
    setExportFormat,
    importFormat,
    setImportFormat,
    fileFormatOptions,
    openImportFilePicker,
    handleImport,
    handleExportInventory,
    handleBackToDashboard,
    setQuery,
    setCategoryFilter,
    setIngredientTypeFilter,
    setStatusFilter,
  } = useAdminInventoryPageController()

  return (
    <div className="page admin-page admin-inventory-page">
      <InventoryPageHeader
        fileInputRef={fileInputRef}
        exportFormat={exportFormat}
        fileFormatOptions={fileFormatOptions}
        importFormat={importFormat}
        isImporting={isImporting}
        onBackToDashboard={handleBackToDashboard}
        onExportInventory={handleExportInventory}
        onExportFormatChange={setExportFormat}
        onImport={handleImport}
        onImportFormatChange={setImportFormat}
        onOpenImportFilePicker={openImportFilePicker}
      />

      <div className="admin-metrics">
        <AdminStatCard label="Ingredients" value={String(stats.total)} icon="/inventory.png" />
        <AdminStatCard label="Low Stock" value={String(stats.lowStock)} icon="/stock.jpg" />
        <AdminStatCard label="Categories" value={String(stats.categories)} icon="/catalogue.png" />
      </div>

      <InventoryAlertsCenter
        lowStockItems={alerts.lowStockItems}
        nearReorderItems={alerts.nearReorderItems}
        reorderSuggestions={alerts.reorderSuggestions}
        expiryRiskItems={alerts.expiryRiskItems}
      />

      <InventoryFiltersBar
        categoryFilter={categoryFilter}
        categoryOptions={categoryOptions}
        ingredientTypeFilter={ingredientTypeFilter}
        ingredientTypeOptions={ingredientTypeOptions}
        query={query}
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        onCategoryFilterChange={setCategoryFilter}
        onIngredientTypeFilterChange={setIngredientTypeFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="inventory-toolbar-meta">
        <p className="muted">
          Showing <strong>{filteredIngredients.length}</strong> of <strong>{ingredients.length}</strong> ingredients
        </p>
      </div>

      <InventoryTable
        ingredients={filteredIngredients}
        onEdit={openEditModal}
        onRestock={(ingredientId) => openAdjustModal(ingredientId, 'restock')}
        onAdjust={(ingredientId) => openAdjustModal(ingredientId)}
      />

      <IngredientModal
        isOpen={isIngredientModalOpen}
        isSaving={isSaving}
        isEditing={Boolean(editing)}
        form={form}
        errors={errors}
        formError={formError}
        derivedUnitCost={derivedUnitCost}
        ingredientCategoryOptions={ingredientCategoryOptions}
        onClose={closeIngredientModal}
        onSave={handleSaveIngredient}
        onFormChange={setForm}
        onUnitCostManualChange={setIsUnitCostManual}
      />

      <AdjustmentModal
        isOpen={isAdjustModalOpen}
        isSaving={isSaving}
        form={adjustForm}
        errors={adjustErrors}
        ingredientOptions={ingredientOptions}
        adjustments={adjustments}
        onClose={closeAdjustModal}
        onSave={handleAdjustStock}
        onFormChange={setAdjustForm}
      />
    </div>
  )
}

export default AdminInventoryPage

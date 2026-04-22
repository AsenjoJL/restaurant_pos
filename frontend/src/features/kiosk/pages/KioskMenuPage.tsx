import KioskMenuCartPanel from '../components/KioskMenuCartPanel'
import KioskMenuCategorySidebar from '../components/KioskMenuCategorySidebar'
import KioskMenuProductGrid from '../components/KioskMenuProductGrid'
import KioskItemModal from '../components/KioskItemModal'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import { useKioskMenuPageController } from './useKioskMenuPageController'

function KioskMenuPage() {
  const {
    activeCategory,
    brokenImages,
    categories,
    categoryCounts,
    clearReason,
    isClearConfirmOpen,
    isPlacing,
    model,
    runtimeProducts,
    searchTerm,
    selectedProduct,
    state,
    totals,
    setActiveCategory,
    setClearReason,
    setIsClearConfirmOpen,
    setNote,
    setSearchTerm,
    setSelectedProduct,
    updateQuantity,
    removeItem,
    handleAddDirect,
    handleBackToHome,
    handleCancelClearCart,
    handleClearFilters,
    handleConfirmClearCart,
    handleCustomize,
    handleCustomizedAdd,
    handleImageError,
    handlePlaceOrder,
  } = useKioskMenuPageController()

  return (
    <section className="h-full min-h-0 overflow-hidden bg-cream text-body">
      <div className="h-full min-h-0 grid grid-cols-[170px_minmax(0,1fr)_272px] overflow-hidden">
        <KioskMenuCategorySidebar
          activeCategory={activeCategory}
          categories={categories.filter((category) => category.id !== 'all')}
          categoryCounts={categoryCounts}
          totalCount={runtimeProducts.length}
          onCategoryChange={setActiveCategory}
        />
        <KioskMenuProductGrid
          orderType={state.orderType}
          activeCategoryName={model.activeCategoryName}
          brokenImages={brokenImages}
          categoryNameMap={model.categoryNameMap}
          searchTerm={searchTerm}
          visibleProducts={model.visibleProducts}
          onSearchTermChange={setSearchTerm}
          onAddDirect={handleAddDirect}
          onClearFilters={handleClearFilters}
          onCustomize={handleCustomize}
          onImageError={handleImageError}
          onBackToHome={handleBackToHome}
          getModifierGroupCount={model.getModifierGroupCount}
          resolveProductAvailability={model.resolveProductAvailability}
        />
        <KioskMenuCartPanel
          cart={state.cart}
          clearDisabled={state.cart.length === 0}
          isPlacing={isPlacing}
          note={state.note}
          totals={totals}
          onClearCart={() => setIsClearConfirmOpen(true)}
          onNoteChange={setNote}
          onPlaceOrder={handlePlaceOrder}
          onRemoveItem={removeItem}
          onUpdateQuantity={updateQuantity}
        />
      </div>

      {/* Product Customization Modal */}
      <KioskItemModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAdd={handleCustomizedAdd}
      />

      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        title="Clear cart"
        description="Remove all items from the cart?"
        reason={clearReason}
        onReasonChange={setClearReason}
        onConfirm={handleConfirmClearCart}
        onCancel={handleCancelClearCart}
        confirmLabel="Clear cart"
      />
    </section>
  )
}

export default KioskMenuPage

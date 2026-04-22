import {
  CartActions,
  CartEmptyState,
  CartHeader,
  CartItemRow,
  CartOrderFields,
  CartOrderMeta,
  CartOrderTypeSelector,
  CartPricingFields,
  CartSummary,
} from './cart'
import useCartPanelController from './useCartPanelController'

function CartPanel() {
  const {
    discountValue,
    draft,
    handleApplyPromo,
    handleCancelEdit,
    handleCheckoutAction,
    handleClearDraft,
    handleClearItems,
    handleDiscountChange,
    handleItemDecrease,
    handleItemIncrease,
    handleItemNoteChange,
    handleItemVoid,
    handleOpenModifiers,
    handleOrderNotesChange,
    handleOrderTypeChange,
    handleRemovePromo,
    handleTableChange,
    isEditing,
    isPaying,
    promo,
    staffName,
    totals,
  } = useCartPanelController()

  return (
    <aside className="pos-cart panel">
      <CartHeader
        isEditing={isEditing}
        itemCount={draft.items.length}
        onClearItems={handleClearItems}
      />
      <CartOrderMeta orderId={draft.id} staffName={staffName} />
      <CartOrderTypeSelector
        orderType={draft.orderType}
        onSelectOrderType={handleOrderTypeChange}
      />
      <CartOrderFields
        notes={draft.notes}
        onNotesChange={handleOrderNotesChange}
        onTableChange={handleTableChange}
        orderType={draft.orderType}
        tableId={draft.tableId}
      />
      <CartPricingFields
        discountValue={discountValue}
        onApplyPromo={handleApplyPromo}
        onDiscountChange={handleDiscountChange}
        onRemovePromo={handleRemovePromo}
        orderId={draft.id}
        promo={promo}
        promoCode={draft.promoCode}
      />

      <div className="cart-list">
        {draft.items.length === 0 ? (
          <CartEmptyState />
        ) : (
          draft.items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onIncrease={() => handleItemIncrease(item)}
              onDecrease={() => handleItemDecrease(item)}
              onVoid={() => handleItemVoid(item)}
              onOpenModifiers={() => handleOpenModifiers(item)}
              onNoteChange={(value) => handleItemNoteChange(item, value)}
            />
          ))
        )}
      </div>

      <CartSummary discount={draft.discount} promo={promo} totals={totals} />
      <CartActions
        canStartNewOrder={draft.items.length > 0}
        isEditing={isEditing}
        isPaying={isPaying}
        itemCount={draft.items.length}
        onCancelEdit={handleCancelEdit}
        onCheckout={handleCheckoutAction}
        onNewOrder={handleClearDraft}
      />
    </aside>
  )
}

export default CartPanel

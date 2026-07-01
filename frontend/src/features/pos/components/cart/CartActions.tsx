import Button from '../../../../shared/components/ui/Button'

type CartActionsProps = {
  canStartNewOrder: boolean
  isEditing: boolean
  isPaying: boolean
  itemCount: number
  onCancelEdit: () => void
  onCheckout: () => void
  onNewOrder: () => void
}

function CartActions({
  canStartNewOrder,
  isEditing,
  isPaying,
  itemCount,
  onCancelEdit,
  onCheckout,
  onNewOrder,
}: CartActionsProps) {
  return (
    <div className="cart-actions">
      <Button
        variant="primary"
        className="cart-checkout-btn"
        disabled={itemCount === 0 || isPaying}
        onClick={onCheckout}
      >
        {isPaying
          ? isEditing
            ? 'Saving changes...'
            : 'Saving order...'
          : isEditing
            ? 'Update & Take Payment'
            : 'Checkout / Take Payment'}
      </Button>
      {isEditing ? (
        <Button variant="ghost" className="cart-secondary-btn" onClick={onCancelEdit}>
          Cancel Edit
        </Button>
      ) : null}
      <Button
        variant="ghost"
        className="cart-secondary-btn"
        disabled={!canStartNewOrder}
        onClick={onNewOrder}
      >
        New Order
      </Button>
    </div>
  )
}

export default CartActions

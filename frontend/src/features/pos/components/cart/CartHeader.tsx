import Button from '../../../../shared/components/ui/Button'

type CartHeaderProps = {
  isEditing: boolean
  itemCount: number
  onClearItems: () => void
}

function CartHeader({ isEditing, itemCount, onClearItems }: CartHeaderProps) {
  return (
    <div className="cart-header">
      <div>
        <h2>{isEditing ? 'Editing Order' : 'Current Order'}</h2>
        <p className="muted">{itemCount} items</p>
      </div>
      <Button
        variant="ghost"
        className="cart-clear-btn"
        onClick={onClearItems}
        disabled={itemCount === 0}
      >
        Clear
      </Button>
    </div>
  )
}

export default CartHeader

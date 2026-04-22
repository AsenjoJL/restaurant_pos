type CartOrderTypeSelectorProps = {
  orderType: 'dine-in' | 'takeout'
  onSelectOrderType: (value: 'dine-in' | 'takeout') => void
}

function CartOrderTypeSelector({
  orderType,
  onSelectOrderType,
}: CartOrderTypeSelectorProps) {
  return (
    <div className="order-type pos-order-type">
      <button
        type="button"
        className={`segmented-button${orderType === 'dine-in' ? ' is-active' : ''}`}
        onClick={() => onSelectOrderType('dine-in')}
      >
        Dine-In
      </button>
      <button
        type="button"
        className={`segmented-button${orderType === 'takeout' ? ' is-active' : ''}`}
        onClick={() => onSelectOrderType('takeout')}
      >
        Takeout
      </button>
    </div>
  )
}

export default CartOrderTypeSelector

import Button from '../../../shared/components/ui/Button'

interface OrderTypeSelectorProps {
  orderType: 'dine-in' | 'takeout'
  onChange: (type: 'dine-in' | 'takeout') => void
}

export function OrderTypeSelector({ orderType, onChange }: OrderTypeSelectorProps) {
  return (
    <div className="order-type-selector">
      <Button
        variant={orderType === 'dine-in' ? 'primary' : 'outline'}
        onClick={() => onChange('dine-in')}
        className="order-type-button"
      >
        Dine In
      </Button>
      <Button
        variant={orderType === 'takeout' ? 'primary' : 'outline'}
        onClick={() => onChange('takeout')}
        className="order-type-button"
      >
        Takeout
      </Button>
    </div>
  )
}

import Select from '../../../../shared/components/ui/Select'
import { POS_CART_TABLE_OPTIONS } from './cart.constants'

type CartOrderFieldsProps = {
  notes: string
  onNotesChange: (value: string) => void
  onTableChange: (value: string | null) => void
  orderType: 'dine-in' | 'takeout'
  tableId: string | null
}

function CartOrderFields({
  notes,
  onNotesChange,
  onTableChange,
  orderType,
  tableId,
}: CartOrderFieldsProps) {
  return (
    <div className="order-fields">
      <Select
        label="Table"
        options={POS_CART_TABLE_OPTIONS}
        value={tableId ?? ''}
        onChange={(event) => onTableChange(event.target.value || null)}
        disabled={orderType !== 'dine-in'}
        helperText={orderType !== 'dine-in' ? 'Table label is for dine-in.' : undefined}
      />

      <label className="input-field">
        <span className="input-label">Order Notes (optional)</span>
        <textarea
          className="textarea"
          placeholder="Add order notes (max 250 chars)"
          value={notes}
          name="orderNotes"
          onChange={(event) => onNotesChange(event.target.value)}
          maxLength={250}
        />
      </label>
    </div>
  )
}

export default CartOrderFields

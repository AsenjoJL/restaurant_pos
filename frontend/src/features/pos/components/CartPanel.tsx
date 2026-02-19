import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { tables } from '../../../mock/data'
import { formatCurrency } from '../../../shared/lib/format'
import { useCommandLock } from '../../../shared/hooks/useCommandLock'
import Button from '../../../shared/components/ui/Button'
import Select from '../../../shared/components/ui/Select'
import {
  clearDraft,
  openConfirm,
  openModifierModal,
  openPaymentModal,
  setItemNote,
  setItemQuantity,
  setOrderNotes,
  setOrderType,
  setTable,
} from '../pos.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectDraft, selectTotals } from '../pos.selectors'
import CartItemRow from './cart/CartItemRow'
import { buildStaffOrder, generateStaffOrderNumber } from '../pos.utils'
import { addOrder } from '../../orders/orders.store'
import { pushToast } from '../../../shared/store/ui.store'

function CartPanel() {
  const dispatch = useAppDispatch()
  const draft = useAppSelector(selectDraft)
  const totals = useAppSelector(selectTotals)
  const user = useAppSelector(selectAuthUser)
  const { isLocked: isPaying, withLock: withPayLock } = useCommandLock('pos.pay')

  const tableOptions = [
    { value: '', label: 'Select table' },
    ...tables.map((table) => ({ value: table.id, label: table.name })),
  ]

  const handleCheckout = () => {
    if (draft.items.length === 0) {
      dispatch(
        pushToast({
          title: 'Cart is empty',
          description: 'Add items before checkout.',
          variant: 'error',
        }),
      )
      return
    }

    if (draft.orderType === 'dine-in' && !draft.tableId) {
      dispatch(
        pushToast({
          title: 'Table required',
          description: 'Select a table for dine-in orders.',
          variant: 'error',
        }),
      )
      return
    }

    const orderNo = generateStaffOrderNumber()
    const placedAt = new Date().toISOString()
    const tableLabel =
      draft.tableId && draft.orderType === 'dine-in'
        ? tables.find((table) => table.id === draft.tableId)?.name ?? draft.tableId
        : ''

    const order = buildStaffOrder({
      orderNo,
      draft,
      totals,
      tableLabel,
      placedAt,
    })

    dispatch(addOrder(order))
    dispatch(openPaymentModal({ orderId: order.id }))
  }

  return (
    <aside className="pos-cart panel">
      <div className="cart-header">
        <div>
          <h2>Current Order</h2>
          <p className="muted">{draft.items.length} items</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => dispatch(openConfirm({ intent: 'clear-cart' }))}
          disabled={draft.items.length === 0}
        >
          Clear Cart
        </Button>
      </div>

      <div className="order-header">
        <div>
          <p className="muted">Order</p>
          <h3>{draft.id}</h3>
        </div>
        <div>
          <p className="muted">Staff</p>
          <span className="chip">{user?.name ?? 'Unassigned'}</span>
        </div>
      </div>

      <div className="order-type">
        <button
          type="button"
          className={`segmented-button${draft.orderType === 'dine-in' ? ' is-active' : ''}`}
          onClick={() => dispatch(setOrderType('dine-in'))}
        >
          Dine-In
        </button>
        <button
          type="button"
          className={`segmented-button${draft.orderType === 'takeout' ? ' is-active' : ''}`}
          onClick={() => dispatch(setOrderType('takeout'))}
        >
          Takeout
        </button>
      </div>

      <Select
        label="Table"
        value={draft.tableId ?? ''}
        options={tableOptions}
        onChange={(event) => dispatch(setTable(event.target.value || null))}
        disabled={draft.orderType !== 'dine-in'}
        helperText={draft.orderType !== 'dine-in' ? 'Table selection is for dine-in.' : undefined}
      />

      <label className="input-field">
        <span className="input-label">Order Notes</span>
        <textarea
          className="textarea"
          placeholder="Add order notes (max 250 chars)"
          value={draft.notes}
          onChange={(event) => dispatch(setOrderNotes(event.target.value))}
          maxLength={250}
        />
      </label>

      <div className="cart-list">
        {draft.items.length === 0 ? (
          <div className="cart-empty">
            <h3>No items yet</h3>
            <p className="muted">Start adding dishes from the menu.</p>
          </div>
        ) : (
          draft.items.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              onIncrease={() =>
                dispatch(
                  setItemQuantity({
                    productId: item.product.id,
                    quantity: item.quantity + 1,
                  }),
                )
              }
              onDecrease={() =>
                dispatch(
                  setItemQuantity({
                    productId: item.product.id,
                    quantity: item.quantity - 1,
                  }),
                )
              }
              onVoid={() =>
                dispatch(openConfirm({ intent: 'void-item', targetId: item.product.id }))
              }
              onOpenModifiers={() => dispatch(openModifierModal(item.product.id))}
              onNoteChange={(value) =>
                dispatch(setItemNote({ productId: item.product.id, note: value }))
              }
            />
          ))
        )}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Discount</span>
          <span>- {formatCurrency(totals.discount)}</span>
        </div>
        <div className="summary-row">
          <span>Service</span>
          <span>{formatCurrency(totals.service)}</span>
        </div>
        <div className="summary-row">
          <span>Tax</span>
          <span>{formatCurrency(totals.tax)}</span>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="cart-actions">
        <Button
          variant="primary"
          disabled={draft.items.length === 0 || isPaying}
          onClick={() =>
            withPayLock(() => {
              handleCheckout()
            })
          }
        >
          Checkout / Take Payment
        </Button>
        <Button
          variant="ghost"
          disabled={draft.items.length === 0}
          onClick={() => dispatch(clearDraft())}
        >
          New Order
        </Button>
      </div>
    </aside>
  )
}

export default CartPanel

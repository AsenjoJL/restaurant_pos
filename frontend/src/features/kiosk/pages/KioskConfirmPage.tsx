import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../../shared/components/ui/Button'
import { formatCurrency } from '../../../shared/lib/format'
import { MAX_NOTE_LENGTH } from '../../../shared/lib/validators'
import { pushToast } from '../../../shared/store/ui.store'
import { useAppDispatch } from '../../../app/store/hooks'
import { addOrder } from '../../orders/orders.store'
import { useKiosk } from '../kiosk.context'
import { getModifierGroupsForCategory } from '../kiosk.data'

function KioskConfirmPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { state, totals, setNote, placeOrder } = useKiosk()
  const [isPlacing, setIsPlacing] = useState(false)

  useEffect(() => {
    if (!state.orderType) {
      navigate('/kiosk/order-type', { replace: true })
    }
  }, [navigate, state.orderType])

  const requiredErrors = useMemo(() => {
    return state.cart.flatMap((item) => {
      const groups = getModifierGroupsForCategory(item.product.categoryId)
      const requiredGroups = groups.filter((group) => group.selection === 'single')
      if (requiredGroups.length === 0) {
        return []
      }
      const missing = requiredGroups.filter(
        (group) => !item.modifiers.some((modifier) => modifier.startsWith(`${group.name}:`)),
      )
      return missing.length > 0 ? [item.product.name] : []
    })
  }, [state.cart])

  const handlePlaceOrder = () => {
    if (isPlacing) {
      return
    }
    if (state.cart.length === 0) {
      dispatch(
        pushToast({
          title: 'Cart is empty',
          description: 'Add at least one item to place an order.',
          variant: 'error',
        }),
      )
      return
    }
    if (requiredErrors.length > 0) {
      dispatch(
        pushToast({
          title: 'Missing required options',
          description: `Select required options for ${requiredErrors[0]}.`,
          variant: 'error',
        }),
      )
      return
    }
    if (state.note.length > MAX_NOTE_LENGTH) {
      dispatch(
        pushToast({
          title: 'Note too long',
          description: `Order notes must be ${MAX_NOTE_LENGTH} characters or less.`,
          variant: 'error',
        }),
      )
      return
    }
    setIsPlacing(true)
    const result = placeOrder()
    if (!result) {
      setIsPlacing(false)
      dispatch(
        pushToast({
          title: 'Order failed',
          description: 'Please choose an order type and add items.',
          variant: 'error',
        }),
      )
      return
    }
    dispatch(addOrder(result.order))
    dispatch(
      pushToast({
        title: 'Order placed',
        description: `Order ${result.orderNumber} is ready for payment.`,
        variant: 'success',
      }),
    )
    navigate(`/kiosk/success/${result.orderNumber}`)
  }

  return (
    <section className="kiosk-page">
      <div className="page-header">
        <div>
          <h2>Confirm your order</h2>
          <p className="muted">Review and place your order to get a slip.</p>
        </div>
      </div>

      <div className="panel kiosk-confirm-panel">
        <div className="kiosk-confirm-summary">
          <div>
            <h3>{state.cart.length} items</h3>
            <p className="muted">Order type: {state.orderType ?? 'Not set'}</p>
          </div>
          <div className="kiosk-total-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
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
        </div>
        <label className="note-field">
          <span className="input-label">Order note (optional)</span>
          <textarea
            className="textarea"
            placeholder="Allergy notes or special requests"
            value={state.note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={MAX_NOTE_LENGTH}
          />
        </label>
        <p className="muted">
          After submitting, you will receive an order number. Please pay at the counter.
        </p>
        <div className="kiosk-actions">
          <Button variant="outline" onClick={() => navigate('/kiosk/cart')} icon="arrow_back">
            Back to Cart
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handlePlaceOrder}
            disabled={state.cart.length === 0 || isPlacing}
            icon="done_all"
          >
            Place Order
          </Button>
        </div>
      </div>
    </section>
  )
}

export default KioskConfirmPage

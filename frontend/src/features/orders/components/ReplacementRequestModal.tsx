import { nanoid } from '@reduxjs/toolkit'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import type { Order, ReplacementItem } from '../../../shared/types/order'
import { createReplacementRequest } from '../orders.store'

type ReplacementRequestModalProps = {
  isOpen: boolean
  order: Order | null
  onClose: () => void
}

function ReplacementRequestModal({ isOpen, order, onClose }: ReplacementRequestModalProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)

  const [qtyMap, setQtyMap] = useState<Record<string, Record<string, string>>>({})
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const orderId = order?.id ?? ''

  const rawQtys = useMemo(
    () => (orderId ? qtyMap[orderId] ?? {} : {}),
    [orderId, qtyMap],
  )

  const reason = orderId ? reasonMap[orderId] ?? '' : ''

  const lineItems = useMemo(() => order?.items ?? [], [order])

  const replacementItems = useMemo<ReplacementItem[]>(() => {
    if (!order) {
      return []
    }
    return lineItems
      .map((item) => ({
        productId: item.id,
        name: item.name,
        qty: Number(rawQtys[item.id] ?? 0),
      }))
      .filter((item) => item.qty > 0)
  }, [lineItems, order, rawQtys])

  const canSubmit =
    Boolean(order) &&
    replacementItems.length > 0 &&
    reason.trim().length > 0 &&
    !isProcessing

  const handleClose = () => {
    setIsProcessing(false)
    onClose()
  }

  const handleConfirm = () => {
    if (!order || !user) {
      return
    }
    if (user.role !== 'cashier') {
      dispatch(
        pushToast({
          title: 'Cashier only',
          description: 'Only cashiers can request a replacement.',
          variant: 'error',
        }),
      )
      return
    }
    if (replacementItems.length === 0) {
      dispatch(
        pushToast({
          title: 'Select items',
          description: 'Choose items for replacement.',
          variant: 'error',
        }),
      )
      return
    }
    if (reason.trim().length === 0) {
      dispatch(
        pushToast({
          title: 'Reason required',
          description: 'Provide a reason for the replacement.',
          variant: 'error',
        }),
      )
      return
    }

    setIsProcessing(true)
    dispatch(
      createReplacementRequest({
        id: nanoid(),
        orderId: order.id,
        items: replacementItems,
        reason: reason.trim(),
        requestedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    dispatch(
      pushToast({
        title: 'Replacement requested',
        description: `Replacement request for ${order.order_no} sent for approval.`,
        variant: 'success',
      }),
    )
    setIsProcessing(false)
    handleClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Request Replacement"
      onClose={handleClose}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!canSubmit}
            icon="restaurant"
          >
            Submit Request
          </Button>
        </div>
      }
    >
      {!order ? (
        <div className="empty-state">
          <h3>No order selected</h3>
          <p className="muted">Choose a completed order to request a replacement.</p>
        </div>
      ) : (
        <div className="replacement-modal">
          <div className="replacement-header">
            <div>
              <h3>Order {order.order_no}</h3>
              <p className="muted">Select items that need to be remade.</p>
            </div>
            <span className="replacement-pill">REMAKE / REPLACEMENT</span>
          </div>

          <div className="replacement-items">
            {lineItems.map((item) => {
              const currentQty = Number(rawQtys[item.id] ?? 0)
              return (
                <div key={item.id} className="replacement-item-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span className="muted">Max {item.quantity}</span>
                  </div>
                  <Input
                    value={String(currentQty)}
                    type="number"
                    min="0"
                    max={item.quantity}
                    inputMode="numeric"
                    onChange={(event) => {
                      const rawValue = Number(event.target.value)
                      const nextValue = Number.isNaN(rawValue)
                        ? ''
                        : String(Math.max(0, Math.min(rawValue, item.quantity)))
                      setQtyMap((prev) => ({
                        ...prev,
                        [orderId]: {
                          ...prev[orderId],
                          [item.id]: nextValue,
                        },
                      }))
                    }}
                  />
                </div>
              )
            })}
          </div>

          <label className="input-field">
            <span className="input-label">Reason</span>
            <textarea
              className="textarea"
              placeholder="Replacement reason"
              value={reason}
              onChange={(event) =>
                setReasonMap((prev) => ({ ...prev, [orderId]: event.target.value }))
              }
              maxLength={250}
            />
          </label>
        </div>
      )}
    </Modal>
  )
}

export default ReplacementRequestModal

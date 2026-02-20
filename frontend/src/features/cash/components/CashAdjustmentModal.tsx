import { nanoid } from '@reduxjs/toolkit'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import Select from '../../../shared/components/ui/Select'
import { formatCurrency } from '../../../shared/lib/format'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectOrders } from '../../orders/orders.selectors'
import type { CashAdjustmentType } from '../../../shared/types/cash'
import { createCashAdjustmentRequest } from '../cash.store'

type CashAdjustmentModalProps = {
  isOpen: boolean
  onClose: () => void
}

function CashAdjustmentModal({ isOpen, onClose }: CashAdjustmentModalProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)

  const [type, setType] = useState<CashAdjustmentType>('SHORTAGE')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [relatedOrderId, setRelatedOrderId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const orderOptions = useMemo(
    () => [
      { value: '', label: 'No related order' },
      ...orders.map((order) => ({
        value: order.id,
        label: `${order.order_no} · ${formatCurrency(order.total)}`,
      })),
    ],
    [orders],
  )

  const amountNumber = Number(amount)
  const isAmountValid = !Number.isNaN(amountNumber) && amountNumber > 0
  const canSubmit = isAmountValid && reason.trim().length > 0 && !isProcessing

  const handleClose = () => {
    setIsProcessing(false)
    onClose()
  }

  const handleSubmit = () => {
    if (!user) {
      return
    }
    if (user.role !== 'cashier') {
      dispatch(
        pushToast({
          title: 'Cashier only',
          description: 'Only cashiers can report wrong change.',
          variant: 'error',
        }),
      )
      return
    }
    if (!isAmountValid) {
      dispatch(
        pushToast({
          title: 'Enter amount',
          description: 'Provide a valid adjustment amount.',
          variant: 'error',
        }),
      )
      return
    }
    if (reason.trim().length === 0) {
      dispatch(
        pushToast({
          title: 'Reason required',
          description: 'Explain the wrong change incident.',
          variant: 'error',
        }),
      )
      return
    }

    setIsProcessing(true)
    dispatch(
      createCashAdjustmentRequest({
        id: nanoid(),
        type,
        amount: amountNumber,
        reason: reason.trim(),
        relatedOrderId: relatedOrderId || undefined,
        requestedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    dispatch(
      pushToast({
        title: 'Adjustment requested',
        description: 'Wrong change report sent for approval.',
        variant: 'success',
      }),
    )
    setIsProcessing(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Report Wrong Change"
      onClose={handleClose}
      footer={
        <div className="modal-actions">
          <Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={!canSubmit}
            icon="report"
          >
            Submit Report
          </Button>
        </div>
      }
    >
      <div className="cash-adjustment-modal">
        <div className="cash-adjustment-type">
          <button
            type="button"
            className={`cash-adjustment-toggle${type === 'SHORTAGE' ? ' is-active' : ''}`}
            onClick={() => setType('SHORTAGE')}
          >
            Shortage
          </button>
          <button
            type="button"
            className={`cash-adjustment-toggle${type === 'OVERAGE' ? ' is-active' : ''}`}
            onClick={() => setType('OVERAGE')}
          >
            Overage
          </button>
        </div>

        <Input
          label="Amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="0.00"
        />

        <Select
          label="Related order (optional)"
          value={relatedOrderId}
          options={orderOptions}
          onChange={(event) => setRelatedOrderId(event.target.value)}
        />

        <label className="input-field">
          <span className="input-label">Reason</span>
          <textarea
            className="textarea"
            placeholder="Explain what happened"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={250}
          />
        </label>
      </div>
    </Modal>
  )
}

export default CashAdjustmentModal

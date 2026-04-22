import { nanoid } from '@reduxjs/toolkit'
import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { pushToast } from '../../../shared/store/ui.store'
import type { CashAdjustmentType } from '../../../shared/types/cash'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectOrders } from '../../orders/orders.selectors'
import { createCashAdjustmentRequest } from '../cash.store'
import { buildCashAdjustmentOrderOptions } from '../cash.ui'

function useCashAdjustmentController() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)

  const [type, setType] = useState<CashAdjustmentType>('SHORTAGE')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [relatedOrderId, setRelatedOrderId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const orderOptions = useMemo(() => buildCashAdjustmentOrderOptions(orders), [orders])
  const amountNumber = Number(amount)
  const isAmountValid = !Number.isNaN(amountNumber) && amountNumber > 0
  const canSubmit = isAmountValid && reason.trim().length > 0 && !isProcessing

  const reset = () => {
    setType('SHORTAGE')
    setAmount('')
    setReason('')
    setRelatedOrderId('')
    setIsProcessing(false)
  }

  const handleSubmit = () => {
    if (!user) {
      return false
    }
    if (user.role !== 'cashier') {
      dispatch(
        pushToast({
          title: 'Cashier only',
          description: 'Only cashiers can report wrong change.',
          variant: 'error',
        }),
      )
      return false
    }
    if (!isAmountValid) {
      dispatch(
        pushToast({
          title: 'Enter amount',
          description: 'Provide a valid adjustment amount.',
          variant: 'error',
        }),
      )
      return false
    }
    if (reason.trim().length === 0) {
      dispatch(
        pushToast({
          title: 'Reason required',
          description: 'Explain the wrong change incident.',
          variant: 'error',
        }),
      )
      return false
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
    logAuditEvent(dispatch, {
      scope: 'CASH_ADJUSTMENT',
      action: 'REQUESTED',
      message: `Cash adjustment requested (${type}) for ${amountNumber}.`,
      user: buildAuditUser(user),
      entityId: relatedOrderId || undefined,
    })
    dispatch(
      pushToast({
        title: 'Adjustment requested',
        description: 'Wrong change report sent for approval.',
        variant: 'success',
      }),
    )
    setIsProcessing(false)
    reset()
    return true
  }

  return {
    amount,
    canSubmit,
    isProcessing,
    orderOptions,
    reason,
    relatedOrderId,
    type,
    setAmount,
    setReason,
    setRelatedOrderId,
    setType,
    reset,
    handleSubmit,
  }
}

export default useCashAdjustmentController

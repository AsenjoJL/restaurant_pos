import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectOrders } from '../../orders/orders.selectors'
import { selectCashDrawerActiveShiftId, selectCashDrawerShifts } from '../cash.selectors'
import { addCashDrawerEntry, closeCashDrawerShift, openCashDrawerShift } from '../cash.store'
import {
  buildCashDrawerTotals,
  CASH_DRAWER_ENTRY_TYPE_OPTIONS,
  getActiveCashDrawerShift,
  parseCashAmount,
} from '../cash.ui'
import type { CashDrawerEntryType } from '../../../shared/types/cash'

function useCashDrawerController() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)
  const shifts = useAppSelector(selectCashDrawerShifts)
  const activeShiftId = useAppSelector(selectCashDrawerActiveShiftId)

  const activeShift = useMemo(
    () => getActiveCashDrawerShift(shifts, activeShiftId),
    [activeShiftId, shifts],
  )

  const [openingFloat, setOpeningFloat] = useState('')
  const [entryType, setEntryType] = useState<CashDrawerEntryType>('IN')
  const [entryAmount, setEntryAmount] = useState('')
  const [entryReason, setEntryReason] = useState('')
  const [countedCash, setCountedCash] = useState('')
  const [closeNotes, setCloseNotes] = useState('')

  const cashTotals = useMemo(
    () =>
      buildCashDrawerTotals({
        activeShift,
        orders,
      }),
    [activeShift, orders],
  )

  const handleOpenShift = () => {
    if (!user) {
      return
    }

    const amount = parseCashAmount(openingFloat)
    if (amount === null || amount < 0) {
      dispatch(
        pushToast({
          title: 'Invalid float',
          description: 'Enter a valid opening float amount.',
          variant: 'error',
        }),
      )
      return
    }

    dispatch(
      openCashDrawerShift({
        openingFloat: amount,
        openedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    logAuditEvent(dispatch, {
      scope: 'CASH_DRAWER',
      action: 'OPEN',
      message: `Cash drawer opened with float ${amount}.`,
      user: buildAuditUser(user),
    })
    setOpeningFloat('')
  }

  const handleAddEntry = () => {
    if (!user) {
      return
    }

    const amount = parseCashAmount(entryAmount)
    if (amount === null || amount <= 0) {
      dispatch(
        pushToast({
          title: 'Invalid amount',
          description: 'Enter a cash in/out amount greater than zero.',
          variant: 'error',
        }),
      )
      return
    }
    if (entryReason.trim().length === 0) {
      dispatch(
        pushToast({
          title: 'Reason required',
          description: 'Provide a reason for the cash movement.',
          variant: 'error',
        }),
      )
      return
    }

    dispatch(
      addCashDrawerEntry({
        type: entryType,
        amount,
        reason: entryReason.trim(),
        createdBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    logAuditEvent(dispatch, {
      scope: 'CASH_DRAWER',
      action: entryType === 'IN' ? 'CASH_IN' : 'CASH_OUT',
      message: `${entryType === 'IN' ? 'Cash in' : 'Cash out'} ${amount}.`,
      user: buildAuditUser(user),
    })
    setEntryAmount('')
    setEntryReason('')
  }

  const handleCloseShift = () => {
    if (!user || !activeShift) {
      return
    }

    const counted = parseCashAmount(countedCash)
    if (counted === null || counted < 0) {
      dispatch(
        pushToast({
          title: 'Enter counted cash',
          description: 'Provide a valid counted cash amount.',
          variant: 'error',
        }),
      )
      return
    }

    dispatch(
      closeCashDrawerShift({
        countedCash: counted,
        expectedCash: cashTotals.expectedCash,
        notes: closeNotes.trim() || undefined,
        closedBy: { id: user.id, name: user.name, role: user.role },
      }),
    )
    logAuditEvent(dispatch, {
      scope: 'CASH_DRAWER',
      action: 'CLOSE',
      message: `Cash drawer closed. Variance ${(counted - cashTotals.expectedCash).toFixed(2)}.`,
      user: buildAuditUser(user),
    })
    setCountedCash('')
    setCloseNotes('')
  }

  return {
    activeShift,
    cashTotals,
    closeNotes,
    countedCash,
    entryAmount,
    entryReason,
    entryType,
    entryTypeOptions: CASH_DRAWER_ENTRY_TYPE_OPTIONS,
    openingFloat,
    setCloseNotes,
    setCountedCash,
    setEntryAmount,
    setEntryReason,
    setEntryType,
    setOpeningFloat,
    handleAddEntry,
    handleCloseShift,
    handleOpenShift,
  }
}

export default useCashDrawerController

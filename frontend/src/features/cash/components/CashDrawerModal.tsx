import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Modal from '../../../shared/components/ui/Modal'
import { formatCurrency } from '../../../shared/lib/format'
import { buildAuditUser, logAuditEvent } from '../../../shared/lib/audit'
import { isPaymentCaptured } from '../../../shared/lib/orders'
import { pushToast } from '../../../shared/store/ui.store'
import { selectAuthUser } from '../../auth/auth.selectors'
import { selectOrders } from '../../orders/orders.selectors'
import {
  addCashDrawerEntry,
  closeCashDrawerShift,
  openCashDrawerShift,
} from '../cash.store'
import {
  selectCashDrawerActiveShiftId,
  selectCashDrawerShifts,
} from '../cash.selectors'
import type { CashDrawerEntryType } from '../../../shared/types/cash'

type CashDrawerModalProps = {
  isOpen: boolean
  onClose: () => void
}

const parseAmount = (value: string) => {
  const amount = Number(value)
  if (Number.isNaN(amount)) {
    return null
  }
  return amount
}

function CashDrawerModal({ isOpen, onClose }: CashDrawerModalProps) {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectAuthUser)
  const orders = useAppSelector(selectOrders)
  const shifts = useAppSelector(selectCashDrawerShifts)
  const activeShiftId = useAppSelector(selectCashDrawerActiveShiftId)

  const activeShift = useMemo(
    () => shifts.find((shift) => shift.id === activeShiftId) ?? null,
    [activeShiftId, shifts],
  )

  const [openingFloat, setOpeningFloat] = useState('')
  const [entryType, setEntryType] = useState<CashDrawerEntryType>('IN')
  const [entryAmount, setEntryAmount] = useState('')
  const [entryReason, setEntryReason] = useState('')
  const [countedCash, setCountedCash] = useState('')
  const [closeNotes, setCloseNotes] = useState('')

  const cashTotals = useMemo(() => {
    if (!activeShift) {
      return {
        cashInTotal: 0,
        cashOutTotal: 0,
        cashSalesTotal: 0,
        expectedCash: 0,
      }
    }

    const cashInTotal = activeShift.entries
      .filter((entry) => entry.type === 'IN')
      .reduce((sum, entry) => sum + entry.amount, 0)
    const cashOutTotal = activeShift.entries
      .filter((entry) => entry.type === 'OUT')
      .reduce((sum, entry) => sum + entry.amount, 0)

    const shiftStart = new Date(activeShift.openedAt).getTime()
    const shiftEnd = activeShift.closedAt
      ? new Date(activeShift.closedAt).getTime()
      : Date.now()

    const cashSalesTotal = orders.reduce((sum, order) => {
      if (order.payment_method !== 'CASH' || !isPaymentCaptured(order)) {
        return sum
      }
      const paymentEntry = order.audit_log.find((entry) => entry.action === 'PAYMENT')
      if (!paymentEntry) {
        return sum
      }
      const paidAt = new Date(paymentEntry.at).getTime()
      if (paidAt < shiftStart || paidAt > shiftEnd) {
        return sum
      }
      const paidAmount = order.payment_amount ?? order.total
      const change = order.payment_change ?? 0
      const collected = Math.max(0, paidAmount - change)
      return sum + collected
    }, 0)

    const expectedCash =
      activeShift.openingFloat + cashInTotal - cashOutTotal + cashSalesTotal

    return { cashInTotal, cashOutTotal, cashSalesTotal, expectedCash }
  }, [activeShift, orders])

  const handleOpenShift = () => {
    if (!user) {
      return
    }
    const amount = parseAmount(openingFloat)
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
    const amount = parseAmount(entryAmount)
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
    const counted = parseAmount(countedCash)
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

  return (
    <Modal isOpen={isOpen} title="Cash Drawer" onClose={onClose}>
      {!activeShift ? (
        <div className="cash-drawer-empty">
          <h3>No active shift</h3>
          <p className="muted">Open a drawer shift to track cash movements.</p>
          <Input
            label="Opening float"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={openingFloat}
            onChange={(event) => setOpeningFloat(event.target.value)}
          />
          <div className="cash-drawer-actions">
            <Button variant="primary" onClick={handleOpenShift} icon="lock_open">
              Open Drawer
            </Button>
          </div>
        </div>
      ) : (
        <div className="cash-drawer-modal">
          <div className="cash-drawer-summary">
            <div>
              <p className="muted">Opened</p>
              <strong>{new Date(activeShift.openedAt).toLocaleString()}</strong>
            </div>
            <div>
              <p className="muted">Opening Float</p>
              <strong>{formatCurrency(activeShift.openingFloat)}</strong>
            </div>
            <div>
              <p className="muted">Cash Sales</p>
              <strong>{formatCurrency(cashTotals.cashSalesTotal)}</strong>
            </div>
            <div>
              <p className="muted">Expected Cash</p>
              <strong>{formatCurrency(cashTotals.expectedCash)}</strong>
            </div>
          </div>

          <div className="cash-drawer-entry">
            <div className="cash-drawer-toggle">
              <button
                type="button"
                className={`cash-drawer-toggle-btn${entryType === 'IN' ? ' is-active' : ''}`}
                onClick={() => setEntryType('IN')}
              >
                Cash In
              </button>
              <button
                type="button"
                className={`cash-drawer-toggle-btn${entryType === 'OUT' ? ' is-active' : ''}`}
                onClick={() => setEntryType('OUT')}
              >
                Cash Out
              </button>
            </div>
            <Input
              label="Amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={entryAmount}
              onChange={(event) => setEntryAmount(event.target.value)}
            />
            <Input
              label="Reason"
              placeholder="e.g. Petty cash, supplier payment"
              value={entryReason}
              onChange={(event) => setEntryReason(event.target.value)}
            />
            <Button variant="outline" onClick={handleAddEntry} icon="add">
              Record Entry
            </Button>
          </div>

          <div className="cash-drawer-history">
            <div className="cash-drawer-history-header">
              <h3>Cash Movements</h3>
              <span className="muted">{activeShift.entries.length} entries</span>
            </div>
            {activeShift.entries.length === 0 ? (
              <div className="empty-state">
                <p className="muted">No cash in/out entries yet.</p>
              </div>
            ) : (
              <div className="cash-drawer-history-list">
                {activeShift.entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="cash-drawer-history-row">
                    <span className={`chip chip-${entry.type === 'IN' ? 'paid' : 'refunded'}`}>
                      {entry.type === 'IN' ? 'IN' : 'OUT'}
                    </span>
                    <span>{formatCurrency(entry.amount)}</span>
                    <span className="muted">{entry.reason}</span>
                    <span className="muted">
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="cash-drawer-close">
            <Input
              label="Counted cash"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={countedCash}
              onChange={(event) => setCountedCash(event.target.value)}
            />
            <Input
              label="Closing note (optional)"
              placeholder="Add a closing note"
              value={closeNotes}
              onChange={(event) => setCloseNotes(event.target.value)}
            />
            <div className="cash-drawer-actions">
              <Button variant="danger" onClick={handleCloseShift} icon="lock">
                Close Shift
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default CashDrawerModal

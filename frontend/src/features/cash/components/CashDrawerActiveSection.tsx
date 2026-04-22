import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { formatCurrency } from '../../../shared/lib/format'
import type { CashDrawerShift, CashDrawerEntryType } from '../../../shared/types/cash'

type CashDrawerActiveSectionProps = {
  activeShift: CashDrawerShift
  cashTotals: {
    cashInTotal: number
    cashOutTotal: number
    cashSalesTotal: number
    expectedCash: number
  }
  closeNotes: string
  countedCash: string
  entryAmount: string
  entryReason: string
  entryType: CashDrawerEntryType
  onAddEntry: () => void
  onCloseNotesChange: (value: string) => void
  onCloseShift: () => void
  onCountedCashChange: (value: string) => void
  onEntryAmountChange: (value: string) => void
  onEntryReasonChange: (value: string) => void
  onEntryTypeChange: (value: CashDrawerEntryType) => void
}

function CashDrawerActiveSection({
  activeShift,
  cashTotals,
  closeNotes,
  countedCash,
  entryAmount,
  entryReason,
  entryType,
  onAddEntry,
  onCloseNotesChange,
  onCloseShift,
  onCountedCashChange,
  onEntryAmountChange,
  onEntryReasonChange,
  onEntryTypeChange,
}: CashDrawerActiveSectionProps) {
  return (
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
            onClick={() => onEntryTypeChange('IN')}
          >
            Cash In
          </button>
          <button
            type="button"
            className={`cash-drawer-toggle-btn${entryType === 'OUT' ? ' is-active' : ''}`}
            onClick={() => onEntryTypeChange('OUT')}
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
          onChange={(event) => onEntryAmountChange(event.target.value)}
        />
        <Input
          label="Reason"
          placeholder="e.g. Petty cash, supplier payment"
          value={entryReason}
          onChange={(event) => onEntryReasonChange(event.target.value)}
        />
        <Button variant="outline" onClick={onAddEntry} icon="add">
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
                <span className="muted">{new Date(entry.createdAt).toLocaleTimeString()}</span>
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
          onChange={(event) => onCountedCashChange(event.target.value)}
        />
        <Input
          label="Closing note (optional)"
          placeholder="Add a closing note"
          value={closeNotes}
          onChange={(event) => onCloseNotesChange(event.target.value)}
        />
        <div className="cash-drawer-actions">
          <Button variant="danger" onClick={onCloseShift} icon="lock">
            Close Shift
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CashDrawerActiveSection

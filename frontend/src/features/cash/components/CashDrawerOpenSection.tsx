import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'

type CashDrawerOpenSectionProps = {
  openingFloat: string
  onOpenShift: () => void
  onOpeningFloatChange: (value: string) => void
}

function CashDrawerOpenSection({
  openingFloat,
  onOpenShift,
  onOpeningFloatChange,
}: CashDrawerOpenSectionProps) {
  return (
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
        onChange={(event) => onOpeningFloatChange(event.target.value)}
      />
      <div className="cash-drawer-actions">
        <Button variant="primary" onClick={onOpenShift} icon="lock_open">
          Open Drawer
        </Button>
      </div>
    </div>
  )
}

export default CashDrawerOpenSection

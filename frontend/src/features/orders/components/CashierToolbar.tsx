import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import { formatOverrideRemaining } from '../../../shared/lib/admin-override'

type CashierToolbarProps = {
  adminOverride: boolean
  canOperateCashier: boolean
  isAdmin: boolean
  isCashier: boolean
  onOpenCashAdjustment: () => void
  onOpenCashDrawer: () => void
  onQueryChange: (value: string) => void
  overrideRemainingMs: number
  query: string
  toggleAdminOverride: () => void
}

function CashierToolbar({
  adminOverride,
  canOperateCashier,
  isAdmin,
  isCashier,
  onOpenCashAdjustment,
  onOpenCashDrawer,
  onQueryChange,
  overrideRemainingMs,
  query,
  toggleAdminOverride,
}: CashierToolbarProps) {
  return (
    <div className="cashier-tools">
      <Input
        placeholder="Search by order number"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      {isCashier ? (
        <Button variant="outline" onClick={onOpenCashAdjustment} icon="report">
          Report Wrong Change
        </Button>
      ) : null}
      {isAdmin ? (
        <Button variant={adminOverride ? 'primary' : 'outline'} onClick={toggleAdminOverride}>
          {adminOverride
            ? `Override ON ${formatOverrideRemaining(overrideRemainingMs)}`
            : 'Enable Override'}
        </Button>
      ) : null}
      {canOperateCashier ? (
        <Button variant="outline" onClick={onOpenCashDrawer} icon="point_of_sale">
          Cash Drawer
        </Button>
      ) : null}
    </div>
  )
}

export default CashierToolbar

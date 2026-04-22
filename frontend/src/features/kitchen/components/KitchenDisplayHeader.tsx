import Button from '../../../shared/components/ui/Button'
import { formatOverrideRemaining } from '../../../shared/lib/admin-override'

type KitchenDisplayHeaderProps = {
  adminOverride: boolean
  isAdmin: boolean
  overrideRemainingMs: number
  onOpenCustomerBoard: () => void
  onToggleAdminOverride: () => void
}

function KitchenDisplayHeader({
  adminOverride,
  isAdmin,
  overrideRemainingMs,
  onOpenCustomerBoard,
  onToggleAdminOverride,
}: KitchenDisplayHeaderProps) {
  return (
    <div className="page-header">
      <div className="kitchen-intro">
        <p className="kitchen-kicker">Back of House</p>
        <h2>Kitchen Display</h2>
        <p className="muted">
          SENT_TO_KITCHEN+ orders from kiosk and staff.
          {isAdmin && !adminOverride ? ' Admin is currently view-only.' : ''}
        </p>
      </div>
      <div className="kitchen-tools">
        <Button variant="outline" onClick={onOpenCustomerBoard}>
          Open Customer Board
        </Button>
        {isAdmin ? (
          <Button variant={adminOverride ? 'primary' : 'outline'} onClick={onToggleAdminOverride}>
            {adminOverride
              ? `Override ON ${formatOverrideRemaining(overrideRemainingMs)}`
              : 'Enable Override'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default KitchenDisplayHeader

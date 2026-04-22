import { CASHIER_TAB_COPY, CASHIER_TAB_ORDER } from '../cashier.constants'
import type { CashierTab } from '../cashier.logic'

type CashierQueueFiltersProps = {
  pendingCount: number
  readyCount: number
  selectedTab: CashierTab
  onTabChange: (tab: CashierTab) => void
}

function CashierQueueFilters({
  pendingCount,
  readyCount,
  selectedTab,
  onTabChange,
}: CashierQueueFiltersProps) {
  return (
    <aside className="cashier-sidebar">
      <h3>Queue Filters</h3>
      <div className="segmented segmented-vertical">
        {CASHIER_TAB_ORDER.map((tab) => {
          const isActive = selectedTab === tab
          const count = tab === 'unpaid' ? pendingCount : tab === 'ready' ? readyCount : 0
          const badgeClassName =
            tab === 'unpaid' ? 'segmented-badge segmented-badge--pending' : 'segmented-badge segmented-badge--ready'

          return (
            <button
              key={tab}
              type="button"
              className={`segmented-button${isActive ? ' is-active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              <span className="segmented-label">{CASHIER_TAB_COPY[tab].filterLabel}</span>
              {count > 0 ? <span className={badgeClassName}>{count}</span> : null}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default CashierQueueFilters

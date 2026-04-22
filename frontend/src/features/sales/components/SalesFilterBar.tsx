import Button from '../../../shared/components/ui/Button'
import Input from '../../../shared/components/ui/Input'
import Select from '../../../shared/components/ui/Select'

type SalesFilterBarProps = {
  query: string
  methodFilter: string
  statusFilter: string
  startDate: string
  endDate: string
  methodOptions: Array<{ value: string; label: string }>
  statusOptions: Array<{ value: string; label: string }>
  onQueryChange: (value: string) => void
  onMethodFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onExport: () => void
}

function SalesFilterBar({
  query,
  methodFilter,
  statusFilter,
  startDate,
  endDate,
  methodOptions,
  statusOptions,
  onQueryChange,
  onMethodFilterChange,
  onStatusFilterChange,
  onStartDateChange,
  onEndDateChange,
  onExport,
}: SalesFilterBarProps) {
  return (
    <div className="admin-toolbar admin-toolbar-surface sales-filter-bar">
      <Input
        label="Search"
        placeholder="Order ID or cashier"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        name="salesSearch"
      />
      <Select
        label="Payment Method"
        value={methodFilter}
        options={methodOptions}
        onChange={(event) => onMethodFilterChange(event.target.value)}
      />
      <Select
        label="Status"
        value={statusFilter}
        options={statusOptions}
        onChange={(event) => onStatusFilterChange(event.target.value)}
      />
      <Input
        label="Date From"
        type="date"
        value={startDate}
        onChange={(event) => onStartDateChange(event.target.value)}
        name="salesStartDate"
      />
      <Input
        label="Date To"
        type="date"
        value={endDate}
        onChange={(event) => onEndDateChange(event.target.value)}
        name="salesEndDate"
      />
      <Button variant="outline" onClick={onExport}>
        Export
      </Button>
    </div>
  )
}

export default SalesFilterBar

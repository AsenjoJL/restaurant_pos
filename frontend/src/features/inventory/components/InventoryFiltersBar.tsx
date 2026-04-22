import Input from '../../../shared/components/ui/Input'
import Select from '../../../shared/components/ui/Select'
import type { IngredientType } from '../inventory.types'

type InventoryFiltersBarProps = {
  categoryFilter: string
  categoryOptions: Array<{ value: string; label: string }>
  ingredientTypeFilter: 'all' | IngredientType
  ingredientTypeOptions: Array<{ value: string; label: string }>
  query: string
  statusFilter: 'all' | 'low' | 'ok'
  statusOptions: Array<{ value: string; label: string }>
  onCategoryFilterChange: (value: string) => void
  onIngredientTypeFilterChange: (value: 'all' | IngredientType) => void
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: 'all' | 'low' | 'ok') => void
}

function InventoryFiltersBar({
  categoryFilter,
  categoryOptions,
  ingredientTypeFilter,
  ingredientTypeOptions,
  query,
  statusFilter,
  statusOptions,
  onCategoryFilterChange,
  onIngredientTypeFilterChange,
  onQueryChange,
  onStatusFilterChange,
}: InventoryFiltersBarProps) {
  return (
    <div className="admin-toolbar admin-toolbar-surface">
      <Input
        label="Search"
        placeholder="Search by ID or ingredient"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <Select
        label="Category"
        value={categoryFilter}
        onChange={(event) => onCategoryFilterChange(event.target.value)}
        options={categoryOptions}
      />
      <Select
        label="Type"
        value={ingredientTypeFilter}
        onChange={(event) => onIngredientTypeFilterChange(event.target.value as 'all' | IngredientType)}
        options={ingredientTypeOptions}
      />
      <Select
        label="Status"
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value as 'all' | 'low' | 'ok')}
        options={statusOptions}
      />
    </div>
  )
}

export default InventoryFiltersBar

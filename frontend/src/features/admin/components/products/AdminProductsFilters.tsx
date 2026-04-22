import Input from '../../../../shared/components/ui/Input'
import Select from '../../../../shared/components/ui/Select'

type AdminProductsFiltersProps = {
  categoryFilter: string
  categoryOptions: Array<{ label: string; value: string }>
  classFilter: 'all' | 'RAW' | 'NON_RAW'
  classOptions: Array<{ label: string; value: string }>
  onCategoryFilterChange: (value: string) => void
  onClassFilterChange: (value: 'all' | 'RAW' | 'NON_RAW') => void
  onQueryChange: (value: string) => void
  query: string
}

function AdminProductsFilters({
  categoryFilter,
  categoryOptions,
  classFilter,
  classOptions,
  onCategoryFilterChange,
  onClassFilterChange,
  onQueryChange,
  query,
}: AdminProductsFiltersProps) {
  return (
    <div className="admin-toolbar admin-toolbar-surface">
      <Input
        label="Search"
        placeholder="Search products"
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
        label="Class"
        value={classFilter}
        onChange={(event) => onClassFilterChange(event.target.value as 'all' | 'RAW' | 'NON_RAW')}
        options={classOptions}
      />
    </div>
  )
}

export default AdminProductsFilters

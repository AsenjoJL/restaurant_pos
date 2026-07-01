import Input from '../../../../shared/components/ui/Input'
import Select from '../../../../shared/components/ui/Select'

type AdminProductsFiltersProps = {
  categoryFilter: string
  categoryOptions: Array<{ label: string; value: string }>
  onCategoryFilterChange: (value: string) => void
  onQueryChange: (value: string) => void
  query: string
}

function AdminProductsFilters({
  categoryFilter,
  categoryOptions,
  onCategoryFilterChange,
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
    </div>
  )
}

export default AdminProductsFilters

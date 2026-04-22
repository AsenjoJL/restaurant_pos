import Button from '../../../../shared/components/ui/Button'

type AdminProductsPageHeaderProps = {
  onAddProduct: () => void
  onBackToCatalog: () => void
}

function AdminProductsPageHeader({
  onAddProduct,
  onBackToCatalog,
}: AdminProductsPageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2>Menu Items</h2>
        <p className="muted">Search, edit, and activate menu items.</p>
      </div>
      <div className="admin-actions">
        <Button variant="outline" onClick={onBackToCatalog}>
          Back to Catalog
        </Button>
        <Button variant="primary" onClick={onAddProduct}>
          Add Product
        </Button>
      </div>
    </div>
  )
}

export default AdminProductsPageHeader

import Button from '../../../shared/components/ui/Button'
import ConfirmDialog from '../../../shared/components/ui/ConfirmDialog'
import AdminStatCard from '../components/AdminStatCard'
import CategoriesTable from '../components/categories/CategoriesTable'
import CategoryEditorModal from '../components/categories/CategoryEditorModal'
import useAdminCategoriesPageController from '../hooks/useAdminCategoriesPageController'

function AdminCategoriesPage() {
  const {
    categories,
    closeModal,
    confirm,
    editing,
    errors,
    form,
    formError,
    handleDeleteConfirm,
    handleDeleteRequest,
    handleSave,
    isModalOpen,
    isSaving,
    navigate,
    openAddModal,
    openEditModal,
    productCounts,
    setConfirm,
    setForm,
    stats,
  } = useAdminCategoriesPageController()

  return (
    <div className="page admin-page admin-categories-page">
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p className="muted">Group menu items for easier browsing.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={() => navigate('/admin/catalog')}>
            Back to Catalog
          </Button>
          <Button variant="primary" onClick={openAddModal}>
            Add Category
          </Button>
        </div>
      </div>

      <div className="admin-metrics">
        <AdminStatCard label="Total Categories" value={String(stats.total)} icon="/catalogue.png" />
        <AdminStatCard label="Active" value={String(stats.active)} helper="Visible" icon="/items.png" />
        <AdminStatCard label="Hidden" value={String(stats.hidden)} helper="Not visible" icon="/clear.png" />
        <AdminStatCard label="Menu Items" value={String(stats.products)} icon="/menu.png" />
      </div>

      <CategoriesTable
        categories={categories}
        productCounts={productCounts}
        onDelete={handleDeleteRequest}
        onEdit={openEditModal}
      />

      <CategoryEditorModal
        errors={errors}
        form={form}
        formError={formError}
        isEditing={Boolean(editing)}
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={closeModal}
        onDescriptionChange={(value) => setForm((current) => ({ ...current, description: value }))}
        onNameChange={(value) => setForm((current) => ({ ...current, name: value }))}
        onSave={() => {
          void handleSave()
        }}
      />

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Delete category"
        description="This will remove the category from the admin list."
        reason={confirm.reason}
        onReasonChange={(value) => setConfirm((prev) => ({ ...prev, reason: value }))}
        onConfirm={() => {
          void handleDeleteConfirm()
        }}
        onCancel={() => setConfirm({ isOpen: false, targetId: null, reason: '' })}
        confirmLabel="Delete"
      />
    </div>
  )
}

export default AdminCategoriesPage

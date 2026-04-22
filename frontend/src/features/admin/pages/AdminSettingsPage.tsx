import Button from '../../../shared/components/ui/Button'
import SettingsLiveSyncSection from '../components/settings/SettingsLiveSyncSection'
import SettingsReceiptSection from '../components/settings/SettingsReceiptSection'
import SettingsStoreSection from '../components/settings/SettingsStoreSection'
import SettingsTaxSection from '../components/settings/SettingsTaxSection'
import useAdminSettingsPageController from '../hooks/useAdminSettingsPageController'

function AdminSettingsPage() {
  const {
    errors,
    form,
    isSaving,
    setForm,
    handleBackToAdministration,
    handleSaveAction,
  } = useAdminSettingsPageController()

  return (
    <div className="page admin-page admin-settings-page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="muted">Configure tax rates and receipt messaging.</p>
        </div>
        <div className="admin-actions">
          <Button variant="outline" onClick={handleBackToAdministration}>
            Back to Administration
          </Button>
        </div>
      </div>

      <div className="panel admin-card admin-settings-card">
        <div className="admin-settings-grid">
          <SettingsStoreSection errors={errors} form={form} onFormChange={setForm} />
          <SettingsTaxSection errors={errors} form={form} onFormChange={setForm} />
          <SettingsReceiptSection form={form} onFormChange={setForm} />
          <SettingsLiveSyncSection errors={errors} form={form} onFormChange={setForm} />
        </div>
        <div className="admin-actions">
          <Button variant="primary" onClick={handleSaveAction} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettingsPage

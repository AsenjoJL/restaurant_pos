import type { ChangeEvent, RefObject } from 'react'
import Button from '../../../shared/components/ui/Button'

type InventoryPageHeaderProps = {
  fileInputRef: RefObject<HTMLInputElement | null>
  isImporting: boolean
  onBackToDashboard: () => void
  onDownloadTemplate: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenImportFilePicker: () => void
}

function InventoryPageHeader({
  fileInputRef,
  isImporting,
  onBackToDashboard,
  onDownloadTemplate,
  onImport,
  onOpenImportFilePicker,
}: InventoryPageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2>Inventory</h2>
        <p className="muted">Manage ingredients, stock levels, and reorder points.</p>
      </div>
      <div className="admin-row-actions">
        <Button variant="outline" onClick={onBackToDashboard}>
          Back to Dashboard
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={onImport}
        />
        <Button variant="ghost" onClick={onDownloadTemplate}>
          Download Template
        </Button>
        <Button variant="outline" onClick={onOpenImportFilePicker} disabled={isImporting}>
          {isImporting ? 'Importing...' : 'Import Excel'}
        </Button>
      </div>
    </div>
  )
}

export default InventoryPageHeader

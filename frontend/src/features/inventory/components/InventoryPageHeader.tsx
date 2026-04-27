import type { ChangeEvent, RefObject } from 'react'
import Button from '../../../shared/components/ui/Button'
import FileFormatAction from '../../../shared/components/ui/FileFormatAction'
import { DATA_FILE_ACCEPT } from '../../../shared/lib/exportFiles'
import type { InventoryFileFormat } from '../inventory.export'

type InventoryPageHeaderProps = {
  exportFormat: InventoryFileFormat
  fileInputRef: RefObject<HTMLInputElement | null>
  fileFormatOptions: Array<{ value: InventoryFileFormat; label: string }>
  importFormat: InventoryFileFormat
  isImporting: boolean
  onBackToDashboard: () => void
  onExportFormatChange: (format: InventoryFileFormat) => void
  onExportInventory: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
  onImportFormatChange: (format: InventoryFileFormat) => void
  onOpenImportFilePicker: () => void
}

function InventoryPageHeader({
  exportFormat,
  fileInputRef,
  fileFormatOptions,
  importFormat,
  isImporting,
  onBackToDashboard,
  onExportFormatChange,
  onExportInventory,
  onImport,
  onImportFormatChange,
  onOpenImportFilePicker,
}: InventoryPageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2>Inventory</h2>
        <p className="muted">Manage ingredients, stock levels, and reorder points.</p>
      </div>
      <div className="admin-row-actions inventory-header-actions">
        <div className="inventory-action-group inventory-action-group--nav">
          <span className="inventory-action-group-title">Navigation</span>
          <Button variant="outline" onClick={onBackToDashboard}>
            Back to Dashboard
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={DATA_FILE_ACCEPT[importFormat]}
          style={{ display: 'none' }}
          onChange={onImport}
        />
        <div className="inventory-action-group">
          <span className="inventory-action-group-title">Export</span>
          <div className="inventory-action-controls">
            <FileFormatAction
              actionLabel="Export Inventory"
              format={exportFormat}
              options={fileFormatOptions}
              onAction={onExportInventory}
              onFormatChange={onExportFormatChange}
            />
          </div>
        </div>
        <div className="inventory-action-group">
          <span className="inventory-action-group-title">Import</span>
          <div className="inventory-action-controls">
            <FileFormatAction
              actionLabel={isImporting ? 'Importing...' : 'Import File'}
              disabled={isImporting}
              format={importFormat}
              options={fileFormatOptions}
              onAction={onOpenImportFilePicker}
              onFormatChange={onImportFormatChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryPageHeader

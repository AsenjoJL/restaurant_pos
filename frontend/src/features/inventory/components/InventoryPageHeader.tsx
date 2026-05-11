import type { ChangeEvent, MouseEvent, RefObject, ReactNode } from 'react'
import Button from '../../../shared/components/ui/Button'
import type { InventoryFileFormat } from '../inventory.export'

type InventoryPageHeaderProps = {
  fileInputRef: RefObject<HTMLInputElement | null>
  fileFormatOptions: Array<{ value: InventoryFileFormat; label: string }>
  isImporting: boolean
  onBackToDashboard: () => void
  onDownloadTemplate: (format: InventoryFileFormat) => void
  onExportInventory: (format: InventoryFileFormat) => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
  onOpenImportFilePicker: (format: InventoryFileFormat) => void
}

type InventoryActionMenuProps = {
  children: ReactNode
  disabled?: boolean
  label: string
}

const closeMenu = (event: MouseEvent<HTMLButtonElement>) => {
  const menu = event.currentTarget.closest('details') as HTMLDetailsElement | null
  menu?.removeAttribute('open')
}

function InventoryActionMenu({
  children,
  disabled = false,
  label,
}: InventoryActionMenuProps) {
  return (
    <details className="inventory-action-menu">
      <summary
        className={`btn btn-outline btn-md inventory-action-menu-trigger${disabled ? ' is-disabled' : ''}`}
        aria-disabled={disabled}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault()
          }
        }}
      >
        <span className="btn-label">{label}</span>
        <span className="material-symbols-rounded btn-icon" aria-hidden="true">
          expand_more
        </span>
      </summary>
      <div className="inventory-action-menu-panel">{children}</div>
    </details>
  )
}

function InventoryPageHeader({
  fileInputRef,
  fileFormatOptions,
  isImporting,
  onBackToDashboard,
  onDownloadTemplate,
  onExportInventory,
  onImport,
  onOpenImportFilePicker,
}: InventoryPageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h2>Inventory</h2>
        <p className="muted">Manage ingredients, stock levels, and reorder points.</p>
      </div>
      <div className="admin-row-actions inventory-header-actions">
        <Button variant="outline" onClick={onBackToDashboard}>
          Back to Dashboard
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.json"
          style={{ display: 'none' }}
          onChange={onImport}
        />
        <InventoryActionMenu label="Export Inventory">
          <div className="inventory-action-menu-section">
            <span className="inventory-action-menu-title">File type</span>
            {fileFormatOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className="inventory-action-menu-item"
                onClick={(event) => {
                  closeMenu(event)
                  onExportInventory(option.value)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </InventoryActionMenu>
        <InventoryActionMenu
          label={isImporting ? 'Importing...' : 'Import Inventory'}
          disabled={isImporting}
        >
          <div className="inventory-action-menu-section">
            <span className="inventory-action-menu-title">Import file</span>
            {fileFormatOptions.map((option) => (
              <button
                key={`import-${option.value}`}
                type="button"
                className="inventory-action-menu-item"
                onClick={(event) => {
                  closeMenu(event)
                  onOpenImportFilePicker(option.value)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="inventory-action-menu-section">
            <span className="inventory-action-menu-title">Download template</span>
            {fileFormatOptions.map((option) => (
              <button
                key={`template-${option.value}`}
                type="button"
                className="inventory-action-menu-item"
                onClick={(event) => {
                  closeMenu(event)
                  onDownloadTemplate(option.value)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </InventoryActionMenu>
      </div>
    </div>
  )
}

export default InventoryPageHeader

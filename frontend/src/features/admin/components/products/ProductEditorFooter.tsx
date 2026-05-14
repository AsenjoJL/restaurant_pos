type ProductEditorFooterProps = {
  isSaving: boolean
  onClear: () => void
  onClose: () => void
  onSave: () => void
}

function ProductEditorFooter({
  isSaving,
  onClear,
  onClose,
  onSave,
}: ProductEditorFooterProps) {
  return (
    <div className="product-editor-footer">
      <button
        type="button"
        onClick={onClear}
        className="product-editor-footer-btn product-editor-footer-btn--ghost"
      >
        Clear
      </button>
      <div className="product-editor-footer-actions">
        <button
          type="button"
          onClick={onClose}
          className="product-editor-footer-btn product-editor-footer-btn--ghost"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className={`product-editor-footer-btn product-editor-footer-btn--primary${
            isSaving ? ' is-saving' : ''
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  )
}

export default ProductEditorFooter

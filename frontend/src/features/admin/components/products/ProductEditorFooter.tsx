import { productEditorStyles } from './productEditor.styles'

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
    <div style={productEditorStyles.modalFooter}>
      <button
        type="button"
        onClick={onClear}
        style={{
          ...productEditorStyles.footerButton,
          backgroundColor: '#ffffff',
          border: '1px solid #b5b5b5',
          color: '#000000',
        }}
      >
        Clear
      </button>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            ...productEditorStyles.footerButton,
            backgroundColor: 'white',
            border: '1px solid #b5b5b5',
            color: '#000000',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          style={{
            ...productEditorStyles.footerButton,
            backgroundColor: isSaving ? '#7f7f7f' : '#234d3b',
            border: '1px solid',
            borderColor: isSaving ? '#7f7f7f' : '#234d3b',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            color: 'white',
            fontWeight: '700',
          }}
        >
          {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  )
}

export default ProductEditorFooter

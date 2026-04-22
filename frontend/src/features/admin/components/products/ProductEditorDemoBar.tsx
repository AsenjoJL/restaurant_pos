import type { DemoProductKey } from '../../admin.product-demos'
import { productEditorStyles } from './productEditor.styles'

type ProductEditorDemoBarProps = {
  isVisible: boolean
  onLoadDemoProduct: (key: DemoProductKey) => void
}

function ProductEditorDemoBar({
  isVisible,
  onLoadDemoProduct,
}: ProductEditorDemoBarProps) {
  if (!isVisible) {
    return null
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
          Demo Products:
        </span>
        <button
          type="button"
          onClick={() => onLoadDemoProduct('espresso')}
          style={productEditorStyles.pillButton}
        >
          Espresso
        </button>
        <button
          type="button"
          onClick={() => onLoadDemoProduct('cheeseburger')}
          style={productEditorStyles.pillButton}
        >
          Cheeseburger
        </button>
      </div>
    </div>
  )
}

export default ProductEditorDemoBar

import type { DemoProductKey } from '../../admin.product-demos'

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
    <div className="product-editor-demo-bar">
      <div className="product-editor-demo-row">
        <span className="product-editor-demo-label">
          Demo Products:
        </span>
        <button
          type="button"
          onClick={() => onLoadDemoProduct('espresso')}
          className="product-editor-pill-btn"
        >
          Espresso
        </button>
        <button
          type="button"
          onClick={() => onLoadDemoProduct('cheeseburger')}
          className="product-editor-pill-btn"
        >
          Cheeseburger
        </button>
      </div>
    </div>
  )
}

export default ProductEditorDemoBar

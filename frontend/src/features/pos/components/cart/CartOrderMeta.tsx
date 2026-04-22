type CartOrderMetaProps = {
  orderId: string
  staffName: string
}

function CartOrderMeta({ orderId, staffName }: CartOrderMetaProps) {
  return (
    <div className="order-header">
      <div>
        <p className="muted">Order</p>
        <h3>{orderId}</h3>
      </div>
      <div>
        <p className="muted">Staff</p>
        <span className="chip">{staffName}</span>
      </div>
    </div>
  )
}

export default CartOrderMeta

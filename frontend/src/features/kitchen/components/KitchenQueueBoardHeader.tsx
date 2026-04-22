type KitchenQueueBoardHeaderProps = {
  now: Date
}

function KitchenQueueBoardHeader({ now }: KitchenQueueBoardHeaderProps) {
  return (
    <header className="kds-board-header">
      <div>
        <h1>Kitchen Display System</h1>
        <p>Live production board for customer pickup and front-of-house coordination</p>
      </div>
      <div className="kds-board-clock">
        <strong>{now.toLocaleTimeString()}</strong>
        <span>{now.toLocaleDateString()}</span>
      </div>
    </header>
  )
}

export default KitchenQueueBoardHeader

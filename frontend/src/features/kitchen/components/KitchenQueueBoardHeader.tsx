type KitchenQueueBoardHeaderProps = {
  now: Date
}

function KitchenQueueBoardHeader({ now }: KitchenQueueBoardHeaderProps) {
  return (
    <header className="kds-board-header">
      <div>
        <h1>Kitchen Display System</h1>
      </div>
      <div className="kds-board-clock">
        <strong>{now.toLocaleTimeString()}</strong>
        <span>{now.toLocaleDateString()}</span>
      </div>
    </header>
  )
}

export default KitchenQueueBoardHeader

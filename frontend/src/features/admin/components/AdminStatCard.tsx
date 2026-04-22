type AdminStatCardProps = {
  label: string
  value: string
  helper?: string
  icon?: string
}

function AdminStatCard({ label, value, helper, icon }: AdminStatCardProps) {
  return (
    <div className="panel admin-stat-card">
      {icon ? (
        <span className="stat-icon" aria-hidden="true">
          <img className="admin-stat-icon-img" src={icon} alt="" />
        </span>
      ) : null}
      <span className="muted">{label}</span>
      <h3>{value}</h3>
      {helper ? <p className="muted">{helper}</p> : null}
    </div>
  )
}

export default AdminStatCard

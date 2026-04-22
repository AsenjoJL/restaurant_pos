import { Link } from 'react-router-dom'

type AdminQuickLinkCardProps = {
  title: string
  description: string
  to: string
  icon?: string
}

function AdminQuickLinkCard({ title, description, to, icon }: AdminQuickLinkCardProps) {
  return (
    <Link className="admin-quick-link" to={to}>
      {icon ? (
        <span className="link-icon" aria-hidden="true">
          <img className="admin-quick-link-icon-img" src={icon} alt="" />
        </span>
      ) : null}
      <h4>{title}</h4>
      <p className="muted">{description}</p>
    </Link>
  )
}

export default AdminQuickLinkCard

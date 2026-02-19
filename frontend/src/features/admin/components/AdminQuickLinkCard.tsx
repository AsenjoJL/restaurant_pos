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
        <span className="material-symbols-rounded link-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <h4>{title}</h4>
      <p className="muted">{description}</p>
    </Link>
  )
}

export default AdminQuickLinkCard

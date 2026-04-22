import AdminQuickLinkCard from './AdminQuickLinkCard'

type AdminQuickLinksGridProps = {
  links: ReadonlyArray<{
    description: string
    icon?: string
    title: string
    to: string
  }>
}

function AdminQuickLinksGrid({ links }: AdminQuickLinksGridProps) {
  return (
    <div className="admin-quick-links">
      {links.map((link) => (
        <AdminQuickLinkCard
          key={link.to}
          title={link.title}
          description={link.description}
          to={link.to}
          icon={link.icon}
        />
      ))}
    </div>
  )
}

export default AdminQuickLinksGrid

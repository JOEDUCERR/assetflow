import { Link } from 'react-router-dom'

export default function DashboardLayout({
  eyebrow,
  title,
  subtitle,
  backTo,
  actions,
  children,
}) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          {backTo && (
            <Link to={backTo} className="back-link dashboard-back">
              ← Back
            </Link>
          )}
          {eyebrow && <p className="dashboard-eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {children}
    </div>
  )
}

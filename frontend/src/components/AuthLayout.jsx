import { Link } from 'react-router-dom'

export default function AuthLayout({ title, subtitle, children, backTo = '/' }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to={backTo} className="back-link">
          ← Back
        </Link>

        <div className="auth-brand">
          <div className="brand-mark">AF</div>
          <div>
            <p className="brand-name">AssetFlow</p>
            <p className="brand-tagline">Asset tracking made simple</p>
          </div>
        </div>

        <header className="auth-header">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </header>

        {children}
      </div>
    </div>
  )
}
